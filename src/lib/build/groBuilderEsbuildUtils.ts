import type esbuild from 'esbuild';

import {DEFAULT_ECMA_SCRIPT_TARGET} from '../build/buildConfigDefaults.js';
import type {EcmaScriptTarget} from './helpers.js';

// TODO remove all of this and the related code

export interface EsbuildTransformOptions extends esbuild.TransformOptions {
	target: EcmaScriptTarget;
}

export const toDefaultEsbuildOptions = (
	dev: boolean,
	target: EcmaScriptTarget = DEFAULT_ECMA_SCRIPT_TARGET,
	sourcemap = dev,
): EsbuildTransformOptions => ({
	target,
	sourcemap,
	format: 'esm',
	loader: 'ts',
	charset: 'utf8',
	tsconfigRaw: {compilerOptions: {importsNotUsedAsValues: 'remove'}},
});

export const toDefaultEsbuildBundleOptions = (
	dev: boolean,
	target: EcmaScriptTarget = DEFAULT_ECMA_SCRIPT_TARGET,
	sourcemap = dev,
): esbuild.BuildOptions => ({
	target,
	sourcemap,
	format: 'esm',
	charset: 'utf8',
});
