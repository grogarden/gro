import {resolve, extname, join} from 'path';
import lexer from 'es-module-lexer';

import {FilerDir, FilerDirChangeCallback, createFilerDir} from '../build/FilerDir.js';
import {isBareImport, MapBuildIdToSourceId, mapBuildIdToSourceId} from './utils.js';
import {findFiles, remove, outputFile, pathExists, readJson} from '../fs/nodeFs.js';
import {JSON_EXTENSION, JS_EXTENSION, paths, toBuildOutPath} from '../paths.js';
import {nulls, omitUndefined} from '../utils/object.js';
import {UnreachableError} from '../utils/error.js';
import {Logger, SystemLogger} from '../utils/log.js';
import {gray, magenta, red, blue} from '../colors/terminal.js';
import {printError, printPath} from '../utils/print.js';
import type {Build, Builder, BuilderState, BuildResult} from './builder.js';
import {Encoding, inferEncoding} from '../fs/encoding.js';
import {BuildConfig, printBuildConfig} from '../config/buildConfig.js';
import {EcmaScriptTarget, DEFAULT_ECMA_SCRIPT_TARGET} from './tsBuildHelpers.js';
import {ServedDir, ServedDirPartial, toServedDirs} from './ServedDir.js';
import {
	assertBuildableExternalsSourceFile,
	BuildableExternalsSourceFile,
	BuildableSourceFile,
	createSourceFile,
	SourceFile,
} from './sourceFile.js';
import {
	BuildFile,
	COMMON_SOURCE_ID,
	createBuildFile,
	DependencyInfo,
	diffDependencies,
} from './buildFile.js';
import {BaseFilerFile, getFileContentsHash} from './baseFilerFile.js';
import {loadContents} from './load.js';

/*

The `Filer` is at the heart of the build system.

The `Filer` wholly owns its `buildRootDir`, `./.gro` by default.
If any files or directories change inside it without going through the `Filer`,
it may go into a corrupted state.
Corrupted states can be fixed by turning off the `Filer` and running `gro clean`.

*/

export type FilerFile = SourceFile | BuildFile; // TODO or `Directory`?

export interface CachedSourceInfoData {
	readonly sourceId: string;
	readonly external: boolean;
	readonly contentsHash: string;
	readonly builds: {
		readonly id: string;
		readonly name: string;
		readonly dependencies: string[] | null;
		readonly encoding: Encoding;
	}[];
}
export interface CachedSourceInfo {
	readonly cacheId: string; // path to the cached JSON file on disk
	readonly data: CachedSourceInfoData; // the plain JSON written to disk
}
const CACHED_SOURCE_INFO_DIR = 'src'; // so `/.gro/src/` is metadata for `/src`

export interface Options {
	dev: boolean;
	builder: Builder | null;
	sourceDirs: string[];
	servedDirs: ServedDir[];
	buildConfigs: BuildConfig[] | null;
	buildRootDir: string;
	mapBuildIdToSourceId: MapBuildIdToSourceId;
	sourceMap: boolean;
	target: EcmaScriptTarget;
	watch: boolean;
	watcherDebounce: number | undefined;
	cleanOutputDirs: boolean;
	log: Logger;
}
export type InitialOptions = OmitStrict<Partial<Options>, 'servedDirs'> & {
	servedDirs?: ServedDirPartial[];
};
export const initOptions = (opts: InitialOptions): Options => {
	const dev = opts.dev ?? true;
	const buildConfigs = opts.buildConfigs || null;
	if (buildConfigs?.length === 0) {
		throw Error(
			'Filer created with an empty array of buildConfigs.' +
				' Omit the value or provide `null` if this was intended.',
		);
	}
	const buildRootDir = opts.buildRootDir || paths.build; // TODO assumes trailing slash
	const sourceDirs = opts.sourceDirs ? opts.sourceDirs.map((d) => resolve(d)) : [];
	validateDirs(sourceDirs);
	const servedDirs = toServedDirs(
		opts.servedDirs ||
			(buildConfigs === null
				? []
				: [
						// default to a best guess
						toBuildOutPath(
							dev,
							(
								buildConfigs.find((c) => c.platform === 'browser' && c.primary) ||
								buildConfigs.find((c) => c.platform === 'browser') ||
								buildConfigs.find((c) => c.primary)!
							).name,
							'',
							buildRootDir,
						),
				  ]),
	);
	if (sourceDirs.length === 0 && servedDirs.length === 0) {
		throw Error('Filer created with no directories to build or serve.');
	}
	if (sourceDirs.length !== 0 && buildConfigs === null) {
		throw Error('Filer created with directories to build but no build configs were provided.');
	}
	const builder = opts.builder || null;
	if (sourceDirs.length !== 0 && !builder) {
		throw Error('Filer created with directories to build but no builder was provided.');
	}
	if (builder && sourceDirs.length === 0) {
		throw Error('Filer created with a builder but no directories to build.');
	}
	return {
		dev,
		mapBuildIdToSourceId,
		sourceMap: true,
		target: DEFAULT_ECMA_SCRIPT_TARGET,
		watch: true,
		watcherDebounce: undefined,
		cleanOutputDirs: true,
		...omitUndefined(opts),
		log: opts.log || new SystemLogger([magenta('[filer]')]),
		builder,
		sourceDirs,
		servedDirs,
		buildConfigs,
		buildRootDir,
	};
};

export class Filer {
	private readonly files: Map<string, FilerFile> = new Map();
	private readonly dirs: FilerDir[];
	private readonly cachedSourceInfo: Map<string, CachedSourceInfo> = new Map();
	private readonly buildConfigs: BuildConfig[] | null;
	private readonly mapBuildIdToSourceId: MapBuildIdToSourceId;
	private readonly log: Logger;

