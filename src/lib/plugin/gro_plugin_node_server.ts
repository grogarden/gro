import {spawnRestartableProcess, type RestartableProcess} from '@feltjs/util/process.js';
import {existsSync} from 'node:fs';
import {type BuildContext, context as create_esbuild_context} from 'esbuild';
import {cwd} from 'node:process';
import {red} from 'kleur/colors'; // TODO BLOCK remove

import type {Plugin, PluginContext} from './plugin.js';
import {
	NODE_SERVER_BUILD_BASE_PATH,
	NODE_SERVER_BUILD_NAME,
} from '../build/build_config_defaults.js';
import {paths} from '../path/paths.js';
import type {BuildName} from '../build/build_config.js';
import {watch_dir, type WatchNodeFs} from '../fs/watch_dir.js';
import {render_env_shim_module} from '../util/sveltekit_shim_env.js';
import {extname} from 'node:path';

const dir = cwd() + '/';

export interface Options {
	build_name: BuildName; // defaults to 'server'
	base_build_path?: string; // defaults to 'server/server.js'
}

export const create_plugin = ({
	build_name = NODE_SERVER_BUILD_NAME,
	base_build_path = NODE_SERVER_BUILD_BASE_PATH,
}: Partial<Options> = {}): Plugin<PluginContext<object>> => {
	let build_ctx: BuildContext;
	let watcher: WatchNodeFs;
	let server_process: RestartableProcess | null = null;

	const outdir = dir + '.gro/dev/' + build_name;
	const server_outfile = outdir + '/' + base_build_path;

	return {
		name: 'gro_plugin_node_server',
		setup: async ({dev, timings, config}) => {
			if (!dev) return;

			const build_config = config.builds.find((c) => c.name === build_name);
			if (!build_config) throw Error('could not find build config ' + build_name);
			console.log(`build_config`, build_config);

			// TODO BLOCK maybe have a plugin for files that end in `_worker` to keep them external

			const timing_to_create_esbuild_context = timings.start('create esbuild context');
			console.log(`config.target`, config.target);
			build_ctx = await create_esbuild_context({
				entryPoints: build_config.input, // TODO BLOCK could map filters to files before calling this
				outdir,
				format: 'esm',
				platform: 'node',
				packages: 'external',
				bundle: true,
				target: config.target,
				external: ['*/password_worker.ts'], // TODO BLOCK only internal project should files get marked, not transitive deps
				plugins: [
					// TODO BLOCK extract and refactor with the existing helpers for the loader+postprocess
					{
						name: 'sveltekit_shim_alias',
						setup: (build) => {
							// TODO BLOCK construct matcher with $lib and each `config.alias`
							const matcher = /^\$lib\//u;
							build.onResolve({filter: matcher}, async (args) => {
								// console.log(`[sveltekit_shim_alias] args`, args);
								const {path: specifier, ...rest} = args;
								console.log(`[sveltekit_shim_alias] enter path`, specifier);

								let path = dir + 'src/' + specifier.slice(1);
								const ext = extname(path);
								if (ext !== '.ts' && ext !== '.js' && ext !== '.svelte') path += '.ts'; // TODO tricky because of files with `.(schema|task)` etc
								console.log(`[sveltekit_shim_alias] final path`, path);
								if (!existsSync(path)) throw Error('not found: ' + path); // TODO BLOCK remove
								// if (path.endsWith('_worker.ts')) {
								// 	return {path, external: true}; // TODO BLOCK hacky, fix plugin usage
								// } else {
								const resolved = await build.resolve(path, rest);
								return resolved;
								// return {path};
								// }
							});
						},
					},
					{
						name: 'sveltekit_shim_env',
						setup: (build) => {
							const namespace = 'sveltekit_shim_env';
							const matcher = /^\$env\/(static|dynamic)\/(public|private)$/u;
							build.onResolve({filter: matcher}, ({path}) => ({path, namespace}));
							build.onLoad({filter: /.*/u, namespace}, (args) => {
								const {path} = args;
								const matches = matcher.exec(path);
								const public_prefix = 'PUBLIC_'; // TODO BLOCK config source
								const private_prefix = ''; // TODO BLOCK config source
								const env_dir = undefined; // TODO BLOCK config source
								const mode = matches![1] as 'static' | 'dynamic';
								const visibility = matches![2] as 'public' | 'private';
								return {
									loader: 'ts',
									contents: render_env_shim_module(
										false, // TODO BLOCK
										mode,
										visibility,
										public_prefix,
										private_prefix,
										env_dir,
									),
								};
							});
						},
					},
					// {
					// 	name: 'external_worker',
					// 	setup: (build) => {
					// 		// TODO BLOCK construct matcher with $lib and each `config.alias`
					// 		const matcher = /_worker(|\.js|\.ts)/u; // TODO BLOCK maybe `.worker.(js|ts)`?
					// 		build.onResolve({filter: matcher}, async (args) => {
					// 			console.log(red(`[external_worker] path`), args);
					// 			// return null;
					// 			// return args;
					// 			return {path: args.path, external: true};
					// 			// const {path, ...rest} = args;
					// 			// const resolved = await build.resolve(path, rest);
					// 			// return {path: resolved.path, external: true};
					// 		});
					// 	},
					// },
				],
			});
			timing_to_create_esbuild_context();
			// build.on('build', ({source_file, build_config}) => {
			// 	console.log(`source_file.id`, source_file.id);
			// 	if (source_file.id.endsWith('/gro/do/close.json')) {
			// 		console.log('CLOSE', source_file);
			// 		console.log(`build_config`, build_config);
			// 	}
			// });
			// TODO BLOCK can we watch dependencies of all of the files through esbuild?
			watcher = watch_dir({
				dir: paths.lib,
				on_change: async (change) => {
					console.log(`change`, change);
					// await build_ctx.rebuild(); // TODO BLOCK
					// server_process?.restart();
				},
			});

			console.log('INITIAL REBUILD');
			await build_ctx.rebuild();

			if (!existsSync(server_outfile)) {
				throw Error(`Node server failed to start due to missing file: ${server_outfile}`);
			}

			server_process = spawnRestartableProcess('node', [server_outfile]);
			console.log(`spawned`, server_process);
		},
		teardown: async ({dev}) => {
			if (!dev) return;

			if (server_process) {
				await server_process.kill();
				server_process = null;
			}
			if (build_ctx) {
				console.log('TEARING DOWN');
				await build_ctx.dispose();
			}
		},
	};
};
