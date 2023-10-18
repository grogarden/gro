import {join} from 'node:path';

import {load_package_json} from './package_json.js';
import {NODE_MODULES_DIRNAME, SourceId, paths} from './paths.js';

export const resolve_node_specifier = async (
	specifier: string,
	dir = paths.root,
	parent_url?: string,
): Promise<SourceId> => {
	const parsed = parse_node_specifier(specifier);
	const subpath = './' + parsed.path;
	const package_dir = join(dir, NODE_MODULES_DIRNAME, parsed.name);
	const package_json = await load_package_json(package_dir); // TODO BLOCK cache (maybe with an optional param)
	const exported = package_json.exports?.[subpath];
	if (!exported) {
		// This error matches Node's.
		throw Error(
			`[ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath '${subpath}' is not defined by "exports" in ${package_dir}/package.json` +
				(parent_url ? ` imported from ${parent_url}` : ''),
		);
	}
	const source_id = join(package_dir, exported.svelte || exported.default); // TODO hacky, should detect file type
	return source_id;
};

export interface ParsedNodeSpecifier {
	name: string;
	path: string;
}

export const parse_node_specifier = (specifier: string): ParsedNodeSpecifier => {
	let idx!: number;
	if (specifier[0] === '@') {
		// get the index of the second `/`
		let count = 0;
		for (let i = 0; i < specifier.length; i++) {
			if (specifier[i] === '/') count++;
			if (count === 2) {
				idx = i;
				break;
			}
		}
	} else {
		idx = specifier.indexOf('/');
	}
	return {
		name: specifier.substring(0, idx),
		path: specifier.substring(idx + 1),
	};
};