	// public properties available to e.g. builders and postprocessors
	readonly buildRootDir: string;
	readonly dev: boolean;
	readonly sourceMap: boolean;
	readonly target: EcmaScriptTarget;
	readonly servedDirs: readonly ServedDir[];
	readonly state: BuilderState = {};
	readonly buildingSourceFiles: Set<string> = new Set();

	constructor(opts: InitialOptions) {
		const {
			dev,
			builder,
			buildConfigs,
			buildRootDir,
			mapBuildIdToSourceId,
			sourceDirs,
			servedDirs,
			sourceMap,
			target,
			watch,
			watcherDebounce,
			log,
		} = initOptions(opts);
		this.dev = dev;
		this.buildConfigs = buildConfigs;
		this.buildRootDir = buildRootDir;
		this.mapBuildIdToSourceId = mapBuildIdToSourceId;
		this.sourceMap = sourceMap;
		this.target = target;
		this.log = log;
		this.dirs = createFilerDirs(
			sourceDirs,
			servedDirs,
			builder,
			buildRootDir,
			this.onDirChange,
			watch,
			watcherDebounce,
		);
		this.servedDirs = servedDirs;
		log.trace('servedDirs', servedDirs);
	}

	// Searches for a file matching `path`, limited to the directories that are served.
	async findByPath(path: string): Promise<BaseFilerFile | null> {
		const {files} = this;
		for (const servedDir of this.servedDirs) {
			const id = `${servedDir.servedAt}/${path}`;
			this.log.trace(`findByPath: checking: ${id}`);
			const file = files.get(id);
			if (file !== undefined) {
				this.log.trace(`findByPath: found: ${id}`);
				return file;
			}
		}
		this.log.trace(`findByPath: not found: ${path}`);
		return null;
	}

	close(): void {
		for (const dir of this.dirs) {
			dir.close();
		}
	}

	private initializing: Promise<void> | null = null;

	async init(): Promise<void> {
		if (this.initializing) return this.initializing;
		this.log.trace(blue('init'));
		let finishInitializing: () => void;
		this.initializing = new Promise((r) => (finishInitializing = r));

		await Promise.all([this.initCachedSourceInfo(), lexer.init]);
		// this.log.trace('inited cache');

		// This initializes all files in the filer's directories, loading them into memory,
		// including files to be served, source files, and build files.
		// Initializing the dirs must be done after `this.initCachedSourceInfo`
		// because it creates source files, which need `this.cachedSourceInfo` to be populated.
		await Promise.all(this.dirs.map((dir) => dir.init()));
		// this.log.trace('inited files');

		// Now that the cached source info and source files are loaded into memory,
		// check if any source files have been deleted since the last run.
		await this.cleanCachedSourceInfo();
		// this.log.trace('cleaned');

		// This performs initial source file build, traces deps,
		// and populates the `buildConfigs` property of all source files.
		await this.initBuilds();
		// this.log.trace('inited builds');
		// this.log.info('buildConfigs', this.buildConfigs);

		// TODO check if `src/` has any conflicting dirs like `src/externals`

		// this.log.trace('initialized!');

		finishInitializing!();
	}

	private async initCachedSourceInfo(): Promise<void> {
		const cachedSourceInfoDir = `${this.buildRootDir}${CACHED_SOURCE_INFO_DIR}`;
		if (!(await pathExists(cachedSourceInfoDir))) return;
		const files = await findFiles(cachedSourceInfoDir, undefined, null);
		await Promise.all(
			Array.from(files.entries()).map(async ([path, stats]) => {
				if (stats.isDirectory()) return;
				const cacheId = `${cachedSourceInfoDir}/${path}`;
				const data: CachedSourceInfoData = await readJson(cacheId);
				this.cachedSourceInfo.set(data.sourceId, {cacheId, data});
			}),
		);
	}

	// Cached source info may be stale if any source files were moved or deleted
	// since the last time the Filer ran.
	// We can simply delete any cached info that doesn't map back to a source file.
	private async cleanCachedSourceInfo(): Promise<void> {
		let promises: Promise<void>[] | null = null;
		for (const sourceId of this.cachedSourceInfo.keys()) {
			if (!this.files.has(sourceId) && !isBareImport(sourceId)) {
				this.log.warn('deleting unknown cached source info', gray(sourceId));
				(promises || (promises = [])).push(this.deleteCachedSourceInfo(sourceId));
			}
		}
		if (promises !== null) await Promise.all(promises);
	}

