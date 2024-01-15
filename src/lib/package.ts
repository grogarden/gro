// generated by src/lib/package.gen.ts

import type {Package_Json} from './package_json.js';
import type {Src_Json} from './src_json.js';

export const package_json = {
	name: '@grogarden/gro',
	version: '0.109.1',
	description: 'task runner and toolkit extending SvelteKit',
	icon: '🌰',
	public: true,
	bin: {gro: 'dist/gro.js'},
	license: 'MIT',
	homepage: 'https://www.grogarden.org/',
	author: {name: 'Ryan Atkinson', email: 'mail@ryanatkn.com', url: 'https://www.ryanatkn.com/'},
	repository: {type: 'git', url: 'git+https://github.com/grogarden/gro.git'},
	bugs: {url: 'https://github.com/grogarden/gro/issues', email: 'mail@ryanatkn.com'},
	type: 'module',
	engines: {node: '>=20.10'},
	scripts: {
		build: 'rm -rf .gro dist && svelte-package && chmod +x ./dist/gro.js && npm link -f',
		start: 'gro dev',
		test: 'gro test',
	},
	keywords: [
		'web',
		'tools',
		'task runner',
		'tasks',
		'codegen',
		'svelte',
		'sveltekit',
		'vite',
		'typescript',
	],
	files: ['dist'],
	dependencies: {
		'@grogarden/util': '^0.19.0',
		chokidar: '^3.5.3',
		dotenv: '^16.3.1',
		'es-module-lexer': '^1.4.1',
		kleur: '^4.1.5',
		mri: '^1.2.0',
		prettier: '^3.1.1',
		'prettier-plugin-svelte': '^3.1.2',
		'tiny-glob': '^0.2.9',
		'ts-morph': '^21.0.1',
		tslib: '^2.6.2',
		zod: '^3.22.4',
	},
	peerDependencies: {esbuild: '^0.19', svelte: '*'},
	devDependencies: {
		'@changesets/changelog-git': '^0.2.0',
		'@changesets/types': '^6.0.0',
		'@feltjs/eslint-config': '^0.4.1',
		'@fuz.dev/fuz': '^0.81.0',
		'@fuz.dev/fuz_library': '^0.23.0',
		'@sveltejs/adapter-static': '^3.0.1',
		'@sveltejs/kit': '^2.0.6',
		'@sveltejs/package': '^2.2.5',
		'@sveltejs/vite-plugin-svelte': '^3.0.1',
		'@types/fs-extra': '^11.0.4',
		'@types/node': '^20.10.6',
		'@typescript-eslint/eslint-plugin': '^6.17.0',
		'@typescript-eslint/parser': '^6.17.0',
		esbuild: '^0.19.11',
		eslint: '^8.56.0',
		'eslint-plugin-svelte': '^2.35.1',
		svelte: '^4.2.8',
		'svelte-check': '^3.6.2',
		typescript: '^5.3.3',
		uvu: '^0.5.6',
	},
	eslintConfig: {root: true, extends: '@feltjs', rules: {'no-console': 1}},
	prettier: {
		plugins: ['prettier-plugin-svelte'],
		useTabs: true,
		printWidth: 100,
		singleQuote: true,
		bracketSpacing: false,
		overrides: [{files: 'package.json', options: {useTabs: false}}],
	},
	exports: {
		'.': {default: './dist/index.js', types: './dist/index.d.ts'},
		'./args.js': {default: './dist/args.js', types: './dist/args.d.ts'},
		'./build.task.js': {default: './dist/build.task.js', types: './dist/build.task.d.ts'},
		'./changelog.js': {default: './dist/changelog.js', types: './dist/changelog.d.ts'},
		'./changeset.task.js': {
			default: './dist/changeset.task.js',
			types: './dist/changeset.task.d.ts',
		},
		'./check.task.js': {default: './dist/check.task.js', types: './dist/check.task.d.ts'},
		'./clean_fs.js': {default: './dist/clean_fs.js', types: './dist/clean_fs.d.ts'},
		'./clean.task.js': {default: './dist/clean.task.js', types: './dist/clean.task.d.ts'},
		'./cli.js': {default: './dist/cli.js', types: './dist/cli.d.ts'},
		'./commit.task.js': {default: './dist/commit.task.js', types: './dist/commit.task.d.ts'},
		'./config.js': {default: './dist/config.js', types: './dist/config.d.ts'},
		'./deploy.task.js': {default: './dist/deploy.task.js', types: './dist/deploy.task.d.ts'},
		'./dev.task.js': {default: './dist/dev.task.js', types: './dist/dev.task.d.ts'},
		'./env.js': {default: './dist/env.js', types: './dist/env.d.ts'},
		'./esbuild_helpers.js': {
			default: './dist/esbuild_helpers.js',
			types: './dist/esbuild_helpers.d.ts',
		},
		'./esbuild_plugin_external_worker.js': {
			default: './dist/esbuild_plugin_external_worker.js',
			types: './dist/esbuild_plugin_external_worker.d.ts',
		},
		'./esbuild_plugin_svelte.js': {
			default: './dist/esbuild_plugin_svelte.js',
			types: './dist/esbuild_plugin_svelte.d.ts',
		},
		'./esbuild_plugin_sveltekit_local_imports.js': {
			default: './dist/esbuild_plugin_sveltekit_local_imports.js',
			types: './dist/esbuild_plugin_sveltekit_local_imports.d.ts',
		},
		'./esbuild_plugin_sveltekit_shim_alias.js': {
			default: './dist/esbuild_plugin_sveltekit_shim_alias.js',
			types: './dist/esbuild_plugin_sveltekit_shim_alias.d.ts',
		},
		'./esbuild_plugin_sveltekit_shim_app.js': {
			default: './dist/esbuild_plugin_sveltekit_shim_app.js',
			types: './dist/esbuild_plugin_sveltekit_shim_app.d.ts',
		},
		'./esbuild_plugin_sveltekit_shim_env.js': {
			default: './dist/esbuild_plugin_sveltekit_shim_env.js',
			types: './dist/esbuild_plugin_sveltekit_shim_env.d.ts',
		},
		'./format_directory.js': {
			default: './dist/format_directory.js',
			types: './dist/format_directory.d.ts',
		},
		'./format_file.js': {default: './dist/format_file.js', types: './dist/format_file.d.ts'},
		'./format.task.js': {default: './dist/format.task.js', types: './dist/format.task.d.ts'},
		'./fs.js': {default: './dist/fs.js', types: './dist/fs.d.ts'},
		'./gen_module.js': {default: './dist/gen_module.js', types: './dist/gen_module.d.ts'},
		'./gen.task.js': {default: './dist/gen.task.js', types: './dist/gen.task.d.ts'},
		'./gen.js': {default: './dist/gen.js', types: './dist/gen.d.ts'},
		'./git.js': {default: './dist/git.js', types: './dist/git.d.ts'},
		'./github.js': {default: './dist/github.js', types: './dist/github.d.ts'},
		'./gro_helpers.js': {default: './dist/gro_helpers.js', types: './dist/gro_helpers.d.ts'},
		'./gro_plugin_gen.js': {
			default: './dist/gro_plugin_gen.js',
			types: './dist/gro_plugin_gen.d.ts',
		},
		'./gro_plugin_server.js': {
			default: './dist/gro_plugin_server.js',
			types: './dist/gro_plugin_server.d.ts',
		},
		'./gro_plugin_sveltekit_app.js': {
			default: './dist/gro_plugin_sveltekit_app.js',
			types: './dist/gro_plugin_sveltekit_app.d.ts',
		},
		'./gro_plugin_sveltekit_library.js': {
			default: './dist/gro_plugin_sveltekit_library.js',
			types: './dist/gro_plugin_sveltekit_library.d.ts',
		},
		'./gro.config.default.js': {
			default: './dist/gro.config.default.js',
			types: './dist/gro.config.default.d.ts',
		},
		'./gro.js': {default: './dist/gro.js', types: './dist/gro.d.ts'},
		'./hash.js': {default: './dist/hash.js', types: './dist/hash.d.ts'},
		'./input_path.js': {default: './dist/input_path.js', types: './dist/input_path.d.ts'},
		'./invoke_task.js': {default: './dist/invoke_task.js', types: './dist/invoke_task.d.ts'},
		'./invoke.js': {default: './dist/invoke.js', types: './dist/invoke.d.ts'},
		'./lint.task.js': {default: './dist/lint.task.js', types: './dist/lint.task.d.ts'},
		'./loader.js': {default: './dist/loader.js', types: './dist/loader.d.ts'},
		'./module.js': {default: './dist/module.js', types: './dist/module.d.ts'},
		'./modules.js': {default: './dist/modules.js', types: './dist/modules.d.ts'},
		'./package_json.js': {default: './dist/package_json.js', types: './dist/package_json.d.ts'},
		'./package.gen.js': {default: './dist/package.gen.js', types: './dist/package.gen.d.ts'},
		'./package.js': {default: './dist/package.js', types: './dist/package.d.ts'},
		'./path.js': {default: './dist/path.js', types: './dist/path.d.ts'},
		'./paths.js': {default: './dist/paths.js', types: './dist/paths.d.ts'},
		'./plugin.js': {default: './dist/plugin.js', types: './dist/plugin.d.ts'},
		'./print_task.js': {default: './dist/print_task.js', types: './dist/print_task.d.ts'},
		'./publish.task.js': {default: './dist/publish.task.js', types: './dist/publish.task.d.ts'},
		'./release.task.js': {default: './dist/release.task.js', types: './dist/release.task.d.ts'},
		'./resolve_node_specifier.js': {
			default: './dist/resolve_node_specifier.js',
			types: './dist/resolve_node_specifier.d.ts',
		},
		'./resolve_specifier.js': {
			default: './dist/resolve_specifier.js',
			types: './dist/resolve_specifier.d.ts',
		},
		'./run_gen.js': {default: './dist/run_gen.js', types: './dist/run_gen.d.ts'},
		'./run_task.js': {default: './dist/run_task.js', types: './dist/run_task.d.ts'},
		'./run.task.js': {default: './dist/run.task.js', types: './dist/run.task.d.ts'},
		'./search_fs.js': {default: './dist/search_fs.js', types: './dist/search_fs.d.ts'},
		'./src_json.js': {default: './dist/src_json.js', types: './dist/src_json.d.ts'},
		'./sveltekit_config.js': {
			default: './dist/sveltekit_config.js',
			types: './dist/sveltekit_config.d.ts',
		},
		'./sveltekit_shim_app_environment.js': {
			default: './dist/sveltekit_shim_app_environment.js',
			types: './dist/sveltekit_shim_app_environment.d.ts',
		},
		'./sveltekit_shim_app_forms.js': {
			default: './dist/sveltekit_shim_app_forms.js',
			types: './dist/sveltekit_shim_app_forms.d.ts',
		},
		'./sveltekit_shim_app_navigation.js': {
			default: './dist/sveltekit_shim_app_navigation.js',
			types: './dist/sveltekit_shim_app_navigation.d.ts',
		},
		'./sveltekit_shim_app_paths.js': {
			default: './dist/sveltekit_shim_app_paths.js',
			types: './dist/sveltekit_shim_app_paths.d.ts',
		},
		'./sveltekit_shim_app_stores.js': {
			default: './dist/sveltekit_shim_app_stores.js',
			types: './dist/sveltekit_shim_app_stores.d.ts',
		},
		'./sveltekit_shim_app.js': {
			default: './dist/sveltekit_shim_app.js',
			types: './dist/sveltekit_shim_app.d.ts',
		},
		'./sveltekit_shim_env.js': {
			default: './dist/sveltekit_shim_env.js',
			types: './dist/sveltekit_shim_env.d.ts',
		},
		'./sync.task.js': {default: './dist/sync.task.js', types: './dist/sync.task.d.ts'},
		'./task_module.js': {default: './dist/task_module.js', types: './dist/task_module.d.ts'},
		'./task.js': {default: './dist/task.js', types: './dist/task.d.ts'},
		'./test.task.js': {default: './dist/test.task.js', types: './dist/test.task.d.ts'},
		'./throttle.js': {default: './dist/throttle.js', types: './dist/throttle.d.ts'},
		'./type_imports.js': {default: './dist/type_imports.js', types: './dist/type_imports.d.ts'},
		'./typecheck.task.js': {
			default: './dist/typecheck.task.js',
			types: './dist/typecheck.task.d.ts',
		},
		'./upgrade.task.js': {default: './dist/upgrade.task.js', types: './dist/upgrade.task.d.ts'},
		'./watch_dir.js': {default: './dist/watch_dir.js', types: './dist/watch_dir.d.ts'},
	},
} satisfies Package_Json;

