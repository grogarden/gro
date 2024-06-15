import * as esbuild from 'esbuild';
import {compile, compileModule, preprocess} from 'svelte/compiler';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, join} from 'node:path';
import type {LoadHook, ResolveHook} from 'node:module';
import {escape_regexp} from '@ryanatkn/belt/regexp.js';

import {render_env_shim_module} from './sveltekit_shim_env.js';
import {
	render_sveltekit_shim_app_environment,
	render_sveltekit_shim_app_paths,
	sveltekit_shim_app_environment_matcher,
	sveltekit_shim_app_paths_matcher,
	sveltekit_shim_app_specifiers,
} from './sveltekit_shim_app.js';
import {sveltekit_config_global} from './sveltekit_config_global.js';
import {SVELTE_MATCHER, SVELTE_RUNES_MATCHER} from './svelte_helpers.js';
import {paths, NODE_MODULES_DIRNAME} from './paths.js';
import {to_define_import_meta_env, ts_transform_options} from './esbuild_helpers.js';
import {resolve_specifier} from './resolve_specifier.js';
import {resolve_node_specifier} from './resolve_node_specifier.js';
import type {Package_Json} from './package_json.js';
import {red} from 'kleur/colors';

// TODO BLOCK deleteme - do this without importing into the loader because it might be causing issues and confusing me
export const CHECKING_IF_LOADER_IS_IN_TASK_CONTEXT = Math.random();
console.log(
	red(`loader CHECKING_IF_LOADER_IS_IN_TASK_CONTEXT`),
	CHECKING_IF_LOADER_IS_IN_TASK_CONTEXT,
);

/*

Usage via `$lib/run.task.ts`:

```bash
gro run foo.ts
```

Direct usage (see also `$lib/gro.ts`):

```bash
node --import 'data:text/javascript,import {register} from "node:module"; import {pathToFileURL} from "node:url"; register("@ryanatkn/gro/loader.js", pathToFileURL("./"));' --enable-source-maps' foo.ts
```

TODO how to improve that gnarly import line? was originally designed for the now-deprecated `--loader`

*/

// TODO support `?raw` import variants
// TODO sourcemaps for svelte and the svelte preprocessors
// TODO `import.meta.resolve` wasn't available in loaders when this was first implemented, but might be now

// dev is always true in the loader
const dev = true;

const dir = paths.root;

const {
	alias,
	base_url,
	assets_url,
	env_dir,
	private_prefix,
	public_prefix,
	svelte_compile_options,
	svelte_compile_module_options,
	svelte_preprocessors,
} = sveltekit_config_global;

const final_ts_transform_options: esbuild.TransformOptions = {
	...ts_transform_options,
	define: to_define_import_meta_env(dev, base_url),
	sourcemap: 'inline',
};

const aliases = Object.entries({$lib: 'src/lib', ...alias});

const ts_matcher = /\.(ts|tsx|mts|cts)$/u;
const json_matcher = /\.(json)$/u;
const noop_matcher = /\.(css|svg)$/u; // TODO others? configurable?
const env_matcher = /src\/lib\/\$env\/(static|dynamic)\/(public|private)$/u;
const node_modules_matcher = new RegExp(escape_regexp('/' + NODE_MODULES_DIRNAME + '/'), 'u');

const package_json_cache: Record<string, Package_Json> = {};

