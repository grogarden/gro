import {spawn} from '@feltjs/util/process.js';

import type {FilerEvents} from '../build/Filer.js';
import type {Plugin, PluginContext} from './plugin.js';
import type {Args} from '../task/args.js';
import {source_id_to_base_path} from '../path/paths.js';
import {findGenModules, isGenPath} from '../gen/genModule.js';
import {filterDependents} from '../build/source_file.js';
import {throttle} from '../util/throttle.js';

const name = 'gro_plugin_gen';

const FLUSH_DEBOUNCE_DELAY = 500;

export interface TaskArgs extends Args {
	watch?: boolean;
}

export const create_plugin = (): Plugin<PluginContext<TaskArgs, object>> => {
	let generating = false;
	let regen = false;
	let on_filer_build: ((e: FilerEvents['build']) => void) | undefined;
	const queuedFiles: Set<string> = new Set();
	const queueGen = (genFileName: string) => {
		queuedFiles.add(genFileName);
		void flushGenQueue();
	};
	const flushGenQueue = throttle(
		async () => {
			// hacky way to avoid concurrent `gro gen` calls
			if (generating) {
				regen = true;
				return;
			}
			generating = true;
			const files = Array.from(queuedFiles);
			queuedFiles.clear();
			await gen(files);
			generating = false;
			if (regen) {
				regen = false;
				void flushGenQueue();
			}
		},
		undefined,
		FLUSH_DEBOUNCE_DELAY,
	);
	const gen = (files: string[] = []) => spawn('npx', ['gro', 'gen', '--no-rebuild', ...files]);
	return {
		name,
		setup: async ({filer, args: {watch}, dev, log, fs}) => {
			// For production builds, we assume `gen` is already fresh,
			// which should be checked by CI via `gro check` which calls `gro gen --check`.
			if (!dev) return;

			// Run `gen`, first checking if there are any modules to avoid a console error.
			// Some parts of the build may have already happened,
			// making us miss `build` events for gen dependencies,
			// so we run `gen` here even if it's usually wasteful.
			const found = await findGenModules(fs);
			if (found.ok && found.source_ids_by_input_path.size > 0) {
				await gen();
			}

			// Do we need to just generate everything once and exit?
			if (!filer || !watch) {
				log.info('generating and exiting early');
				return;
			}

			// When a file builds, check it and its tree of dependents
			// for any `.gen.` files that need to run.
			on_filer_build = async ({source_file, build_config}) => {
				// TODO BLOCK how to handle this now? the loader traces deps for us with `parentPath`
				// if (build_config.name !== 'system') return;
				if (isGenPath(source_file.id)) {
					queueGen(source_id_to_base_path(source_file.id));
				}
				const dependentGenFileIds = filterDependents(
					source_file,
					build_config,
					filer.find_by_id as any, // cast because we can assume they're all `SourceFile`s
					isGenPath,
				);
				for (const dependentGenFileId of dependentGenFileIds) {
					queueGen(source_id_to_base_path(dependentGenFileId));
				}
			};
			filer.on('build', on_filer_build);
		},
		teardown: async ({filer}) => {
			if (on_filer_build && filer) {
				filer.off('build', on_filer_build);
			}
		},
	};
};
