import type {Task} from 'src/task/task.js';

export const task: Task = {
	summary: 'a test task for basic task behavior',
	run: async ({log, args}) => {
		log.info('test task 1!', args);
		return args;
	},
};
