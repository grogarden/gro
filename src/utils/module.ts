// TODO refactor to be configurable, probably following Rollup's patterns

import {SOURCE_DIR, LIB_DIR, SOURCE_DIRNAME, LIB_DIRNAME} from '../paths.js';

export const MODULE_PATH_SRC_PREFIX = SOURCE_DIR;
export const MODULE_PATH_LIB_PREFIX = `$${LIB_DIR}`;

const INTERNAL_MODULE_MATCHER = new RegExp(`^(\\.?\\.?|${SOURCE_DIRNAME}|\\$${LIB_DIRNAME})\\/`);

export const is_external_module = (module_name: string): boolean =>
	!INTERNAL_MODULE_MATCHER.test(module_name);
