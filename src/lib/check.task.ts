import {z} from 'zod';
import {spawn} from '@ryanatkn/belt/process.js';
import {red} from '@ryanatkn/belt/styletext.js';

import {Task_Error, type Task} from './task.js';
import {git_check_clean_workspace} from './git.js';
import {sync_package_json} from './package_json.js';

export const Args = z
	.object({
		typecheck: z.boolean({description: 'dual of no-typecheck'}).default(true),
		'no-typecheck': z.boolean({description: 'opt out of typechecking'}).default(false),
		test: z.boolean({description: 'dual of no-test'}).default(true),
		'no-test': z.boolean({description: 'opt out of running tests'}).default(false),
		gen: z.boolean({description: 'dual of no-gen'}).default(true),
		'no-gen': z.boolean({description: 'opt out of gen check'}).default(false),
		format: z.boolean({description: 'dual of no-format'}).default(true),
		'no-format': z.boolean({description: 'opt out of format check'}).default(false),
		package_json: z.boolean({description: 'dual of no-package_json'}).default(true),
		'no-package_json': z.boolean({description: 'opt out of package.json check'}).default(false),
		lint: z.boolean({description: 'dual of no-lint'}).default(true),
		'no-lint': z.boolean({description: 'opt out of linting'}).default(false),
		workspace: z
			.boolean({description: 'ensure a clean git workspace, useful for CI'})
			.default(false),
	})
	.strict();
export type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'check that everything is ready to commit',
	Args,
	run: async ({args, invoke_task, log, config}) => {
		const {typecheck, test, gen, format, package_json, lint, workspace} = args;

		// When checking the workspace, which was added for CI,
		// don't sync, because the check will fail with misleading errors.
		// For example it would cause the gen check to be a false negative,
		// and then the workspace check would fail with the new files.
		const sync = !workspace;
		if (sync) {
			await invoke_task('sync', {gen: false});
		}

		if (typecheck) {
			await invoke_task('typecheck');
		}

		if (test) {
			await invoke_task('test');
		}

		if (gen) {
			await invoke_task('gen', {check: true});
		}

		if (package_json && config.map_package_json) {
			const {changed} = await sync_package_json(config.map_package_json, log, true);
			if (changed) {
				throw new Task_Error('package.json is out of date, run `gro sync` to update it');
			} else {
				log.info('check passed for package.json');
			}
		}

		if (format) {
			await invoke_task('format', {check: true});
		}

		// Run the linter last to surface every other kind of problem first.
		// It's not the ideal order when the linter would catch errors that cause failing tests,
		// but it's better for most usage.
		if (lint) {
			await invoke_task('lint');
		}

		if (workspace) {
			const error_message = await git_check_clean_workspace();
			if (error_message) {
				log.error(red('git status'));
				await spawn('git', ['status']);
				throw new Task_Error(
					'Failed check for git_check_clean_workspace:' +
						error_message +
						' - do you need to run `gro sync` or commit some files?',
				);
			}
		}
	},
};
