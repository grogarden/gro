import * as ts from 'typescript';
import {Plugin, PluginContext} from 'rollup';
import {createFilter} from 'rollup-pluginutils';
import {magenta, gray, red} from 'kleur';

import {timeTracker} from '../utils/timeUtils';
import {LogLevel, logger, fmtVal, fmtMs, Logger} from '../utils/logUtils';
import {toRootPath} from '../paths';
import {loadTsconfig, logTsDiagnostics} from './tsHelpers';

// TODO parallelize with workers?

// TODO improve along with Svelte compile stats
interface Stats {
	timings: {
		total: number;
		transpile?: {total: number};
	};
}

export interface Options {
	include: string | RegExp | (string | RegExp)[] | null | undefined;
	exclude: string | RegExp | (string | RegExp)[] | null | undefined;
	tsconfigPath: string | undefined;
	basePath: string | undefined;
	reportDiagnostics: boolean;
	logLevel: LogLevel;
	ondiagnostics: typeof handleDiagnostics;
	onstats: typeof handleStats;
}
export type RequiredOptions = never;
export type InitialOptions = PartialExcept<Options, RequiredOptions>;
export const initOptions = (initialOptions: InitialOptions): Options => ({
	include: ['*.ts+(|x)', '**/*.ts+(|x)'],
	exclude: ['*.d.ts', '**/*.d.ts'],
	tsconfigPath: undefined,
	basePath: undefined,
	reportDiagnostics: true, // TODO check transpilation times where this is false
	logLevel: LogLevel.Info,
	ondiagnostics: handleDiagnostics,
	onstats: handleStats,
	...initialOptions,
});

export const name = 'gro-typescript';

export const groTypescriptPlugin = (opts: InitialOptions = {}): Plugin => {
	const {
		include,
		exclude,
		tsconfigPath,
		basePath,
		reportDiagnostics,
		logLevel,
		ondiagnostics,
		onstats,
	} = initOptions(opts);

	const log = logger(logLevel, [magenta(`[${name}]`)]);
	const {error, trace} = log;

	const tsconfig = loadTsconfig(log, tsconfigPath, basePath);
	const {compilerOptions} = tsconfig;

	const filter = createFilter(include, exclude);

	return {
		name,
		async transform(code, id) {
			if (!filter(id)) return null;

			const getElapsed = timeTracker();

			trace('transpile', gray(toRootPath(id)));
			let transpileOutput: ts.TranspileOutput;
			try {
				transpileOutput = ts.transpileModule(code, {
					compilerOptions,
					fileName: id,
					reportDiagnostics,
					// moduleName?: string;
					// renamedDependencies?: Map<string>;
				});
			} catch (err) {
				error(red('Failed to transpile TypeScript'), gray(toRootPath(id)));
				throw err;
			}
			const {outputText, sourceMapText, diagnostics} = transpileOutput;

			if (diagnostics) {
				ondiagnostics(id, diagnostics, handleDiagnostics, this, log);
			}

			// TODO improve this - see usage elsewhere too
			const transpileElapsed = getElapsed();
			const stats: Stats = {
				timings: {
					total: transpileElapsed,
					transpile: {total: transpileElapsed},
				},
			};
			onstats(id, stats, handleStats, this, log);

			return {
				code: outputText,
				map: sourceMapText ? JSON.parse(sourceMapText) : null,
			};
		},
	};
};

const handleDiagnostics = (
	_id: string,
	diagnostics: ts.Diagnostic[],
	_handleDiagnostics: (
		id: string,
		diagnostics: ts.Diagnostic[],
		...args: any[]
	) => void,
	_pluginContext: PluginContext,
	log: Logger,
): void => {
	logTsDiagnostics(diagnostics, log);
};

const handleStats = (
	id: string,
	stats: Stats,
	_handleStats: (id: string, stats: Stats, ...args: any[]) => void,
	_pluginContext: PluginContext,
	{info}: Logger,
): void => {
	info(
		fmtVal('stats', toRootPath(id)),
		...[
			// fmtVal('total', fmtMs(stats.timings.total)),
			stats.timings.transpile &&
				fmtVal('transpile', fmtMs(stats.timings.transpile.total)),
		].filter(Boolean),
	);
};