export const load: LoadHook = async (url, context, nextLoad) => {
	if (sveltekit_shim_app_paths_matcher.test(url)) {
		// SvelteKit `$app/paths` shim
		return {
			format: 'module',
			shortCircuit: true,
			source: render_sveltekit_shim_app_paths(base_url, assets_url),
		};
	} else if (sveltekit_shim_app_environment_matcher.test(url)) {
		// SvelteKit `$app/environment` shim
		return {
			format: 'module',
			shortCircuit: true,
			source: render_sveltekit_shim_app_environment(dev),
		};
	} else if (SVELTE_RUNES_MATCHER.test(url)) {
		// Svelte runes in js/ts
		// TODO support sourcemaps
		const loaded = await nextLoad(
			url,
			context.format === 'module' ? context : {...context, format: 'module'}, // TODO dunno why this is needed, specifically with tests
		);
		const filename = fileURLToPath(url);
		const source = loaded.source!.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
		const transformed = compileModule(source, {...svelte_compile_module_options, filename});
		return {format: 'module', shortCircuit: true, source: transformed.js.code};
	} else if (ts_matcher.test(url)) {
		// ts
		const loaded = await nextLoad(
			url,
			context.format === 'module' ? context : {...context, format: 'module'}, // TODO dunno why this is needed, specifically with tests
		);
		const transformed = await esbuild.transform(
			loaded.source!.toString(), // eslint-disable-line @typescript-eslint/no-base-to-string
			{...final_ts_transform_options, sourcefile: url},
		);
		return {format: 'module', shortCircuit: true, source: transformed.code};
	} else if (SVELTE_MATCHER.test(url)) {
		// Svelte
		// TODO support sourcemaps
		const loaded = await nextLoad(
			url,
			context.format === 'module' ? context : {...context, format: 'module'}, // TODO dunno why this is needed, specifically with tests
		);
		const filename = fileURLToPath(url);
		const raw_source = loaded.source!.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
		const preprocessed = svelte_preprocessors
			? await preprocess(raw_source, svelte_preprocessors, {filename})
			: null;
		const source = preprocessed?.code ?? raw_source;
		const transformed = compile(source, {...svelte_compile_options, filename});
		return {format: 'module', shortCircuit: true, source: transformed.js.code};
	} else if (json_matcher.test(url)) {
		// json
		// TODO probably follow esbuild and also export every top-level property for objects from the module - https://esbuild.github.io/content-types/#json (type generation?)
		const loaded = await nextLoad(url);
		const raw_source = loaded.source!.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
		const source = `export default ` + raw_source;
		return {format: 'module', shortCircuit: true, source};
	} else if (noop_matcher.test(url)) {
		// no-ops like `.css` and `.svg`
		const source = `export default 'no-op import from ${url}'`;
		return {format: 'module', shortCircuit: true, source};
	} else {
		const matched_env = env_matcher.exec(url);
		if (matched_env) {
			// SvelteKit `$env`
			const mode: 'static' | 'dynamic' = matched_env[1] as any;
			const visibility: 'public' | 'private' = matched_env[2] as any;
			return {
				format: 'module',
				shortCircuit: true,
				source: await render_env_shim_module(
					dev,
					mode,
					visibility,
					public_prefix,
					private_prefix,
					env_dir,
				),
			};
		}
	}

	// fallback to default behavior
	return nextLoad(url, context);
};

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
	if (
		specifier === '$env/static/public' ||
		specifier === '$env/static/private' ||
		specifier === '$env/dynamic/public' ||
		specifier === '$env/dynamic/private'
	) {
		// The returned `url` is validated before `load` is called,
		// so we need a slightly roundabout strategy to pass through the specifier for virtual files.
		return {
			url: pathToFileURL(join(dir, 'src/lib', specifier)).href,
			format: 'module',
			shortCircuit: true,
		};
	}

	const parent_url = context.parentURL;
	if (!parent_url || node_modules_matcher.test(parent_url)) {
		return nextResolve(specifier, context);
	}

	const shimmed = sveltekit_shim_app_specifiers.get(specifier);
	if (shimmed !== undefined) {
		return nextResolve(shimmed, context);
	}

	let path = specifier;

	// Map the path with the SvelteKit aliases.
	for (const [from, to] of aliases) {
		if (path.startsWith(from)) {
			path = join(dir, to, path.substring(from.length));
			break;
		}
	}

	// The specifier `path` has now been mapped to its final form, so we can inspect it.
	if (path[0] !== '.' && path[0] !== '/') {
		// Resolve to `node_modules`.
		if (SVELTE_MATCHER.test(path) || json_matcher.test(path)) {
			// Match the behavior of Vite and esbuild for Svelte and JSON imports.
			// TODO maybe `.ts` too
			const source_id = await resolve_node_specifier(path, dir, parent_url, package_json_cache);
			return {url: pathToFileURL(source_id).href, format: 'module', shortCircuit: true};
		} else {
			return nextResolve(path, context);
		}
	}

	const {source_id} = await resolve_specifier(path, dirname(fileURLToPath(parent_url)));

	return {url: pathToFileURL(source_id).href, format: 'module', shortCircuit: true};
};
