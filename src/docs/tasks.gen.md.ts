import {dirname, relative, basename} from 'path';
import {to_path_parts, to_path_segments} from '@feltcoop/felt/util/path_parsing.js';
import {strip_start} from '@feltcoop/felt/util/string.js';
import {last} from '@feltcoop/felt/util/array.js';

import {Gen, to_output_file_name} from '../gen/gen.js';
import {paths, base_path_to_source_id} from '../paths.js';
import {load_task_modules} from '../task/task_module.js';

// This is the first simple implementation of Gro's automated docs.
// It combines Gro's gen and task systems
// to generate a markdown file describing all of the project's tasks.
// Other projects that use Gro should be able to import this module
// or other otherwise get frictionless access to this specific use case,
// and they should be able to extend or customize it to any degree.

// TODO display more info about each task, including a summary and params
// TODO needs some cleanup and better APIs - paths are confusing and verbose!
// TODO add backlinks to every document that links to this one

export const gen: Gen = async ({fs, origin_id, log}) => {
	const result = await load_task_modules(fs);
	if (!result.ok) {
		for (const reason of result.reasons) {
			log.error(reason);
		}
		throw new Error(result.type);
	}
	const tasks = result.modules;

	// TODO need to get this from project config or something
	const root_path = last(to_path_segments(paths.root));

	const origin_dir = dirname(origin_id);
	const origin_base = basename(origin_id);

	const base_dir = paths.source;
	const relative_path = strip_start(origin_id, base_dir);
	const relative_dir = dirname(relative_path);

	// TODO should this be passed in the context, like `defaultOutputFileName`?
	const output_file_name = to_output_file_name(origin_base);

	// TODO this is GitHub-specific
	const root_link = `[${root_path}](/../..)`;

	// TODO do we want to use absolute paths instead of relative paths,
	// because GitHub works with them and it simplifies the code?
	const path_parts = to_path_parts(relative_dir).map(
		(relative_path_part) =>
			`[${last(to_path_segments(relative_path_part))}](${
				relative(origin_dir, base_path_to_source_id(relative_path_part)) || './'
			})`,
	);
	const breadcrumbs =
		'> <sub>' + [root_link, ...path_parts, output_file_name].join(' / ') + '</sub>';

	// TODO render the footer with the origin_id
	return `# tasks

${breadcrumbs}

What is a \`Task\`? See [\`src/tasks/README.md\`](../task).

## all tasks

${tasks.reduce(
	(task_list, task) =>
		task_list +
		`- [${task.name}](${relative(origin_dir, task.id)})${
			task.mod.task.summary ? ` - ${task.mod.task.summary}` : ''
		}\n`,
	'',
)}
## usage

\`\`\`bash
$ gro some/task/name
\`\`\`

${breadcrumbs}

> <sub>generated by [${origin_base}](${origin_base})</sub>
`;
};
