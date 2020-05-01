import fs from 'fs-extra';
const {outputFile} = fs; // TODO esm

import {Task} from './task/task.js';
import {red, green, gray} from './colors/terminal.js';
import {gen, isGenPath, loadGenModule, GEN_FILE_PATTERN} from './gen/gen.js';
import {fmtPath, fmtMs, fmtError} from './utils/fmt.js';
import {
	resolveRawInputPaths,
	getPossibleSourceIds,
} from './files/inputPaths.js';
import {findFiles} from './files/nodeFs.js';
import {plural} from './utils/string.js';
import {Timings} from './utils/time.js';
import {findModules, loadModules} from './files/modules.js';

// TODO test - especially making sure nothing gets genned
// if there's any validation or import errors
export const task: Task = {
	description: 'Run code generation scripts',
	run: async ({log: {info, error}, args}): Promise<void> => {
		const rawInputPaths = args._;

		const timings = new Timings<'total' | 'output results'>();
		timings.start('total');

		// resolve the input paths relative to src/
		const inputPaths = resolveRawInputPaths(rawInputPaths);

		// load all of the gen modules
		const findModulesResult = await findModules(
			inputPaths,
			// TODO really we want a regexp here, but the API currently doesn't work that way -
			// it precomputes the possible files instead of performing a broader search -
			// maybe we just take regexps as params and search all files for now?
			id => findFiles(id, file => isGenPath(file.path)),
			inputPath => getPossibleSourceIds(inputPath, [GEN_FILE_PATTERN]),
		);
		if (!findModulesResult.ok) {
			for (const reason of findModulesResult.reasons) {
				error(reason);
			}
			return;
		}
		const loadModulesResult = await loadModules(
			findModulesResult.sourceIdsByInputPath,
			loadGenModule,
		);
		if (!loadModulesResult.ok) {
			for (const reason of loadModulesResult.reasons) {
				error(reason);
			}
			return;
		}

		// run `gen` on each of the modules
		const genResults = await gen(loadModulesResult.modules);

		// write generated files to disk
		timings.start('output results');
		if (genResults.failures.length) {
			for (const result of genResults.failures) {
				error(result.reason, '\n', fmtError(result.error));
			}
		}
		await Promise.all(
			genResults.successes
				.map(result =>
					result.files.map(file => {
						info(
							'writing',
							fmtPath(file.id),
							'generated from',
							fmtPath(file.originId),
						);
						return outputFile(file.id, file.contents);
					}),
				)
				.flat(),
		);
		timings.stop('output results');

		let logResult = '';
		for (const result of genResults.results) {
			logResult += `\n\t${result.ok ? green('✓') : red('🞩')}  ${
				result.ok ? result.files.length : 0
			} ${gray('in')} ${fmtMs(result.elapsed)} ${gray('←')} ${fmtPath(
				result.id,
			)}`;
		}
		info(logResult);
		info(
			green(
				`generated ${genResults.outputCount} file${plural(
					genResults.outputCount,
				)} from ${genResults.successes.length} input file${plural(
					genResults.successes.length,
				)}`,
			),
		);
		if (genResults.failures.length) {
			info(
				red(
					`${genResults.failures.length} file${plural(
						genResults.failures.length,
					)} failed to generate`,
				),
			);
		}
		info(
			`${fmtMs(
				findModulesResult.timings.get('map input paths'),
			)} to map input paths`,
		);
		info(`${fmtMs(findModulesResult.timings.get('find files'))} to find files`);
		info(
			`${fmtMs(loadModulesResult.timings.get('load modules'))} to load modules`,
		);
		info(`${fmtMs(genResults.elapsed)} to generate code`);
		info(`${fmtMs(timings.get('output results'))} to output results`);
		info(`🕒 ${fmtMs(timings.stop('total'))}`);
	},
};
