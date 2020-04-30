import {sep, join} from 'path';
import {fileURLToPath} from 'url';

import {replaceExt} from './utils/path.js';
import {stripStart} from './utils/string.js';

/*

A path `id` is an absolute path to the source/build/dist directory.
It's the same nomenclature that Rollup uses.

A `basePath` is the format used by `CheapWatch`.
It's a bare relative path without a source or build directory,
e.g. 'foo/bar.ts'.

`CheapWatch` also uses an array of `pathParts`.
For path './foo/bar/baz.ts',
the `pathParts` are `['foo', 'foo/bar', 'foo/bar/baz.ts']`.

*/

// TODO pass these to `createPaths` and override from gro config
// TODO this is kinda gross - do we want to maintain the convention to have the trailing slash in most usage?
export const SOURCE_DIR_NAME = 'src';
export const BUILD_DIR_NAME = 'build';
export const DIST_DIR_NAME = 'dist';
export const SOURCE_DIR = SOURCE_DIR_NAME + sep;
export const BUILD_DIR = BUILD_DIR_NAME + sep;
export const DIST_DIR = DIST_DIR_NAME + sep;

export const RELATIVE_DIR_START = '.' + sep;

export interface Paths {
	root: string;
	source: string;
	build: string;
	dist: string;
	temp: string;
}

export const createPaths = (root: string): Paths => {
	const source = join(root, SOURCE_DIR); // TODO should this be "src"? the helpers too?
	const build = join(root, BUILD_DIR);
	const dist = join(root, DIST_DIR);
	return {
		root,
		source,
		build,
		dist,
		temp: join(build, 'temp/'), // can write anything here for e.g. testing
	};
};

export const paths = createPaths(process.cwd() + sep);
export const groPaths = createPaths(
	join(fileURLToPath(import.meta.url), '../../'),
);
export const pathsFromId = (id: string): Paths =>
	isSourceId(id, groPaths) ? groPaths : paths;

export const isId = (id: string, p = paths): boolean => id.startsWith(p.root);
export const isSourceId = (id: string, p = paths): boolean =>
	id.startsWith(p.source);
export const isBuildId = (id: string, p = paths): boolean =>
	id.startsWith(p.build);
export const isDistId = (id: string, p = paths): boolean =>
	id.startsWith(p.dist);

export const toRootPath = (id: string, p = paths): string =>
	stripStart(id, p.root);

// '/home/me/app/build/foo/bar/baz.js' -> 'foo/bar/baz.js'
// '/home/me/app/src/foo/bar/baz.ts' -> 'foo/bar/baz.ts'
export const toBasePath = (id: string, p = paths): string =>
	stripStart(stripStart(stripStart(id, p.build), p.source), p.dist);

// '/home/me/app/build/foo/bar/baz.js' -> 'src/foo/bar/baz.ts'
export const toSourcePath = (id: string, p = paths): string =>
	isSourceId(id, p)
		? stripStart(id, p.root)
		: toSourceExt(join(SOURCE_DIR, toBasePath(id, p)));

// '/home/me/app/src/foo/bar/baz.ts' -> 'build/foo/bar/baz.js'
export const toBuildPath = (id: string, p = paths): string =>
	isBuildId(id, p)
		? stripStart(id, p.root)
		: isDistId(id, p)
		? join(BUILD_DIR, toBasePath(id, p))
		: toCompiledExt(join(BUILD_DIR, toBasePath(id, p)));

// '/home/me/app/src/foo/bar/baz.ts' -> 'dist/foo/bar/baz.js'
export const toDistPath = (id: string, p = paths): string =>
	isDistId(id, p)
		? stripStart(id, p.root)
		: isBuildId(id, p)
		? join(DIST_DIR, toBasePath(id, p))
		: toCompiledExt(join(DIST_DIR, toBasePath(id, p)));

// '/home/me/app/build/foo/bar/baz.js' -> '/home/me/app/src/foo/bar/baz.ts'
export const toSourceId = (id: string, p = paths): string =>
	isSourceId(id, p) ? id : join(p.root, toSourcePath(id, p));

// '/home/me/app/src/foo/bar/baz.ts' -> '/home/me/app/build/foo/bar/baz.js'
export const toBuildId = (id: string, p = paths): string =>
	isBuildId(id, p) ? id : join(p.root, toBuildPath(id, p));

// '/home/me/app/src/foo/bar/baz.ts' -> '/home/me/app/dist/foo/bar/baz.js'
export const toDistId = (id: string, p = paths): string =>
	isDistId(id, p) ? id : join(p.root, toDistPath(id, p));

// 'foo/bar/baz.ts' -> '/home/me/app/src/foo/bar/baz.ts'
export const basePathToSourceId = (basePath: string, p = paths): string =>
	join(p.source, basePath);

// 'foo/bar/baz.js' -> '/home/me/app/build/foo/bar/baz.js'
export const basePathToBuildId = (basePath: string, p = paths): string =>
	join(p.build, basePath);

// 'foo/bar/baz.js' -> '/home/me/app/dist/foo/bar/baz.js'
export const basePathToDistId = (basePath: string, p = paths): string =>
	join(p.dist, basePath);

export const stripRelativePath = (path: string): string =>
	stripStart(path, RELATIVE_DIR_START);

export const JS_EXT = '.js';
export const TS_EXT = '.ts';
export const SVELTE_EXT = '.svelte';
export const SOURCE_EXTS = [TS_EXT, SVELTE_EXT];

export const hasSourceExt = (path: string): boolean =>
	SOURCE_EXTS.some(ext => path.endsWith(ext));

export const toSourceExt = (path: string): string =>
	path.endsWith(JS_EXT) ? replaceExt(path, TS_EXT) : path; // TODO? how does this work with `.svelte`? do we need more metadata?

// compiled includes both build and dist
export const toCompiledExt = (path: string): string =>
	hasSourceExt(path) ? replaceExt(path, JS_EXT) : path;

// Gets the individual parts of a path, ignoring dots and separators.
// toPathSegments('/foo/bar/baz.ts') => ['foo', 'bar', 'baz.ts']
export const toPathSegments = (path: string): string[] =>
	path.split(sep).filter(s => s && s !== '.');

// Designed for the `cheap-watch` API.
// toPathParts('./foo/bar/baz.ts') => ['foo', 'foo/bar', 'foo/bar/baz.ts']
export const toPathParts = (path: string): string[] => {
	const segments = toPathSegments(path);
	let currentPath = path[0] === sep ? sep : '';
	return segments.map(segment => {
		if (!currentPath || currentPath === sep) {
			currentPath += segment;
		} else {
			currentPath += sep + segment;
		}
		return currentPath;
	});
};

// Can be used to map a source id from e.g. the cwd to gro's.
export const replaceRootDir = (
	id: string,
	rootDir: string,
	p = paths,
): string => join(rootDir, toRootPath(id, p));
