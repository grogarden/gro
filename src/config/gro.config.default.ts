import {createFilter} from '@rollup/pluginutils';

import type {GroConfigCreator, PartialGroConfig} from './config.js';
import {LogLevel} from '../utils/log.js';
import {PartialBuildConfig} from './buildConfig.js';
import {pathExists} from '../fs/nodeFs.js';

// This is the default config that's used if the current project does not define one.
// The default config detects
// Gro's deprecated SPA mode - https://github.com/feltcoop/gro/issues/106 -
// if it sees both a `src/index.html` and `src/index.ts`.
// It also looks for a primary Node server entry point at `src/server/server.ts`.
// Both are no-ops if not detected.

const createConfig: GroConfigCreator = async () => {
	const config: PartialGroConfig = {
		builds: [
			(await hasDeprecatedGroFrontend()) ? toDefaultBrowserBuild() : null,
			{
				name: 'node',
				platform: 'node',
				input: [
					(await pathExists('src/server/server.ts')) ? 'server/server.ts' : null!,
					createFilter('**/*.{task,test,config,gen}*.ts'),
				].filter(Boolean),
			},
		],
		logLevel: LogLevel.Trace,
	};
	return config;
};

export default createConfig;

const assetPaths = ['html', 'css', 'json', 'ico', 'png', 'jpg', 'webp', 'webm', 'mp3'];

const toDefaultBrowserBuild = (): PartialBuildConfig => ({
	name: 'browser',
	platform: 'browser',
	input: ['index.ts', createFilter(`**/*.{${assetPaths.join(',')}}`)],
	dist: true,
});

// TODO extract helper?
const hasDeprecatedGroFrontend = async (): Promise<boolean> => {
	const [hasIndexHtml, hasIndexTs] = await Promise.all([
		pathExists('src/index.html'),
		pathExists('src/index.ts'),
	]);
	return hasIndexHtml && hasIndexTs;
};
