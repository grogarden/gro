import {z} from 'zod';
import {spawn} from '@feltjs/util/process.js';

import type {Task} from './task/task.js';
import {adapt} from './adapt/adapt.js';
import {Plugins} from './plugin/plugin.js';
import {clean_fs} from './util/clean.js';

export const Args = z
	.object({
		install: z.boolean({description: 'dual of no-install'}).default(true),
		'no-install': z
			.boolean({
				description: 'opt out of npm installing before building',
			})
			.default(false),
	})
	.strict();
export type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'build the project',
	Args,
	run: async (ctx): Promise<void> => {
		const {
			config,
			log,
			args: {install},
		} = ctx;

		console.log(`ctx.args`, ctx.args);
		console.log(`install`, install);
		process.exit();

		// TODO possibly detect if the git workspace is clean, and ask for confirmation if not,
		// because we're not doing things like `gro gen` here because that's a dev/CI concern

		// if (install) {
		// 	await spawn('npm', ['i'], {env: {...process.env, NODE_ENV: 'development'}});
		// }

		await clean_fs({dist: true});

		const plugins = await Plugins.create({...ctx, config, dev: false, watch: false});

		await plugins.setup();
		await plugins.teardown();

		// Adapt the build to final ouputs.
		const adapters = await adapt(ctx);
		if (!adapters.length) log.info('no adapters to `adapt`');
	},
};
