import {printSpawnResult, spawn} from '@feltcoop/felt/util/process.js';

import {TaskError, type Task} from './task/task.js';
import {type TypecheckTaskArgs} from './typecheck.js';
import {TypecheckTaskArgsSchema} from './typecheck.schema.js';

export const task: Task<TypecheckTaskArgs> = {
	summary: 'typecheck the project without emitting any files',
	args: TypecheckTaskArgsSchema,
	run: async ({fs, args}): Promise<void> => {
		const {tsconfig = 'tsconfig.json'} = args;

		const tscTypecheckResult = await spawn('npx', ['tsc', '--noEmit']);
		if (!tscTypecheckResult.ok) {
			throw new TaskError(`Failed to typecheck. ${printSpawnResult(tscTypecheckResult)}`);
		}
		if (await fs.exists('node_modules/.bin/svelte-check')) {
			const svelteCheckResult = await spawn('npx', ['svelte-check', '--tsconfig', tsconfig]);
			if (!svelteCheckResult.ok) {
				throw new TaskError(`Failed to typecheck Svelte. ${printSpawnResult(svelteCheckResult)}`);
			}
		}
	},
};
