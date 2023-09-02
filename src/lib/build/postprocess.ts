import {join, extname, relative} from 'node:path';
import * as lexer from 'es-module-lexer';
import type {Assignable} from '@feltjs/util/types.js';

import {
	paths,
	JS_EXTENSION,
	toBuildExtension,
	TS_EXTENSION,
	isThisProjectGro,
	type BuildId,
} from '../path/paths.js';
import type {BuildContext, BuildSource} from './builder.js';
import {isExternalModule, MODULE_PATH_LIB_PREFIX, MODULE_PATH_SRC_PREFIX} from '../path/module.js';
import type {BuildDependency} from './buildDependency.js';
import type {BuildFile} from './buildFile.js';

export interface Postprocess {
	(buildFile: BuildFile, ctx: BuildContext, source: BuildSource): Promise<void>;
}

// TODO refactor the TypeScript- and Svelte-specific postprocessing into the builders
// so this remains generic (maybe remove this completely and just have helpers)

// Mutates `buildFile` with possibly new `content` and `dependencies`.
// Defensively clone if upstream clone doesn't want mutation.
export const postprocess: Postprocess = async (buildFile, ctx, source) => {
	if (buildFile.encoding !== 'utf8') return;

	const {dir, extension, content: originalContent} = buildFile;

	let content = originalContent;
	let dependencies: Map<BuildId, BuildDependency> | null = null;

	const handleSpecifier: HandleSpecifier = (specifier) => {
		const buildDependency = toBuildDependency(specifier, dir, source, ctx);
		if (dependencies === null) dependencies = new Map();
		if (!dependencies.has(buildDependency.buildId)) {
			dependencies.set(buildDependency.buildId, buildDependency);
		}
		return buildDependency;
	};

	// Map import paths to the built versions.
	if (extension === JS_EXTENSION) {
		content = parseJsDependencies(content, handleSpecifier, true);
	}

	(buildFile as Assignable<BuildFile, 'content'>).content = content;
	(buildFile as Assignable<BuildFile, 'dependencies'>).dependencies = dependencies;
};

interface HandleSpecifier {
	(specifier: string): BuildDependency;
}

const parseJsDependencies = (
	content: string,
	handleSpecifier: HandleSpecifier,
	mapDependencies: boolean,
): string => {
	let transformedContent = '';
	let index = 0;
	// `lexer.init` is expected to be awaited elsewhere before `postprocess` is called
	// TODO what should we pass as the second arg to parse? the id? nothing? `lexer.parse(code, id);`
	const [imports] = lexer.parse(content);
	let start: number;
	let end: number;
	let backticked = false;
	for (const {s, e, d} of imports) {
		if (d > -1) {
			const firstChar = content[s];
			if (firstChar === '`') {
				// allow template strings, but not interpolations -- see code ahead
				backticked = true;
			} else if (firstChar !== `'` && firstChar !== '"') {
				// ignore non-literals
				continue;
			}
			start = s + 1;
			end = e - 1;
		} else {
			start = s;
			end = e;
		}
		const specifier = content.substring(start, end);
		if (backticked) {
			backticked = false;
			if (specifier.includes('${')) continue;
		}
		if (specifier === 'import.meta') continue;
		const buildDependency = handleSpecifier(specifier);
		if (mapDependencies && buildDependency.mappedSpecifier !== specifier) {
			transformedContent += content.substring(index, start) + buildDependency.mappedSpecifier;
			index = end;
		}
	}
	if (mapDependencies) {
		if (index > 0) {
			return transformedContent + content.substring(index);
		}
		return content;
	}
	return '';
};

const toBuildDependency = (
	specifier: string,
	dir: string,
	source: BuildSource,
	{dev}: BuildContext,
): BuildDependency => {
	let buildId: BuildId;
	let finalSpecifier = specifier;
	const external = isExternalModule(specifier); // TODO should this be tracked?
	let mappedSpecifier: string;
	if (external) {
		mappedSpecifier = hack_to_sveltekit_import_shims(toBuildExtension(specifier), dev);
		// TODO is this needed?
		finalSpecifier = hack_to_sveltekit_import_shims(finalSpecifier, dev);
		buildId = mappedSpecifier;
	} else {
		// internal import
		finalSpecifier = toRelativeSpecifier(finalSpecifier, source.dir, paths.source);
		mappedSpecifier = hack_to_build_extension_with_possibly_extensionless_specifier(finalSpecifier);
		buildId = join(dir, mappedSpecifier);
	}
	return {
		specifier: finalSpecifier,
		mappedSpecifier,
		originalSpecifier: specifier,
		buildId,
		external,
	};
};

// Maps absolute `$lib/` and `src/` imports to relative specifiers.
const toRelativeSpecifier = (specifier: string, dir: string, sourceDir: string): string => {
	if (specifier.startsWith(MODULE_PATH_LIB_PREFIX)) {
		return toRelativeSpecifierTrimmedBy(1, specifier, dir, sourceDir);
	} else if (specifier.startsWith(MODULE_PATH_SRC_PREFIX)) {
		return toRelativeSpecifierTrimmedBy(3, specifier, dir, sourceDir);
	}
	return specifier;
};

const toRelativeSpecifierTrimmedBy = (
	charsToTrim: number,
	specifier: string,
	dir: string,
	sourceDir: string,
): string => {
	const s = relative(dir, sourceDir + specifier.substring(charsToTrim));
	return s.startsWith('.') ? s : './' + s;
};

// This is a temporary hack to allow importing `to/thing` as equivalent to `to/thing.js`,
// despite it being off-spec, because of this combination of problems with TypeScript and Vite:
// https://github.com/feltjs/gro/pull/186
// The main problem this causes is breaking the ability to infer file extensions automatically,
// because now we can't extract the extension from a user-provided specifier. Gack!
// Exposing this hack to user config is something that's probably needed,
// but we'd much prefer to remove it completely, and force internal import paths to conform to spec.
const hack_to_build_extension_with_possibly_extensionless_specifier = (
	specifier: string,
): string => {
	const extension = extname(specifier);
	return !extension || !HACK_EXTENSIONLESS_EXTENSIONS.has(extension)
		? specifier + JS_EXTENSION
		: toBuildExtension(specifier);
};

// This hack is needed so we treat imports like `foo.task` as `foo.task.js`, not a `.task` file.
const HACK_EXTENSIONLESS_EXTENSIONS = new Set([JS_EXTENSION, TS_EXTENSION]);

// TODO substitutes SvelteKit-specific paths for Gro's mocked version for testing purposes.
// should extract this so it's configurable. (this whole module is hacky and needs rethinking)
const hack_to_sveltekit_import_shims = (specifier: string, dev: boolean): string =>
	dev && sveltekitMockedSpecifiers.has(specifier)
		? sveltekitMockedSpecifiers.get(specifier)!
		: specifier;

const to_sveltekit_shim_specifier = (filename: string) =>
	(isThisProjectGro ? '../../util/' : '@feltjs/gro/util/') + filename;

const sveltekitMockedSpecifiers = new Map([
	['$app/environment', to_sveltekit_shim_specifier('sveltekit_shim_app_environment.js')],
	['$app/forms', to_sveltekit_shim_specifier('sveltekit_shim_app_forms.js')],
	['$app/navigation', to_sveltekit_shim_specifier('sveltekit_shim_app_navigation.js')],
	['$app/paths', to_sveltekit_shim_specifier('sveltekit_shim_app_paths.js')],
	['$app/stores', to_sveltekit_shim_specifier('sveltekit_shim_app_stores.js')],
]);