	// During initialization, after all files are loaded into memory,
	// this is called to populate the `buildConfigs` property of all source files.
	// It traces the dependencies starting from each `buildConfig.input`,
	// building each input source file and populating its `buildConfigs`,
	// recursively until all dependencies have been handled.
	private async initBuilds(): Promise<void> {
		if (this.buildConfigs === null) return;

		const promises: Promise<void>[] = [];

		const filters: ((id: string) => boolean)[] = [];
		const filterBuildConfigs: BuildConfig[] = [];

		// Iterate through the build config inputs and initialize their files.
		for (const buildConfig of this.buildConfigs) {
			for (const input of buildConfig.input) {
				if (typeof input === 'function') {
					filters.push(input);
					filterBuildConfigs.push(buildConfig);
					continue;
				}
				const file = this.files.get(input);
				if (!file) {
					throw Error(`Build config ${printBuildConfig(buildConfig)} has unknown input '${input}'`);
				}
				if (file.type !== 'source') {
					throw Error(
						`Build config ${printBuildConfig(buildConfig)} has non-source input '${input}'`,
					);
				}
				if (!file.buildable) {
					throw Error(
						`Build config ${printBuildConfig(buildConfig)} has non-buildable input '${input}'`,
					);
				}
				if (!file.buildConfigs.has(buildConfig)) {
					promises.push(this.addSourceFileToBuild(file, buildConfig, true));
				}
			}
		}

		// Iterate through the files once and apply the filters to all source files.
		if (filters.length) {
			for (const file of this.files.values()) {
				if (file.type !== 'source' || file.external) continue;
				for (let i = 0; i < filters.length; i++) {
					if (filters[i](file.id)) {
						// TODO this error condition may be hit if the `filerDir` is not buildable, correct?
						// give a better error message if that's the case!
						if (!file.buildable) throw Error(`Expected file to be buildable: ${file.id}`);
						const buildConfig = filterBuildConfigs[i];
						if (!file.buildConfigs.has(buildConfig)) {
							promises.push(this.addSourceFileToBuild(file, buildConfig, true));
						}
					}
				}
			}
		}

		await Promise.all(promises);
	}

	// Adds a build config to a source file.
	// The caller is expected to check to avoid duplicates.
	private async addSourceFileToBuild(
		sourceFile: BuildableSourceFile,
		buildConfig: BuildConfig,
		isInput: boolean,
	): Promise<void> {
		this.log.trace(
			`adding source file to build ${printBuildConfig(buildConfig)}: ${gray(sourceFile.id)}`,
		);
		if (sourceFile.buildConfigs.has(buildConfig)) {
			throw Error(
				`Expected to add buildConfig for ${printBuildConfig(buildConfig)}: ${gray(sourceFile.id)}`,
			);
		}
		// Add the build config. The caller is expected to check to avoid duplicates.
		sourceFile.buildConfigs.add(buildConfig);
		// Add the build config as an input if appropriate, initializing the set if needed.
		// We need to determine `isInputToBuildConfig` independently of the caller,
		// because the caller may not
		if (isInput) {
			if (sourceFile.isInputToBuildConfigs === null) {
				// Cast to keep the `readonly` modifier outside of initialization.
				(sourceFile as Writable<
					BuildableSourceFile,
					'isInputToBuildConfigs'
				>).isInputToBuildConfigs = new Set();
			}
			sourceFile.isInputToBuildConfigs!.add(buildConfig);
		}

		// Build only if needed - build files may be hydrated from the cache.
		const hasBuildConfig = sourceFile.buildFiles.has(buildConfig);
		if (hasBuildConfig) {
			await this.hydrateSourceFileFromCache(sourceFile, buildConfig);
		}
		const {dirty} = sourceFile;
		if (!hasBuildConfig || dirty) {
			await this.buildSourceFile(sourceFile, buildConfig);
			if (dirty) sourceFile.dirty = false;
		}
	}

	// Removes a build config from a source file.
	// The caller is expected to check to avoid duplicates.
	private async removeSourceFileFromBuild(
		sourceFile: BuildableSourceFile,
		buildConfig: BuildConfig,
	): Promise<void> {
		this.log.trace(
			`removing source file from build ${printBuildConfig(buildConfig)}: ${gray(sourceFile.id)}`,
		);
		if (sourceFile.isInputToBuildConfigs?.has(buildConfig)) {
			throw Error(
				`Removing build configs from input files is not allowed: ${buildConfig}: ${sourceFile.id}`,
			);
		}

		await this.updateBuildFiles(sourceFile, [], buildConfig);

		const deleted = sourceFile.buildConfigs.delete(buildConfig);
		if (!deleted) {
			throw Error(`Expected to delete buildConfig ${buildConfig}: ${sourceFile.id}`);
		}
		const deletedBuildFiles = sourceFile.buildFiles.delete(buildConfig);
		if (!deletedBuildFiles) {
			throw Error(`Expected to delete build files ${buildConfig}: ${sourceFile.id}`);
		}
		sourceFile.dependencies.delete(buildConfig);
		sourceFile.dependents.delete(buildConfig);

		await this.updateCachedSourceInfo(sourceFile);
	}

	private onDirChange: FilerDirChangeCallback = async (change, filerDir) => {
		const id = join(filerDir.dir, change.path);
		switch (change.type) {
			case 'init':
			case 'create':
			case 'update': {
				if (change.stats.isDirectory()) {
					// We could ensure the directory, but it's usually wasted work,
					// and `fs-extra` takes care of adding missing directories when writing to disk.
				} else {
					const shouldBuild = await this.updateSourceFile(id, filerDir);
					if (
						shouldBuild &&
						// When initializing, building is deferred to `initBuilds`
						// so that deps are determined in the correct order.
						change.type !== 'init' &&
						filerDir.buildable // only needed for types, doing this instead of casting for type safety
					) {
						const file = this.files.get(id);
						if (file === undefined || file.type !== 'source' || !file.buildable) {
							throw Error(`Expected a buildable source file: ${id}`);
						}
						if (change.type === 'create') {
							await this.initSourceFile(file);
						} else {
							await Promise.all(
								Array.from(file.buildConfigs).map((buildConfig) =>
									this.buildSourceFile(file, buildConfig),
								),
							);
						}
					}
				}
				break;
			}
			case 'delete': {
				if (change.stats.isDirectory()) {
					if (this.buildConfigs !== null && filerDir.buildable) {
						// TODO This is weird because we're blindly deleting
						// the directory for all build configs,
						// whether or not they apply for this id.
						// It could be improved by tracking tracking dirs in the Filer
						// and looking up the correct build configs.
						await Promise.all(
							this.buildConfigs.map((buildConfig) =>
								remove(toBuildOutPath(this.dev, buildConfig.name, change.path, this.buildRootDir)),
							),
						);
					}
				} else {
					await this.destroySourceId(id);
				}
				break;
			}
			default:
				throw new UnreachableError(change.type);
		}
	};

