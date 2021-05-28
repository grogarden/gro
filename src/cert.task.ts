import {spawnProcess} from '@feltcoop/felt/dist/utils/process.js';

import type {Task} from './task/task.js';

export interface TaskArgs {
	host?: string;
}

export const task: Task<TaskArgs> = {
	description: 'creates a self-signed cert for https with openssl',
	run: async ({fs, args}) => {
		const host = args.host || 'localhost';
		const certFile = `${host}-cert.pem`;
		const keyFile = `${host}-privkey.pem`;
		if (await fs.exists(certFile)) throw Error(`File ${certFile} already exists. Canceling.`);
		if (await fs.exists(keyFile)) throw Error(`File ${keyFile} already exists. Canceling.`);
		await spawnProcess(
			'openssl',
			`req -x509 -newkey rsa:2048 -nodes -sha256 -subj /CN=${host} -keyout ${keyFile} -out ${certFile}`.split(
				' ',
			),
		);
	},
};
