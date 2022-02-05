import {spawn} from '@feltcoop/felt/util/process.js';

import {type Task} from './task/task.js';

export const task: Task = {
	summary: 'alias for `gro --help`',
	run: async (): Promise<void> => {
		await spawn('npx', ['gro', '--help']);
	},
};
