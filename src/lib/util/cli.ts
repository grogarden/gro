import {execSync, type SpawnOptions} from 'node:child_process';
import {spawn, type SpawnResult} from '@feltjs/util/process.js';
import {existsSync} from 'node:fs';

/**
 * Looks for the CLI `name`, first local to the cwd and then globally.
 */
export const find_cli = (name: string): 'local' | 'global' | null => {
	if (existsSync(`node_modules/.bin/${name}`)) {
		return 'local';
	}
	try {
		execSync(`command -v ${name} > /dev/null 2>&1`);
		return 'global';
	} catch (err) {
		return null;
	}
};

/**
 * Calls the CLI `name` if available, first local to the cwd and then globally.
 */
export const spawn_cli = async (
	name: string,
	args: any[] = [],
	options?: SpawnOptions | undefined,
): Promise<SpawnResult | undefined> => {
	const found = find_cli(name);
	if (!found) return;
	const command = found === 'local' ? 'npx' : name;
	const final_args = found === 'local' ? [name].concat(args) : args;
	return spawn(command, final_args, options);
};
