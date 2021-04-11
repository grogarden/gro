import {readFileSync} from 'fs';
import {join} from 'path';
import {createFilter} from '@rollup/pluginutils';

import {
	GITIGNORE_FILENAME,
	GIT_DIRNAME,
	NODE_MODULES_DIRNAME,
	SVELTE_KIT_DEV_DIRNAME,
} from '../paths.js';
import {stripStart} from '../utils/string.js';
import type {FileFilter} from '../fs/file.js';

/*

This only handles the `gitignore` for the current working directory.

If we need support for Gro simultaneously, see ./packageJson.ts as an example.

*/

let filter: FileFilter | null = null;

const DEFAULT_IGNORED_PATHS = [
	GIT_DIRNAME,
	SVELTE_KIT_DEV_DIRNAME,
	NODE_MODULES_DIRNAME,
	'.DS_Store',
];

// TODO need some mapping to match gitignore behavior correctly with nested directories
export const loadGitignoreFilter = (forceRefresh = false): FileFilter => {
	if (forceRefresh) filter = null;
	if (filter) return filter;
	let lines: string[];
	try {
		const gitignore = readFileSync(GITIGNORE_FILENAME, 'utf8');
		lines = gitignore
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		lines.push(GIT_DIRNAME); // special lil case
	} catch (err) {
		lines = DEFAULT_IGNORED_PATHS;
	}
	filter = createFilter(lines.map((line) => toPattern(line)));
	return filter;
};

export const isGitignored = (path: string, root = process.cwd(), forceRefresh?: boolean) =>
	loadGitignoreFilter(forceRefresh)(join(root, path));

// TODO what's the better way to do this? quick hacky mapping for one use case between
// [picomatch](https://github.com/micromatch/picomatch) and `.gitignore`
const toPattern = (line: string): string => stripStart(line, '/');
