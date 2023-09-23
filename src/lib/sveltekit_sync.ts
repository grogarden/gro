import {find_cli, spawn_cli} from './cli.js';
import {TaskError} from './task.js';

export const sveltekit_sync = async (): Promise<void> => {
	if (!(await find_cli('svelte-kit'))) {
		return;
	}
	const result = await spawn_cli('svelte-kit', ['sync']);
	if (!result?.ok) {
		throw new TaskError(`failed svelte-kit sync`);
	}
};