	// Initialize a newly created source file's builds.
	// It currently uses a slow brute force search to find dependents.
	private async initSourceFile(file: BuildableSourceFile): Promise<void> {
		if (this.buildConfigs === null) return; // TODO is this right?
		let promises: Promise<void>[] | null = null;
		let dependentBuildConfigs: Set<BuildConfig> | null = null;
		// TODO could be sped up with some caching data structures
		for (const f of this.files.values()) {
			if (f.type !== 'source' || !f.buildable) continue;
			for (const [buildConfig, dependencies] of f.dependencies) {
				if (dependencies.has(file.id)) {
					(dependentBuildConfigs || (dependentBuildConfigs = new Set())).add(buildConfig);
				}
			}
		}
		let inputBuildConfigs: Set<BuildConfig> | null = null;
		for (const buildConfig of this.buildConfigs) {
			if (isInputToBuildConfig(file, buildConfig)) {
				(inputBuildConfigs || (inputBuildConfigs = new Set())).add(buildConfig);
				(promises || (promises = [])).push(this.addSourceFileToBuild(file, buildConfig, true));
			}
		}
		if (dependentBuildConfigs !== null) {
			for (const buildConfig of dependentBuildConfigs) {
				if (inputBuildConfigs?.has(buildConfig)) continue;
				(promises || (promises = [])).push(this.addSourceFileToBuild(file, buildConfig, false));
			}
		}
		if (promises !== null) await Promise.all(promises);
	}

	// Returns a boolean indicating if the source file should be built.
	// The source file may have been updated or created from a cold cache.
	private async updateSourceFile(id: string, filerDir: FilerDir): Promise<boolean> {
		this.log.trace(`updating source file ${gray(id)}`);
		const sourceFile = this.files.get(id);
		if (sourceFile !== undefined) {
			if (sourceFile.type !== 'source') {
				throw Error(`Expected to update a source file but got type '${sourceFile.type}': ${id}`);
			}
			if (sourceFile.filerDir !== filerDir) {
				// This can happen when watchers overlap, a file picked up by two `FilerDir`s.
				// We might be able to support this,
				// but more thought needs to be given to the exact desired behavior.
				// See `validateDirs` for more.
				throw Error(
					'Source file filerDir unexpectedly changed: ' +
						`${gray(sourceFile.id)} changed from ${sourceFile.filerDir.dir} to ${filerDir.dir}`,
				);
			}
		}

		const external = sourceFile === undefined ? isBareImport(id) : sourceFile.external;

		let extension: string;
		let encoding: Encoding;
		if (sourceFile !== undefined) {
			extension = sourceFile.extension;
			encoding = sourceFile.encoding;
		} else if (external) {
			extension = JS_EXTENSION;
			encoding = 'utf8';
		} else {
			extension = extname(id);
			encoding = inferEncoding(extension);
		}
		const newSourceContents = external
			? // TODO it may require additional changes,
			  // but the package.json version could be put here,
			  // allowing externals to update at runtime
			  ''
			: await loadContents(encoding, id);

		if (sourceFile === undefined) {
			// Memory cache is cold.
			const newSourceFile = await createSourceFile(
				id,
				encoding,
				extension,
				newSourceContents,
				filerDir,
				this.cachedSourceInfo.get(id),
				this.buildConfigs,
			);
			this.files.set(id, newSourceFile);
			// If the created source file has its build files hydrated from the cache,
			// we assume it doesn't need to be built.
			if (newSourceFile.buildable && newSourceFile.buildFiles.size !== 0) {
				return false;
			}
		} else if (areContentsEqual(encoding, sourceFile.contents, newSourceContents)) {
			// Memory cache is warm and source code hasn't changed, do nothing and exit early!
			return false;
		} else {
			// Memory cache is warm, but contents have changed.
			switch (sourceFile.encoding) {
				case 'utf8':
					sourceFile.contents = newSourceContents as string;
					sourceFile.stats = undefined;
					sourceFile.contentsBuffer = undefined;
					sourceFile.contentsHash = undefined;
					break;
				case null:
					sourceFile.contents = newSourceContents as Buffer;
					sourceFile.stats = undefined;
					sourceFile.contentsBuffer = newSourceContents as Buffer;
					sourceFile.contentsHash = undefined;
					break;
				default:
					throw new UnreachableError(sourceFile);
			}
		}
		return filerDir.buildable;
	}

	// These are used to avoid concurrent builds for any given source file.
	private pendingBuilds = new Set<string>(); // value is `buildConfig.name + sourceId`
	private enqueuedBuilds = new Set<string>(); // value is `buildConfig.name + sourceId`

