import {Timings} from '@feltcoop/felt/dist/utils/time.js';
import {spawnProcess} from '@feltcoop/felt/dist/utils/process.js';
import {printTimings} from '@feltcoop/felt/dist/utils/print.js';
import {EMPTY_OBJECT} from '@feltcoop/felt/dist/utils/object.js';
import {stripTrailingSlash} from '@feltcoop/felt/dist/utils/path.js';

import type {Adapter} from './adapter.js';
import {DIST_DIRNAME, SVELTE_KIT_BUILD_DIRNAME} from '../paths.js';

const NOJEKYLL = '.nojekyll';
const DEFAULT_TARGET = 'github_pages';

export interface Options {
	dir: string;
	svelteKitDir: string;
	target: 'github_pages' | 'static';
}

export const createAdapter = ({
	dir = DIST_DIRNAME,
	svelteKitDir = SVELTE_KIT_BUILD_DIRNAME,
	target = DEFAULT_TARGET,
}: Partial<Options> = EMPTY_OBJECT): Adapter => {
	dir = stripTrailingSlash(dir);
	return {
		name: '@feltcoop/gro-adapter-sveltekit-frontend',
		begin: async ({fs}) => {
			await fs.remove(dir);
		},
		adapt: async ({fs, log}) => {
			const timings = new Timings();

			const timingToBuildSvelteKit = timings.start('build SvelteKit');
			await spawnProcess('npx', ['svelte-kit', 'build']);
			timingToBuildSvelteKit();

			const timingToCopyDist = timings.start('copy build to dist');
			await fs.move(svelteKitDir, dir);
			timingToCopyDist();

			// GitHub pages processes everything with Jekyll by default,
			// breaking things like files and dirs prefixed with an underscore.
			// This adds a `.nojekyll` file to the root of the output
			// to tell GitHub Pages to treat the outputs as plain static files.
			if (target === 'github_pages') {
				const nojekyllPath = `${dir}/${NOJEKYLL}`;
				if (!(await fs.exists(nojekyllPath))) {
					await fs.writeFile(nojekyllPath, '', 'utf8');
				}
			}

			printTimings(timings, log);
		},
	};
};
