import type {GroConfigCreator, GroConfigPartial} from './config.js';
import {
	has_sveltekit_frontend,
	has_node_server,
	API_SERVER_BUILD_CONFIG,
	has_node_library,
} from '../build/build_config_defaults.js';

/**
 * This is the default config that's passed to `src/gro.config.ts`
 * if it exists in the current project, and if not, this is the final config.
 * It looks at the project and tries to do the right thing:
 *
 * - if `src/routes` and `src/app.html`, assumes a SvelteKit frontend
 * - if `src/lib`, assumes a Node library
 * - if `src/lib/server/server.ts`, assumes a Node API server
 */
const config: GroConfigCreator = async ({fs}) => {
	const [enable_node_library, enable_node_server, enable_sveltekit_frontend] = await Promise.all([
		has_node_library(fs),
		has_node_server(fs),
		has_sveltekit_frontend(fs),
	]);
	const partial: GroConfigPartial = {
		builds: [enable_node_server ? API_SERVER_BUILD_CONFIG : null],
		plugin: async () => [
			enable_node_server
				? (await import('../plugin/gro_plugin_node_server.js')).create_plugin()
				: null,
			enable_sveltekit_frontend
				? (await import('../plugin/gro_plugin_sveltekit_frontend.js')).create_plugin()
				: null,
			(await import('../plugin/gro_plugin_gen.js')).create_plugin(),
		],
		adapt: async () => [
			enable_node_library
				? (await import('../adapt/gro_adapter_node_library.js')).createAdapter()
				: null,
			enable_node_server
				? (await import('../adapt/gro_adapter_generic_build.js')).createAdapter({
						build_name: API_SERVER_BUILD_CONFIG.name,
				  })
				: null,
			enable_sveltekit_frontend
				? (await import('../adapt/gro_adapter_sveltekit_frontend.js')).createAdapter({
						host_target: enable_node_server ? 'node' : 'github_pages',
				  })
				: null,
		],
	};
	return partial;
};

export default config;