	// This wrapper function protects against race conditions
	// that could occur with concurrent builds.
	// If a file is currently being build, it enqueues the file id,
	// and when the current build finishes,
	// it removes the item from the queue and rebuilds the file.
	// The queue stores at most one build per file,
	// and this is safe given that building accepts no parameters.
	private async buildSourceFile(
		sourceFile: BuildableSourceFile,
		buildConfig: BuildConfig,
	): Promise<void> {
		const key = `${printBuildConfig(buildConfig)}${gray(sourceFile.id)}`;
		if (this.pendingBuilds.has(key)) {
			this.enqueuedBuilds.add(key);
			return;
		}
		this.pendingBuilds.add(key);
		try {
			await this._buildSourceFile(sourceFile, buildConfig);
		} catch (err) {
			this.log.error(red('build failed'), gray(sourceFile.id), printError(err));
			// TODO probably want to track this failure data
		}
		this.pendingBuilds.delete(key);
		if (this.enqueuedBuilds.has(key)) {
			this.enqueuedBuilds.delete(key);
			// Something changed during the build for this file, so recurse.
			// This sequencing ensures that any awaiting callers always see the final version.
			// TODO do we need to detect cycles? if we run into any, probably
			const shouldBuild = await this.updateSourceFile(sourceFile.id, sourceFile.filerDir);
			if (shouldBuild) {
				await this.buildSourceFile(sourceFile, buildConfig);
			}
		}
	}

	private async _buildSourceFile(
		sourceFile: BuildableSourceFile,
		buildConfig: BuildConfig,
	): Promise<void> {
		this.log.info('build source file', sourceFile.id);

		this.buildingSourceFiles.add(sourceFile.id);

		// Compile the source file.
		let result: BuildResult<Build>;

		try {
			result = await sourceFile.filerDir.builder.build(sourceFile, buildConfig, this);
		} catch (err) {
			this.buildingSourceFiles.delete(sourceFile.id);
			throw err;
		}

		const newBuildFiles: readonly BuildFile[] = result.builds.map((build) =>
			createBuildFile(build, this, result, sourceFile, buildConfig),
		);

		this.buildingSourceFiles.delete(sourceFile.id);

		// Update the source file with the new build files.
		await this.updateBuildFiles(sourceFile, newBuildFiles, buildConfig);
		await this.updateCachedSourceInfo(sourceFile);
	}

	// Updates the build files in the memory cache and writes to disk.
	private async updateBuildFiles(
		sourceFile: BuildableSourceFile,
		newBuildFiles: readonly BuildFile[],
		buildConfig: BuildConfig,
	): Promise<void> {
		const oldBuildFiles = sourceFile.buildFiles.get(buildConfig) || null;
		sourceFile.buildFiles.set(buildConfig, newBuildFiles);
		// if (sourceFile.external && oldBuildFiles) {
		// 	for (const oldBuildFile of oldBuildFiles) {
		// 		if (oldBuildFile.dir === `${sourceFile.filerDir.dir}/common`) {
		// 			console.log('UH OH', oldBuildFile.dir);
		// 			const newBuildFile = newBuildFiles.find((f) => f.id === oldBuildFile.id);
		// 			if (newBuildFile !== undefined) continue;
		// 			console.log('NO NEW BUILD FILE ITS GONNA BE DELETED');
		// 			console.log('this.state.externals', this.state.externals);
		// 			setTimeout(() => {
		// 				console.log('this.state.externals', this.state.externals);
		// 			}, 3000);
		// 			// TODO if this file is not also present in the new files,
		// 			// then it needs to be removed from `oldBuildFiles` (for the later functions)
		// 			// and added to another externals source file, if one is available, and all of its data needs to be updated too.
		// 			// if one is not available, we can assume it was deleted.
		// 			// but REALLY, we want to be synced with the output of the externals calls,
		// 			// and diff what comes out, and delete commons files explicitly
		// 		}
		// 	}
		// }
		// TODO we need to move build files from externals to other valid externals ones .. right?
		// or does it not matter that we have a dangling source file?
		// diffBuildFiles(this.files, newBuildFiles, oldBuildFiles, this.log);
		syncBuildFilesToMemoryCache(this.files, newBuildFiles, oldBuildFiles);
		await this.updateDependencies(sourceFile, newBuildFiles, oldBuildFiles, buildConfig);
		await syncFilesToDisk(newBuildFiles, oldBuildFiles, this.log);
	}

	// This is like `updateBuildFiles` except
	// it's called for source files when they're being hydrated from the cache.
	// This is because the normal build process ending with `updateBuildFiles`
	// is being short-circuited for efficiency, but parts of that process are still needed.
	private async hydrateSourceFileFromCache(
		sourceFile: BuildableSourceFile,
		buildConfig: BuildConfig,
	): Promise<void> {
		const buildFiles = sourceFile.buildFiles.get(buildConfig);
		if (buildFiles === undefined) {
			throw Error(`Expected to find build files when hydrating from cache.`);
		}
		syncBuildFilesToMemoryCache(this.files, buildFiles, null);
		await this.updateDependencies(sourceFile, buildFiles, null, buildConfig);
		// TODO what if we diff here, like we're going to do with `updateBuildFiles`,
		// and use that diffed set of files to do the automatic cleaning of the .gro directory in total?
	}

