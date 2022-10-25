import {Timings} from '@feltcoop/felt/util/timings.js';
import {printTimings} from '@feltcoop/felt/util/print.js';
import {z} from 'zod';

import type {Task} from './task/task.js';
import {loadConfig, type GroConfig} from './config/config.js';
import {adapt} from './adapt/adapt.js';
import {buildSource} from './build/buildSource.js';
import {Plugins} from './plugin/plugin.js';
import {cleanFs} from './fs/clean.js';
import {toVocabSchema} from './utils/schema.js';
import type {ArgsSchema} from './utils/args.js';

export interface TaskEvents {
	'build.createConfig': (config: GroConfig) => void;
}

const Args = z
	.object({
		clean: z.boolean({description: ''}).default(true),
		'no-clean': z
			.boolean({
				description: 'opt out of cleaning before building; warning! this may break your build!',
			})
			.default(false)
			.optional(),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args, TaskEvents> = {
	summary: 'build the project',
	production: true,
	Args,
	args: toVocabSchema(Args, 'BuildTaskArgs') as ArgsSchema,
	run: async (ctx): Promise<void> => {
		const {
			fs,
			dev,
			log,
			events,
			args: {clean},
		} = ctx;

		const timings = new Timings(); // TODO belongs in ctx

		// Clean in the default case, but not if the caller passes a `false` `clean` arg,
		// This is used by `gro publish` and `gro deploy` because they call `cleanFs` themselves.
		if (clean) {
			await cleanFs(fs, {buildProd: true, dist: true}, log);
		}

		// TODO delete prod builds (what about config/system tho?)

		const timingToLoadConfig = timings.start('load config');
		const config = await loadConfig(fs, dev);
		timingToLoadConfig();
		events.emit('build.createConfig', config);

		const plugins = await Plugins.create({...ctx, config, filer: null, timings});

		// Build everything with esbuild and Gro's `Filer` first.
		// These production artifacts are then available to all adapters.
		// There may be no builds, e.g. for SvelteKit-only frontend projects,
		// so just don't build in that case.
		if (config.builds.length) {
			const timingToBuildSource = timings.start('buildSource');
			await buildSource(fs, config, dev, log);
			timingToBuildSource();
		}

		await plugins.setup();
		await plugins.teardown();

		// Adapt the build to final ouputs.
		const adapters = await adapt({...ctx, config, timings});
		if (!adapters.length) log.info('no adapters to `adapt`');

		printTimings(timings, log);
	},
};
