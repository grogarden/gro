import {type Task} from './task/task.js';
import {TaskError} from './task/task.js';
import {findGenModules} from './gen/genModule.js';
import {type CheckTaskArgs} from './check.js';

export const task: Task<CheckTaskArgs> = {
	summary: 'check that everything is ready to commit',
	run: async ({fs, log, args, invokeTask}) => {
		const {
			typecheck = true,
			test = true,
			gen = true,
			format = true,
			lint = true,
			...restArgs
		} = args;

		if (typecheck) {
			await invokeTask('typecheck');
		}

		if (test) {
			await invokeTask('test');
		}

		if (gen) {
			// Check for stale code generation if the project has any gen files.
			const findGenModulesResult = await findGenModules(fs);
			if (findGenModulesResult.ok) {
				log.info('checking that generated files have not changed');
				await invokeTask('gen', {...restArgs, check: true});
			} else if (findGenModulesResult.type !== 'inputDirectoriesWithNoFiles') {
				for (const reason of findGenModulesResult.reasons) {
					log.error(reason);
				}
				throw new TaskError('Failed to find gen modules.');
			}
		}

		if (format) {
			await invokeTask('format', {...restArgs, check: true});
		}

		// Run the linter last to surface every other kind of problem first.
		// It's not the ideal order when the linter would catch errors that cause failing tests,
		// but it's better for most usage.
		if (lint) {
			await invokeTask('lint', {_: [], 'max-warnings': 0});
		}
	},
};