	private async updateDependencies(
		sourceFile: BuildableSourceFile,
		newBuildFiles: readonly BuildFile[],
		oldBuildFiles: readonly BuildFile[] | null,
		buildConfig: BuildConfig,
	): Promise<void> {
		if (sourceFile.external) return;
		let {
			addedDependencies,
			removedDependencies,
			addedDependencySourceFiles,
			removedDependencySourceFiles,
		} = this.diffDependencies(newBuildFiles, oldBuildFiles, buildConfig) || nulls;

		// handle added dependencies
		if (addedDependencies !== null) {
			for (const addedDependency of addedDependencies) {
				// currently we don't track Node dependencies for non-browser builds
				if (!addedDependency.external && isBareImport(addedDependency.id)) continue;
				let dependencies = sourceFile.dependencies.get(buildConfig);
				if (dependencies === undefined) {
					dependencies = new Set();
					sourceFile.dependencies.set(buildConfig, dependencies);
				}
				const dependencySourceId = this.mapBuildIdToSourceId(
					addedDependency.id,
					addedDependency.external,
					this.dev,
					buildConfig,
					this.buildRootDir,
				);
				dependencies.add(dependencySourceId);

				// create external source files if needed - they're not added to `addedDependencySourceFiles` by default
				if (addedDependency.external && buildConfig.platform === 'browser') {
					const file = await this.initExternalDependencySourceFile(
						dependencySourceId,
						sourceFile.filerDir,
					);
					(addedDependencySourceFiles || (addedDependencySourceFiles = new Set())).add(file);
				}
			}
		}
		if (removedDependencies !== null) {
			for (const removedDependency of removedDependencies) {
				let dependencies = sourceFile.dependencies.get(buildConfig);
				if (dependencies === undefined) {
					throw Error(`Expected dependencies: ${printBuildConfig(buildConfig)}: ${sourceFile.id}`);
				}
				dependencies.delete(
					this.mapBuildIdToSourceId(
						removedDependency.id,
						removedDependency.external,
						this.dev,
						buildConfig,
						this.buildRootDir,
					),
				);
			}
		}

		// this `promises` pattern makes it easy to write imperative code and parallelize at the end
		let promises: Promise<void>[] | null = null;
		if (addedDependencySourceFiles !== null) {
			for (const addedDependencySourceFile of addedDependencySourceFiles) {
				let dependents = addedDependencySourceFile.dependents.get(buildConfig);
				if (dependents === undefined) {
					dependents = new Set();
					addedDependencySourceFile.dependents.set(buildConfig, dependents);
				}
				dependents.add(sourceFile);
				if (!addedDependencySourceFile.buildConfigs.has(buildConfig)) {
					(promises || (promises = [])).push(
						this.addSourceFileToBuild(
							addedDependencySourceFile,
							buildConfig,
							isInputToBuildConfig(addedDependencySourceFile, buildConfig),
						),
					);
				}
			}
		}
		if (removedDependencySourceFiles !== null) {
			for (const removedDependencySourceFile of removedDependencySourceFiles) {
				if (!removedDependencySourceFile.buildConfigs.has(buildConfig)) {
					throw Error(
						`Expected build config: ${printBuildConfig(buildConfig)}: ${
							removedDependencySourceFile.id
						}`,
					);
				}
				let dependents = removedDependencySourceFile.dependents.get(buildConfig);
				if (dependents === undefined) {
					throw Error(
						`Expected dependents: ${printBuildConfig(buildConfig)}: ${
							removedDependencySourceFile.id
						}`,
					);
				}
				dependents.delete(sourceFile);
				const isUnreferenced = dependents.size === 0;
				if (removedDependencySourceFile.external) {
					if (isUnreferenced && this.state.externals !== undefined) {
						// update specifiers
						this.state.externals.specifiers.delete(removedDependencySourceFile.id);
						// update importMap for externals
						// TODO or set to undefined? or treat as immutable?
						delete this.state.externals.importMap?.imports[removedDependencySourceFile.id];
					}
				}
				if (
					// TODO hmm maybe do this bookkeeping but don't delete externals on disk?
					// !removedDependencySourceFile.external && // TODO clean these up ever?
					isUnreferenced &&
					!removedDependencySourceFile.isInputToBuildConfigs?.has(buildConfig)
				) {
					(promises || (promises = [])).push(
						this.removeSourceFileFromBuild(removedDependencySourceFile, buildConfig),
					);
				}
			}
		}
		if (promises !== null) await Promise.all(promises); // TODO parallelize with syncing to disk below (in `updateBuildFiles()`)?
	}

	diffDependencies(
		newBuildFiles: readonly BuildFile[],
		oldBuildFiles: readonly BuildFile[] | null,
		buildConfig: BuildConfig,
	): null | {
		addedDependencies: DependencyInfo[] | null;
		removedDependencies: DependencyInfo[] | null;
		addedDependencySourceFiles: Set<BuildableSourceFile> | null;
		removedDependencySourceFiles: Set<BuildableSourceFile> | null;
	} {
		let addedDependencySourceFiles: Set<BuildableSourceFile> | null = null;
		let removedDependencySourceFiles: Set<BuildableSourceFile> | null = null;

		// After building the source file, we need to handle any dependency changes for each build file.
		// Dependencies may be added or removed,
		// and their source files need to be updated with any build config changes.
		// When a dependency is added for this build,
		// if the dependency's source file is not an input to the build config,
		// and it has 1 dependent after the build file is added,
		// they're added for this build,
		// meaning the memory cache is updated and the files are built to disk for the build config.
		// When a dependency is removed for this build,
		// if the dependency's source file is not an input to the build config,
		// and it has 0 dependents after the build file is removed,
		// they're removed for this build,
		// meaning the memory cache is updated and the files are deleted from disk for the build config.
		const {addedDependencies, removedDependencies} =
			diffDependencies(newBuildFiles, oldBuildFiles, this.dev, buildConfig, this.buildRootDir) ||
			nulls;
		if (addedDependencies !== null) {
			for (const addedDependency of addedDependencies) {
				// `external` will be false for Node imports in non-browser contexts -
				// we create no source file for them
				if (!addedDependency.external && isBareImport(addedDependency.id)) continue;
				let addedSourceFile = this.findSourceFile(
					addedDependency.id,
					addedDependency.external,
					buildConfig,
				);
				if (addedSourceFile === undefined) continue; // import might point to a nonexistent file
				if (!addedSourceFile.buildable) {
					throw Error(`Expected source file to be buildable: ${addedSourceFile.id}`);
				}
				(addedDependencySourceFiles || (addedDependencySourceFiles = new Set())).add(
					addedSourceFile,
				);
			}
		}
		if (removedDependencies !== null) {
			for (const removedDependency of removedDependencies) {
				const removedSourceFile = this.findSourceFile(
					removedDependency.id,
					removedDependency.external,
					buildConfig,
				);
				if (removedSourceFile === undefined) continue; // import might point to a nonexistent file
				if (!removedSourceFile.buildable) {
					throw Error(`Expected dependency source file to be buildable: ${removedSourceFile.id}`);
				}
				(removedDependencySourceFiles || (removedDependencySourceFiles = new Set())).add(
					removedSourceFile,
				);
			}
		}

		return addedDependencies !== null ||
			removedDependencies !== null ||
			addedDependencySourceFiles !== null ||
			removedDependencySourceFiles !== null
			? {
					addedDependencies,
					removedDependencies,
					addedDependencySourceFiles,
					removedDependencySourceFiles,
			  }
			: null;
	}

