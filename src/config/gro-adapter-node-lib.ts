import type {Adapter} from './adapt.js';
import {Timings} from '../utils/time.js';
import {printTimings} from '../utils/print.js';
import {printSpawnResult, spawnProcess} from '../utils/process.js';
import {clean} from '../fs/clean.js';
import {TaskError} from '../task/task.js';
import {copyDist} from '../build/dist.js';

// TODO name? is it actually specific to Node libs?

export const createAdapter = (): Adapter => {
	return {
		name: 'gro-adapter-node-lib',
		adapt: async ({config, fs, dev, log}) => {
			const timings = new Timings(); // TODO probably move to task context

			await clean(fs, {dist: true}, log);

			// compile again with `tsc` to create all of the TypeScript type defs, sourcemaps, and typemaps
			const timingToCompileWithTsc = timings.start('compile with tsc');
			log.info('compiling with tsc');
			const tscResult = await spawnProcess('npx', ['tsc']);
			if (!tscResult.ok) throw Error(`TypeScript failed to compile with code ${tscResult.code}`);
			timingToCompileWithTsc();

			// create the dist
			const timingToCreateDist = timings.start('create dist');
			// This reads the `dist` flag on the build configs to help construct the final dist directory.
			// See the docs at `./docs/config.md`.
			const distCount = config.builds.filter((b) => b.dist).length;
			await Promise.all(
				config.builds.map((buildConfig) => copyDist(fs, buildConfig, dev, distCount, log)),
			);

			// TODO this fixes the npm 7 linking issue, but it probably should be fixed a different way.
			// Why is this needed here but not when we call `npm run bootstrap` and get esbuild outputs?
			const chmodResult = await spawnProcess('chmod', ['+x', 'dist/cli/gro.js']);
			if (!chmodResult.ok) log.error(`CLI chmod failed with code ${chmodResult.code}`);
			log.info(`linking`);
			const linkResult = await spawnProcess('npm', ['link']);
			if (!linkResult.ok) {
				throw new TaskError(`Failed to link. ${printSpawnResult(linkResult)}`);
			}
			timingToCreateDist();

			printTimings(timings, log);
		},
	};
};
