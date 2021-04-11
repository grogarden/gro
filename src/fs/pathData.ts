export interface PathData {
	id: string; // absolute path, same as `id` in rollup
	isDirectory: boolean;
}

export const toPathData = (id: string, stats: PathStats): PathData => {
	return {
		id,
		isDirectory: stats.isDirectory(),
	};
};

// This is a browser-compatible subset of `fs.Stats`.
// TODO the `size` ? should we always support it?
export interface PathStats {
	size?: number;
	isDirectory(): boolean;
}
