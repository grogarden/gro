// shim for $app/stores
// @see https://github.com/sveltejs/kit/issues/1485

// TODO support `$app/state`
/* eslint-disable @typescript-eslint/no-deprecated */

import type {
	getStores as base_getStores,
	navigating as base_navigating,
	page as base_page,
	updated as base_updated,
} from '$app/stores';
import {readable} from 'svelte/store';

export const getStores: typeof base_getStores = () => ({navigating, page, updated}) as const;
export const navigating: typeof base_navigating = readable(null);
export const page: typeof base_page = readable({
	url: new URL('https://gro.ryanatkn.com/TODO'),
	params: {},
	route: {id: 'RouteId'},
	status: 200,
	error: null,
	data: {},
	state: {},
	form: {},
});
export const updated: typeof base_updated = readable(true) as any;
updated.check = () => Promise.resolve(true);