export const src_json = {
	name: '@grogarden/gro',
	version: '0.109.1',
	modules: {
		'.': {
			path: 'index.ts',
			declarations: [
				{name: 'Gro_Config', kind: 'type'},
				{name: 'Create_Gro_Config', kind: 'type'},
				{name: 'Plugin', kind: 'type'},
				{name: 'replace_plugin', kind: 'function'},
				{name: 'Gen', kind: 'type'},
				{name: 'Gen_Context', kind: 'type'},
				{name: 'Task', kind: 'type'},
				{name: 'Task_Context', kind: 'type'},
				{name: 'Task_Error', kind: 'class'},
			],
		},
		'./args.js': {
			path: 'args.ts',
			declarations: [
				{name: 'Args', kind: 'type'},
				{name: 'Arg_Value', kind: 'type'},
				{name: 'Arg_Schema', kind: 'type'},
				{name: 'parse_args', kind: 'function'},
				{name: 'serialize_args', kind: 'function'},
				{name: 'to_task_args', kind: 'function'},
				{name: 'to_raw_rest_args', kind: 'function'},
				{name: 'to_forwarded_args', kind: 'function'},
				{name: 'to_forwarded_args_by_command', kind: 'function'},
				{name: 'print_command_args', kind: 'function'},
			],
		},
		'./build.task.js': {
			path: 'build.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./changelog.js': {
			path: 'changelog.ts',
			declarations: [{name: 'update_changelog', kind: 'function'}],
		},
		'./changeset.task.js': {
			path: 'changeset.task.ts',
			declarations: [
				{name: 'Changeset_Bump', kind: 'variable'},
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./check.task.js': {
			path: 'check.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./clean_fs.js': {path: 'clean_fs.ts', declarations: [{name: 'clean_fs', kind: 'function'}]},
		'./clean.task.js': {
			path: 'clean.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./cli.js': {
			path: 'cli.ts',
			declarations: [
				{name: 'find_cli', kind: 'function'},
				{name: 'spawn_cli', kind: 'function'},
			],
		},
		'./commit.task.js': {
			path: 'commit.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./config.js': {
			path: 'config.ts',
			declarations: [
				{name: 'Gro_Config', kind: 'type'},
				{name: 'Create_Gro_Config', kind: 'type'},
				{name: 'create_empty_config', kind: 'function'},
				{name: 'DEFAULT_EXPORTS_EXCLUDER', kind: 'variable'},
				{name: 'Gro_Config_Module', kind: 'type'},
				{name: 'load_config', kind: 'function'},
				{name: 'validate_config_module', kind: 'function'},
			],
		},
		'./deploy.task.js': {
			path: 'deploy.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./dev.task.js': {
			path: 'dev.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'DevTask_Context', kind: 'type'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./env.js': {
			path: 'env.ts',
			declarations: [
				{name: 'load_env', kind: 'function'},
				{name: 'merge_envs', kind: 'function'},
				{name: 'is_private_env', kind: 'function'},
				{name: 'is_public_env', kind: 'function'},
				{name: 'load_from_env', kind: 'function'},
			],
		},
		'./esbuild_helpers.js': {
			path: 'esbuild_helpers.ts',
			declarations: [
				{name: 'print_build_result', kind: 'function'},
				{name: 'to_define_import_meta_env', kind: 'function'},
				{name: 'ts_transform_options', kind: 'variable'},
			],
		},
		'./esbuild_plugin_external_worker.js': {
			path: 'esbuild_plugin_external_worker.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_external_worker', kind: 'function'},
			],
		},
		'./esbuild_plugin_svelte.js': {
			path: 'esbuild_plugin_svelte.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_svelte', kind: 'function'},
			],
		},
		'./esbuild_plugin_sveltekit_local_imports.js': {
			path: 'esbuild_plugin_sveltekit_local_imports.ts',
			declarations: [{name: 'esbuild_plugin_sveltekit_local_imports', kind: 'function'}],
		},
		'./esbuild_plugin_sveltekit_shim_alias.js': {
			path: 'esbuild_plugin_sveltekit_shim_alias.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_sveltekit_shim_alias', kind: 'function'},
			],
		},
		'./esbuild_plugin_sveltekit_shim_app.js': {
			path: 'esbuild_plugin_sveltekit_shim_app.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_sveltekit_shim_app', kind: 'function'},
			],
		},
		'./esbuild_plugin_sveltekit_shim_env.js': {
			path: 'esbuild_plugin_sveltekit_shim_env.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_sveltekit_shim_env', kind: 'function'},
			],
		},
		'./format_directory.js': {
			path: 'format_directory.ts',
			declarations: [{name: 'format_directory', kind: 'function'}],
		},
		'./format_file.js': {
			path: 'format_file.ts',
			declarations: [{name: 'format_file', kind: 'function'}],
		},
		'./format.task.js': {
			path: 'format.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./fs.js': {path: 'fs.ts', declarations: [{name: 'clean_fs', kind: 'function'}]},
		'./gen_module.js': {
			path: 'gen_module.ts',
			declarations: [
				{name: 'GEN_FILE_PATTERN_TEXT', kind: 'variable'},
				{name: 'GEN_FILE_PATTERN', kind: 'variable'},
				{name: 'is_gen_path', kind: 'function'},
				{name: 'GEN_SCHEMA_FILE_PATTERN_TEXT', kind: 'variable'},
				{name: 'GEN_SCHEMA_FILE_PATTERN', kind: 'variable'},
				{name: 'GEN_SCHEMA_PATH_SUFFIX', kind: 'variable'},
				{name: 'GEN_SCHEMA_IDENTIFIER_SUFFIX', kind: 'variable'},
				{name: 'to_gen_schema_name', kind: 'function'},
				{name: 'Gen_Module_Type', kind: 'type'},
				{name: 'Gen_Module', kind: 'type'},
				{name: 'Basic_Gen_Module', kind: 'type'},
				{name: 'Schema_Gen_Module', kind: 'type'},
				{name: 'to_gen_module_type', kind: 'function'},
				{name: 'gen_module_meta', kind: 'variable'},
				{name: 'validate_gen_module', kind: 'variable'},
				{name: 'Gen_Module_Meta', kind: 'type'},
				{name: 'Basic_Gen_Module_Meta', kind: 'type'},
				{name: 'load_gen_module', kind: 'function'},
				{name: 'Check_Gen_Module_Result', kind: 'type'},
				{name: 'check_gen_modules', kind: 'function'},
				{name: 'check_gen_module', kind: 'function'},
				{name: 'find_gen_modules', kind: 'function'},
			],
		},
		'./gen.task.js': {
			path: 'gen.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./gen.js': {
			path: 'gen.ts',
			declarations: [
				{name: 'Gen_Result', kind: 'type'},
				{name: 'Gen_File', kind: 'type'},
				{name: 'Gen', kind: 'type'},
				{name: 'Gen_Context', kind: 'type'},
				{name: 'Raw_Gen_Result', kind: 'type'},
				{name: 'Raw_Gen_File', kind: 'type'},
				{name: 'Gen_Config', kind: 'variable'},
				{name: 'Gen_Results', kind: 'type'},
				{name: 'Gen_Module_Result', kind: 'type'},
				{name: 'Gen_Module_Result_Success', kind: 'type'},
				{name: 'Gen_Module_Result_Failure', kind: 'type'},
				{name: 'to_gen_result', kind: 'function'},
				{name: 'to_output_file_name', kind: 'function'},
			],
		},
		'./git.js': {
			path: 'git.ts',
			declarations: [
				{name: 'Git_Origin', kind: 'variable'},
				{name: 'Git_Branch', kind: 'variable'},
				{name: 'git_current_branch_name', kind: 'function'},
				{name: 'git_remote_branch_exists', kind: 'function'},
				{name: 'git_local_branch_exists', kind: 'function'},
				{name: 'git_check_clean_workspace', kind: 'function'},
				{name: 'git_fetch', kind: 'function'},
				{name: 'git_checkout', kind: 'function'},
				{name: 'git_pull', kind: 'function'},
				{name: 'git_push', kind: 'function'},
				{name: 'git_push_to_create', kind: 'function'},
				{name: 'git_delete_local_branch', kind: 'function'},
				{name: 'git_delete_remote_branch', kind: 'function'},
				{name: 'git_reset_branch_to_first_commit', kind: 'function'},
				{name: 'git_current_commit_hash', kind: 'function'},
				{name: 'git_current_branch_first_commit_hash', kind: 'function'},
				{name: 'git_check_setting_pull_rebase', kind: 'function'},
				{name: 'git_clone_locally', kind: 'function'},
			],
		},
		'./github.js': {
			path: 'github.ts',
			declarations: [
				{name: 'Github_Pull_Request', kind: 'variable'},
				{name: 'github_fetch_commit_prs', kind: 'function'},
			],
		},
		'./gro_helpers.js': {
			path: 'gro_helpers.ts',
			declarations: [
				{name: 'resolve_gro_module_path', kind: 'function'},
				{name: 'spawn_with_loader', kind: 'function'},
			],
		},
		'./gro_plugin_gen.js': {
			path: 'gro_plugin_gen.ts',
			declarations: [
				{name: 'Task_Args', kind: 'type'},
				{name: 'plugin', kind: 'function'},
			],
		},
		'./gro_plugin_server.js': {
			path: 'gro_plugin_server.ts',
			declarations: [
				{name: 'SERVER_SOURCE_ID', kind: 'variable'},
				{name: 'has_server', kind: 'function'},
				{name: 'Options', kind: 'type'},
				{name: 'Outpaths', kind: 'type'},
				{name: 'Create_Outpaths', kind: 'type'},
				{name: 'gro_plugin_server', kind: 'function'},
			],
		},
		'./gro_plugin_sveltekit_app.js': {
			path: 'gro_plugin_sveltekit_app.ts',
			declarations: [
				{name: 'has_sveltekit_app', kind: 'function'},
				{name: 'Options', kind: 'type'},
				{name: 'Host_Target', kind: 'type'},
				{name: 'gro_plugin_sveltekit_app', kind: 'function'},
			],
		},
		'./gro_plugin_sveltekit_library.js': {
			path: 'gro_plugin_sveltekit_library.ts',
			declarations: [
				{name: 'has_sveltekit_library', kind: 'function'},
				{name: 'gro_plugin_sveltekit_library', kind: 'function'},
			],
		},
		'./gro.config.default.js': {
			path: 'gro.config.default.ts',
			declarations: [{name: 'default', kind: 'function'}],
		},
		'./gro.js': {path: 'gro.ts', declarations: []},
		'./hash.js': {path: 'hash.ts', declarations: [{name: 'to_hash', kind: 'function'}]},
		'./input_path.js': {
			path: 'input_path.ts',
			declarations: [
				{name: 'resolve_input_path', kind: 'function'},
				{name: 'resolve_input_paths', kind: 'function'},
				{name: 'get_possible_source_ids', kind: 'function'},
				{name: 'load_source_path_data_by_input_path', kind: 'function'},
				{name: 'load_source_ids_by_input_path', kind: 'function'},
			],
		},
		'./invoke_task.js': {
			path: 'invoke_task.ts',
			declarations: [{name: 'invoke_task', kind: 'function'}],
		},
		'./invoke.js': {path: 'invoke.ts', declarations: []},
		'./lint.task.js': {
			path: 'lint.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./loader.js': {
			path: 'loader.ts',
			declarations: [
				{name: 'load', kind: 'function'},
				{name: 'resolve', kind: 'function'},
			],
		},
		'./module.js': {path: 'module.ts', declarations: []},
		'./modules.js': {
			path: 'modules.ts',
			declarations: [
				{name: 'Module_Meta', kind: 'type'},
				{name: 'Load_Module_Result', kind: 'type'},
				{name: 'Load_Module_Failure', kind: 'type'},
				{name: 'load_module', kind: 'function'},
				{name: 'Find_Modules_Result', kind: 'type'},
				{name: 'Find_Modules_Failure', kind: 'type'},
				{name: 'Load_Modules_Result', kind: 'type'},
				{name: 'find_modules', kind: 'function'},
				{name: 'load_modules', kind: 'function'},
			],
		},
		'./package_json.js': {
			path: 'package_json.ts',
			declarations: [
				{name: 'transform_empty_object_to_undefined', kind: 'function'},
				{name: 'Package_Json_Repository', kind: 'variable'},
				{name: 'Package_Json_Author', kind: 'variable'},
				{name: 'Package_Json_Funding', kind: 'variable'},
				{name: 'Package_Json_Exports', kind: 'variable'},
				{name: 'Package_Json', kind: 'variable'},
				{name: 'Map_Package_Json', kind: 'type'},
				{name: 'EMPTY_PACKAGE_JSON', kind: 'variable'},
				{name: 'load_package_json', kind: 'function'},
				{name: 'sync_package_json', kind: 'function'},
				{name: 'load_gro_package_json', kind: 'function'},
				{name: 'write_package_json', kind: 'function'},
				{name: 'serialize_package_json', kind: 'function'},
				{name: 'update_package_json', kind: 'function'},
				{name: 'to_package_exports', kind: 'function'},
				{name: 'parse_repo_url', kind: 'function'},
			],
		},
		'./package.gen.js': {path: 'package.gen.ts', declarations: [{name: 'gen', kind: 'function'}]},
		'./package.js': {
			path: 'package.ts',
			declarations: [
				{name: 'package_json', kind: 'variable'},
				{name: 'src_json', kind: 'variable'},
			],
		},
		'./path.js': {
			path: 'path.ts',
			declarations: [
				{name: 'resolve_input_path', kind: 'function'},
				{name: 'resolve_input_paths', kind: 'function'},
				{name: 'get_possible_source_ids', kind: 'function'},
				{name: 'load_source_path_data_by_input_path', kind: 'function'},
				{name: 'load_source_ids_by_input_path', kind: 'function'},
			],
		},
		'./paths.js': {
			path: 'paths.ts',
			declarations: [
				{name: 'SOURCE_DIRNAME', kind: 'variable'},
				{name: 'GRO_DIRNAME', kind: 'variable'},
				{name: 'GRO_DIST_PREFIX', kind: 'variable'},
				{name: 'SERVER_DIST_PATH', kind: 'variable'},
				{name: 'LIB_DIRNAME', kind: 'variable'},
				{name: 'ROUTES_DIRNAME', kind: 'variable'},
				{name: 'GRO_DEV_DIRNAME', kind: 'variable'},
				{name: 'SOURCE_DIR', kind: 'variable'},
				{name: 'GRO_DIR', kind: 'variable'},
				{name: 'GRO_DEV_DIR', kind: 'variable'},
				{name: 'LIB_PATH', kind: 'variable'},
				{name: 'LIB_DIR', kind: 'variable'},
				{name: 'CONFIG_PATH', kind: 'variable'},
				{name: 'README_FILENAME', kind: 'variable'},
				{name: 'SVELTEKIT_CONFIG_FILENAME', kind: 'variable'},
				{name: 'VITE_CONFIG_FILENAME', kind: 'variable'},
				{name: 'SVELTEKIT_DEV_DIRNAME', kind: 'variable'},
				{name: 'SVELTEKIT_BUILD_DIRNAME', kind: 'variable'},
				{name: 'SVELTEKIT_DIST_DIRNAME', kind: 'variable'},
				{name: 'NODE_MODULES_DIRNAME', kind: 'variable'},
				{name: 'SVELTEKIT_VITE_CACHE_PATH', kind: 'variable'},
				{name: 'GITHUB_DIRNAME', kind: 'variable'},
				{name: 'GIT_DIRNAME', kind: 'variable'},
				{name: 'TSCONFIG_FILENAME', kind: 'variable'},
				{name: 'Paths', kind: 'type'},
				{name: 'Url', kind: 'variable'},
				{name: 'Email', kind: 'variable'},
				{name: 'Source_Id', kind: 'variable'},
				{name: 'Build_Id', kind: 'variable'},
				{name: 'create_paths', kind: 'function'},
				{name: 'paths_from_id', kind: 'function'},
				{name: 'is_gro_id', kind: 'function'},
				{name: 'to_root_path', kind: 'function'},
				{name: 'source_id_to_base_path', kind: 'function'},
				{name: 'base_path_to_source_id', kind: 'function'},
				{name: 'lib_path_to_import_id', kind: 'function'},
				{name: 'import_id_to_lib_path', kind: 'function'},
				{name: 'to_gro_input_path', kind: 'function'},
				{name: 'replace_root_dir', kind: 'function'},
				{name: 'print_path', kind: 'function'},
				{name: 'print_path_or_gro_path', kind: 'function'},
				{name: 'replace_extension', kind: 'function'},
				{name: 'gro_dir_basename', kind: 'variable'},
				{name: 'paths', kind: 'variable'},
				{name: 'is_this_project_gro', kind: 'variable'},
				{name: 'gro_paths', kind: 'variable'},
				{name: 'gro_sveltekit_dist_dir', kind: 'variable'},
			],
		},
		'./plugin.js': {
			path: 'plugin.ts',
			declarations: [
				{name: 'Plugin', kind: 'type'},
				{name: 'Create_Config_Plugins', kind: 'type'},
				{name: 'Plugin_Context', kind: 'type'},
				{name: 'Plugins', kind: 'class'},
				{name: 'replace_plugin', kind: 'function'},
			],
		},
		'./print_task.js': {
			path: 'print_task.ts',
			declarations: [
				{name: 'log_available_tasks', kind: 'function'},
				{name: 'log_error_reasons', kind: 'function'},
				{name: 'print_task_help', kind: 'function'},
			],
		},
		'./publish.task.js': {
			path: 'publish.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./release.task.js': {
			path: 'release.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./resolve_node_specifier.js': {
			path: 'resolve_node_specifier.ts',
			declarations: [
				{name: 'resolve_node_specifier', kind: 'function'},
				{name: 'Parsed_Node_Specifier', kind: 'type'},
				{name: 'parse_node_specifier', kind: 'function'},
			],
		},
		'./resolve_specifier.js': {
			path: 'resolve_specifier.ts',
			declarations: [
				{name: 'Resolved_Specifier', kind: 'type'},
				{name: 'resolve_specifier', kind: 'function'},
			],
		},
		'./run_gen.js': {
			path: 'run_gen.ts',
			declarations: [
				{name: 'GEN_NO_PROD_MESSAGE', kind: 'variable'},
				{name: 'run_gen', kind: 'function'},
				{name: 'to_gen_import_path', kind: 'function'},
			],
		},
		'./run_task.js': {
			path: 'run_task.ts',
			declarations: [
				{name: 'Run_Task_Result', kind: 'type'},
				{name: 'run_task', kind: 'function'},
			],
		},
		'./run.task.js': {
			path: 'run.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./search_fs.js': {
			path: 'search_fs.ts',
			declarations: [
				{name: 'Search_Fs_Options', kind: 'type'},
				{name: 'search_fs', kind: 'function'},
			],
		},
		'./src_json.js': {
			path: 'src_json.ts',
			declarations: [
				{name: 'Src_Module_Declaration', kind: 'variable'},
				{name: 'Src_Module', kind: 'variable'},
				{name: 'Src_Modules', kind: 'variable'},
				{name: 'Src_Json', kind: 'variable'},
				{name: 'Map_Src_Json', kind: 'type'},
				{name: 'create_src_json', kind: 'function'},
				{name: 'serialize_src_json', kind: 'function'},
				{name: 'to_src_modules', kind: 'function'},
			],
		},
		'./sveltekit_config.js': {
			path: 'sveltekit_config.ts',
			declarations: [
				{name: 'load_sveltekit_config', kind: 'function'},
				{name: 'Parsed_Sveltekit_Config', kind: 'type'},
				{name: 'init_sveltekit_config', kind: 'function'},
			],
		},
		'./sveltekit_shim_app_environment.js': {
			path: 'sveltekit_shim_app_environment.ts',
			declarations: [
				{name: 'browser', kind: 'variable'},
				{name: 'building', kind: 'variable'},
				{name: 'dev', kind: 'variable'},
				{name: 'version', kind: 'variable'},
			],
		},
		'./sveltekit_shim_app_forms.js': {
			path: 'sveltekit_shim_app_forms.ts',
			declarations: [
				{name: 'applyAction', kind: 'function'},
				{name: 'deserialize', kind: 'function'},
				{name: 'enhance', kind: 'function'},
			],
		},
		'./sveltekit_shim_app_navigation.js': {
			path: 'sveltekit_shim_app_navigation.ts',
			declarations: [
				{name: 'afterNavigate', kind: 'function'},
				{name: 'beforeNavigate', kind: 'function'},
				{name: 'disableScrollHandling', kind: 'function'},
				{name: 'goto', kind: 'function'},
				{name: 'invalidate', kind: 'function'},
				{name: 'invalidateAll', kind: 'function'},
				{name: 'preloadCode', kind: 'function'},
				{name: 'preloadData', kind: 'function'},
			],
		},
		'./sveltekit_shim_app_paths.js': {
			path: 'sveltekit_shim_app_paths.ts',
			declarations: [
				{name: 'assets', kind: 'variable'},
				{name: 'base', kind: 'variable'},
				{name: 'resolveRoute', kind: 'function'},
			],
		},
		'./sveltekit_shim_app_stores.js': {
			path: 'sveltekit_shim_app_stores.ts',
			declarations: [
				{name: 'getStores', kind: 'function'},
				{name: 'navigating', kind: 'variable'},
				{name: 'page', kind: 'variable'},
				{name: 'updated', kind: 'variable'},
			],
		},
		'./sveltekit_shim_app.js': {
			path: 'sveltekit_shim_app.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_sveltekit_shim_app', kind: 'function'},
			],
		},
		'./sveltekit_shim_env.js': {
			path: 'sveltekit_shim_env.ts',
			declarations: [
				{name: 'Options', kind: 'type'},
				{name: 'esbuild_plugin_sveltekit_shim_env', kind: 'function'},
			],
		},
		'./sync.task.js': {
			path: 'sync.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
				{name: 'sveltekit_sync', kind: 'function'},
			],
		},
		'./task_module.js': {path: 'task_module.ts', declarations: []},
		'./task.js': {
			path: 'task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./test.task.js': {
			path: 'test.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./throttle.js': {path: 'throttle.ts', declarations: [{name: 'throttle', kind: 'function'}]},
		'./type_imports.js': {
			path: 'type_imports.ts',
			declarations: [{name: 'normalize_type_imports', kind: 'function'}],
		},
		'./typecheck.task.js': {
			path: 'typecheck.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./upgrade.task.js': {
			path: 'upgrade.task.ts',
			declarations: [
				{name: 'Args', kind: 'variable'},
				{name: 'task', kind: 'variable'},
			],
		},
		'./watch_dir.js': {
			path: 'watch_dir.ts',
			declarations: [
				{name: 'Watch_Node_Fs', kind: 'type'},
				{name: 'Watcher_Change', kind: 'type'},
				{name: 'Watcher_Change_Type', kind: 'type'},
				{name: 'Watcher_Change_Callback', kind: 'type'},
				{name: 'Options', kind: 'type'},
				{name: 'watch_dir', kind: 'function'},
			],
		},
	},
} satisfies Src_Json;

// generated by src/lib/package.gen.ts
