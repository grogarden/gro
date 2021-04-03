import type {GroConfigCreator, PartialGroConfig} from './config.js';
import {LogLevel} from '../utils/log.js';
import {
	hasDeprecatedGroFrontend,
	hasGroServer,
	PRIMARY_NODE_BUILD_CONFIG,
	SERVER_BUILD_CONFIG,
	toDefaultBrowserBuild,
} from './defaultBuildConfig.js';

// This is the default config that's used if the current project does not define one.
// The default config detects
// Gro's deprecated SPA mode - https://github.com/feltcoop/gro/issues/106 -
// if it sees both a `src/index.html` and `src/index.ts`.
// It also looks for a primary Node server entry point at `src/server/server.ts`.
// Both are no-ops if not detected.

const createConfig: GroConfigCreator = async () => {
	const config: PartialGroConfig = {
		builds: [
			PRIMARY_NODE_BUILD_CONFIG,
			hasGroServer() ? SERVER_BUILD_CONFIG : null,
			(await hasDeprecatedGroFrontend()) ? toDefaultBrowserBuild() : null, // TODO configure asset paths
		],
		logLevel: LogLevel.Trace,
	};
	return config;
};

export default createConfig;
