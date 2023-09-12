import type {Logger} from '@feltjs/util/log.js';
import {stripEnd, stripStart} from '@feltjs/util/string.js';
import type {z} from 'zod';

import type {Args} from '../task/args.js';
import {LIB_DIRNAME} from '../path/paths.js';
import type {GroConfig} from '../config/config.js';

export interface Task<
	TArgs = Args, // same as `z.infer<typeof Args>`
	TArgsSchema extends z.ZodType<any, z.ZodTypeDef, any> = z.ZodType<any, z.ZodTypeDef, any>,
> {
	run: (ctx: TaskContext<TArgs>) => Promise<unknown>; // TODO return value (make generic, forward it..how?)
	summary?: string;
	Args?: TArgsSchema;
}

export interface TaskContext<TArgs = object> {
	config: GroConfig;
	log: Logger;
	args: TArgs;
	invoke_task: (task_name: string, args?: object, config?: GroConfig) => Promise<void>;
}

export const TASK_FILE_SUFFIX_TS = '.task.ts';
export const TASK_FILE_SUFFIX_JS = '.task.js';

export const is_task_path = (path: string): boolean =>
	path.endsWith(TASK_FILE_SUFFIX_TS) || path.endsWith(TASK_FILE_SUFFIX_JS);

export const to_task_name = (base_path: string): string => {
	const stripped = stripStart(
		stripEnd(stripEnd(base_path, TASK_FILE_SUFFIX_TS), TASK_FILE_SUFFIX_JS),
		LIB_DIRNAME + '/',
	);
	if (stripped === base_path) return base_path;
	// Handle task directories, so `a/a.task` outputs `a` instead of `a/a`.
	const s = stripped.split('/');
	return s.at(-1) === s.at(-2) ? s.slice(0, -1).join('/') : stripped;
};

/**
 * This is used by tasks to signal a known failure.
 * It's useful for cleaning up logging because
 * we usually don't need their stack trace.
 */
export class TaskError extends Error {}
