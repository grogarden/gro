import type {Gen} from './gen.js';
import {load_package_json} from './package_json.js';
import {is_this_project_gro, to_root_path} from './paths.js';
import {create_src_json} from './src_json.js';

// TODO consider an api that uses magic imports like SvelteKit's `$app`, like `$repo/package.json`

/**
 * A convenience `gen` file that outputs `$lib/package.ts`,
 * which mirrors `package.json` but in TypeScript,
 * allowing apps to import typesafe data from their own `package.json`.
 */
export const gen: Gen = async ({origin_id}) => {
	const package_json = await load_package_json();
	const src_json = await create_src_json(package_json);

	return `
// generated by ${to_root_path(origin_id)}

import type {Package_Json} from '${
		is_this_project_gro ? './package_json.js' : '@grogarden/gro/package_json.js'
	}';

import type {Src_Json} from '${
		is_this_project_gro ? './src_json.js' : '@grogarden/gro/src_json.js'
	}';

export const package_json = ${JSON.stringify(package_json)} satisfies Package_Json;

export const src_json = ${JSON.stringify(src_json)} satisfies Src_Json;

// generated by ${to_root_path(origin_id)}
	`;
};
