import {join} from 'path';
import {toEnvString} from '@feltcoop/felt/utils/env.js';
import type {Logger} from '@feltcoop/felt/utils/log.js';

import type {Filesystem} from '../fs/filesystem.js';

export interface HttpsCredentials {
	cert: string;
	key: string;
}

const DEFAULT_CERT_FILE: string = toEnvString('GRO_CERT_FILE', () =>
	join(process.cwd(), 'localhost-cert.pem'),
);
const DEFAULT_CERTKEY_FILE: string = toEnvString('GRO_CERTKEY_FILE', () =>
	join(process.cwd(), 'localhost-privkey.pem'),
);

// Tries to load the given cert and key, returning `null` if unable.
export const load_https_credentials = async (
	fs: Filesystem,
	log: Logger,
	certFile = DEFAULT_CERT_FILE,
	keyFile = DEFAULT_CERTKEY_FILE,
): Promise<HttpsCredentials | null> => {
	const [certExists, keyExists] = await Promise.all([fs.exists(certFile), fs.exists(keyFile)]);
	if (!certExists && !keyExists) return null;
	if (certExists && !keyExists) {
		log.warn('https cert exists but the key file does not', keyFile);
		return null;
	}
	if (!certExists && keyExists) {
		log.warn('https key exists but the cert file does not', certFile);
		return null;
	}
	const [cert, key] = await Promise.all([
		fs.read_file(certFile, 'utf8'),
		fs.read_file(keyFile, 'utf8'),
	]);
	return {cert, key};
};
