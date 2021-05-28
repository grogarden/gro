import {printMs, printTimings} from '@feltcoop/felt/dist/utils/print.js';
import type {Logger} from '@feltcoop/felt/dist/utils/log.js';
import {createStopwatch, Timings} from '@feltcoop/felt/dist/utils/time.js';

import {paths} from '../paths.js';
import {Filer} from '../build/Filer.js';
import {createDefaultBuilder} from './defaultBuilder.js';
import type {GroConfig} from '../config/config.js';
import type {Filesystem} from '../fs/filesystem.js';

export const buildSourceDirectory = async (
	fs: Filesystem,
	config: GroConfig,
	dev: boolean,
	log: Logger,
): Promise<void> => {
	log.info('building source directory');

	const totalTiming = createStopwatch();
	const timings = new Timings();
	const logTimings = () => {
		printTimings(timings, log);
		log.info(`🕒 built in ${printMs(totalTiming())}`);
	};

	const timingToCreateFiler = timings.start('create filer');
	const filer = new Filer({
		fs,
		dev,
		builder: createDefaultBuilder(),
		sourceDirs: [paths.source],
		buildConfigs: config.builds,
		watch: false,
		target: config.target,
		sourcemap: config.sourcemap,
	});
	timingToCreateFiler();

	const timingToInitFiler = timings.start('init filer');
	await filer.init();
	timingToInitFiler();

	filer.close();

	logTimings();
};