	private findSourceFile(
		buildId: string,
		external: boolean,
		buildConfig: BuildConfig,
	): SourceFile | undefined {
		const sourceId = this.mapBuildIdToSourceId(
			buildId,
			external,
			this.dev,
			buildConfig,
			this.buildRootDir,
		);
		const sourceFile = this.files.get(sourceId);
		if (sourceFile !== undefined && sourceFile.type !== 'source') {
			throw Error(
				`Expected 'source' file but found '${sourceFile.type}': ${sourceId} via buildId '${buildId}'`,
			);
		}
		return sourceFile;
	}

	private async destroySourceId(id: string): Promise<void> {
		const sourceFile = this.files.get(id);
		if (!sourceFile || sourceFile.type !== 'source') return; // ignore build files (maybe throw an error if the file isn't found, should not happen)
		this.log.trace('destroying file', gray(id));
		this.files.delete(id);
		if (sourceFile.buildable) {
			if (this.buildConfigs !== null) {
				await Promise.all(this.buildConfigs.map((b) => this.updateBuildFiles(sourceFile, [], b)));
			}
			await this.deleteCachedSourceInfo(sourceFile.id);
		}
	}

	// TODO can we remove this thing completely, treating externals like all others?
	async initExternalDependencySourceFile(
		id: string,
		filerDir: FilerDir,
	): Promise<BuildableExternalsSourceFile> {
		const sourceFile = this.files.get(id);
		if (sourceFile !== undefined) {
			assertBuildableExternalsSourceFile(sourceFile);
			return sourceFile;
		}
		this.log.trace('init external dependency', gray(id));
		await this.updateSourceFile(id, filerDir);
		const newFile = this.files.get(id);
		assertBuildableExternalsSourceFile(newFile);
		return newFile;
	}

	// TODO as an optimization, this should be debounced per file,
	// because we're writing per build config.
	private async updateCachedSourceInfo(file: BuildableSourceFile): Promise<void> {
		if (file.buildConfigs.size === 0) return this.deleteCachedSourceInfo(file.id);
		const cacheId = toCachedSourceInfoId(file, this.buildRootDir);
		const data: CachedSourceInfoData = {
			sourceId: file.id,
			external: file.external,
			contentsHash: getFileContentsHash(file),
			builds: Array.from(file.buildFiles.values()).flatMap((files) =>
				files.map((file) => ({
					id: file.id,
					name: file.buildConfig.name,
					dependencies: file.dependencies && Array.from(file.dependencies),
					encoding: file.encoding,
				})),
			),
		};
		const cachedSourceInfo: CachedSourceInfo = {cacheId, data};
		// This is useful for debugging, but has false positives
		// when source changes but output doesn't, like if comments get elided.
		// if (
		// 	(await pathExists(cacheId)) &&
		// 	deepEqual(await readJson(cacheId), cachedSourceInfo)
		// ) {
		// 	console.log(
		// 		'wasted build detected! unchanged file was built and identical source info written to disk: ' +
		// 			cacheId,
		// 	);
		// }
		this.cachedSourceInfo.set(file.id, cachedSourceInfo);
		this.log.trace('outputting cached source info', gray(file.id), 'to', printPath(cacheId));
		await outputFile(cacheId, JSON.stringify(data, null, 2));
	}

	private async deleteCachedSourceInfo(sourceId: string): Promise<void> {
		const info = this.cachedSourceInfo.get(sourceId);
		if (info === undefined) return; // silently do nothing, which is fine because it's a cache
		this.cachedSourceInfo.delete(sourceId);
		return remove(info.cacheId);
	}
}

