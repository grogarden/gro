import Cheap_Watch from 'cheap-watch';

import type {Path_Stats} from 'src/fs/path_data.js';
import {to_path_filter} from './filter.js';
import type {Path_Filter} from 'src/fs/filter.js';
import {load_gitignore_filter} from '../utils/gitignore.js';

/*

`watch_node_fs` is Gro's low level interface for watching changes on the Node filesystem.
`Filer` is a high level interface that should be preferred when possible.

*/

export interface Watch_Node_Fs {
	init: () => Promise<Map<string, Path_Stats>>;
	close: () => void;
}

export interface Watcher_Change {
	type: Watcher_Change_Type;
	path: string;
	stats: Path_Stats;
}
export type Watcher_Change_Type = 'create' | 'update' | 'delete';
export interface Watcher_Change_Callback {
	(change: Watcher_Change): void;
}

export const DEBOUNCE_DEFAULT = 10;

export interface Options {
	dir: string;
	on_change: Watcher_Change_Callback;
	filter?: Path_Filter | null | undefined;
	watch?: boolean;
	debounce?: number;
}

export const watch_node_fs = (options: Options): Watch_Node_Fs => {
	const {
		dir,
		on_change,
		filter = to_default_filter(),
		watch = true,
		debounce = DEBOUNCE_DEFAULT,
	} = options;
	const watcher = new Cheap_Watch({dir, filter, watch, debounce});
	if (watch) {
		watcher.on('+', ({path, stats, is_new}) => {
			on_change({type: is_new ? 'create' : 'update', path, stats});
		});
		watcher.on('-', ({path, stats}) => {
			on_change({type: 'delete', path, stats});
		});
	}
	return {
		init: async () => {
			await watcher.init();
			return watcher.paths;
		},
		close: () => {
			watcher.close();
			watcher.removeAllListeners();
		},
	};
};

const to_default_filter = (): Path_Filter => to_path_filter(load_gitignore_filter());