// Given `newFiles` and `oldFiles`, updates everything on disk,
// deleting files that no longer exist, writing new ones, and updating existing ones.
const syncFilesToDisk = async (
	newFiles: readonly BuildFile[],
	oldFiles: readonly BuildFile[] | null,
	log: Logger,
): Promise<void> => {
	// This uses `Array#find` because the arrays are expected to be small,
	// because we're currently only using it for individual file builds,
	// but that assumption might change and cause this code to be slow.
	await Promise.all([
		oldFiles === null
			? null
			: Promise.all(
					oldFiles.map((oldFile) => {
						if (
							oldFile.sourceId !== COMMON_SOURCE_ID &&
							!newFiles.find((f) => f.id === oldFile.id)
						) {
							log.trace('deleting build file on disk', gray(oldFile.id));
							return remove(oldFile.id);
						}
						return null;
					}),
			  ),
		Promise.all(
			newFiles.map(async (newFile) => {
				const oldFile = oldFiles?.find((f) => f.id === newFile.id);
				let shouldOutputNewFile = false;
				if (!oldFile) {
					if (!(await pathExists(newFile.id))) {
						log.trace('creating build file on disk', gray(newFile.id));
						shouldOutputNewFile = true;
					} else {
						const existingCotents = await loadContents(newFile.encoding, newFile.id);
						if (!areContentsEqual(newFile.encoding, newFile.contents, existingCotents)) {
							log.trace('updating stale build file on disk', gray(newFile.id));
							shouldOutputNewFile = true;
						} // ...else the build file on disk already matches what's in memory.
						// This can happen if the source file changed but this particular build file did not.
						// Loading the usually-stale contents into memory to check before writing is inefficient,
						// but it avoids unnecessary writing to disk and misleadingly updated file stats.
					}
				} else if (!areContentsEqual(newFile.encoding, newFile.contents, oldFile.contents)) {
					log.trace('updating build file on disk', gray(newFile.id));
					shouldOutputNewFile = true;
				} // ...else the build file on disk already matches what's in memory.
				// This can happen if the source file changed but this particular build file did not.
				if (shouldOutputNewFile) await outputFile(newFile.id, newFile.contents);
			}),
		),
	]);
};

const toCachedSourceInfoId = (file: BuildableSourceFile, buildRootDir: string): string =>
	`${buildRootDir}${CACHED_SOURCE_INFO_DIR}/${file.dirBasePath}${file.filename}${JSON_EXTENSION}`;

// Given `newFiles` and `oldFiles`, updates the memory cache,
// deleting files that no longer exist and setting the new ones, replacing any old ones.
const syncBuildFilesToMemoryCache = (
	files: Map<string, FilerFile>,
	newFiles: readonly BuildFile[],
	oldFiles: readonly BuildFile[] | null,
): void => {
	// Remove any deleted files.
	// This uses `Array#find` because the arrays are expected to be small,
	// because we're currently only using it for individual file builds,
	// but that assumption might change and cause this code to be slow.
	if (oldFiles !== null) {
		for (const oldFile of oldFiles) {
			if (!newFiles.find((f) => f.id === oldFile.id)) {
				files.delete(oldFile.id);
			}
		}
	}
	// Add or update any new or changed files.
	for (const newFile of newFiles) {
		// log.trace('setting file in memory cache', gray(newFile.id));
		const oldFile = files.get(newFile.id) as BuildFile | undefined;
		if (oldFile !== undefined) {
			// This check ensures that if the user provides multiple source directories
			// the build output files do not conflict.
			// There may be a better design warranted, but for now the goal is to support
			// the flexibility of multiple source directories while avoiding surprising behavior.
			// Externals are the exception: they may swap files around without us caring.
			if (oldFile.sourceId !== oldFile.sourceId && !(oldFile.external && oldFile.external)) {
				throw Error(
					'Two source files are trying to build to the same output location: ' +
						`${oldFile.sourceId} & ${oldFile.sourceId}`,
				);
			}
		}
		files.set(newFile.id, newFile);
	}
};

const areContentsEqual = (encoding: Encoding, a: string | Buffer, b: string | Buffer): boolean => {
	switch (encoding) {
		case 'utf8':
			return a === b;
		case null:
			return (a as Buffer).equals(b as Buffer);
		default:
			throw new UnreachableError(encoding);
	}
};

// TODO Revisit these restrictions - the goal right now is to set limits
// to avoid undefined behavior at the cost of flexibility.
// Some of these conditions like nested sourceDirs could be fixed
// but there are inefficiencies and possibly some subtle bugs.
const validateDirs = (sourceDirs: string[]) => {
	for (const sourceDir of sourceDirs) {
		const nestedSourceDir = sourceDirs.find((d) => d !== sourceDir && sourceDir.startsWith(d));
		if (nestedSourceDir) {
			throw Error(
				'A sourceDir cannot be inside another sourceDir: ' +
					`${sourceDir} is inside ${nestedSourceDir}`,
			);
		}
	}
};

// Creates objects to load a directory's contents and sync filesystem changes in memory.
// The order of objects in the returned array is meaningless.
const createFilerDirs = (
	sourceDirs: string[],
	servedDirs: ServedDir[],
	builder: Builder | null,
	buildRootDir: string,
	onChange: FilerDirChangeCallback,
	watch: boolean,
	watcherDebounce: number | undefined,
): FilerDir[] => {
	const dirs: FilerDir[] = [];
	for (const sourceDir of sourceDirs) {
		dirs.push(createFilerDir(sourceDir, builder, onChange, watch, watcherDebounce));
	}
	for (const servedDir of servedDirs) {
		// If a `servedDir` is inside a source or externals directory,
		// it's already in the Filer's memory cache and does not need to be loaded as a directory.
		// Additionally, the same is true for `servedDir`s that are inside other `servedDir`s.
		if (
			!sourceDirs.find((d) => servedDir.dir.startsWith(d)) &&
			!servedDirs.find((d) => d !== servedDir && servedDir.dir.startsWith(d.dir)) &&
			!servedDir.dir.startsWith(buildRootDir)
		) {
			dirs.push(createFilerDir(servedDir.dir, null, onChange, watch, watcherDebounce));
		}
	}
	return dirs;
};

const isInputToBuildConfig = (
	sourceFile: BuildableSourceFile,
	buildConfig: BuildConfig,
): boolean => {
	for (const input of buildConfig.input) {
		if (typeof input === 'string' ? sourceFile.id === input : input(sourceFile.id)) {
			return true;
		}
	}
	return false;
};
