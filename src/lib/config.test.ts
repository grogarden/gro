import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {DEFAULT_SEARCH_EXCLUDER, load_config} from './config.js';

test('load_config', async () => {
	const config = await load_config();
	assert.ok(config);
});

test('DEFAULT_SEARCH_EXCLUDER', () => {
	const assert_excludes = (dirname: string) => {
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`a/${dirname}/c`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`a/${dirname}/c/d.js`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`a/${dirname}/`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`a/${dirname}`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/a/${dirname}/c`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/a/${dirname}/c/d.js`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/a/${dirname}/`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/a/${dirname}`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/${dirname}/a`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/${dirname}/a/b.js`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/${dirname}/`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`/${dirname}`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`./${dirname}/a`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`./${dirname}/a/b.js`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`./${dirname}/`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`./${dirname}`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`${dirname}/a`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`${dirname}/a/b.js`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`${dirname}/`), 'should exclude: ' + dirname);
		assert.ok(DEFAULT_SEARCH_EXCLUDER.test(`${dirname}`), 'should exclude: ' + dirname);
	};

	assert_excludes('node_modules');
	assert_excludes('dist');
	assert_excludes('build');
	assert_excludes('.git');
	assert_excludes('.gro');
	assert_excludes('.svelte-kit');

	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('nodemodules'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('a/b/c'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/a/b/c'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/a/b/c.js'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/a/b/c.d.js'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('./a/b/c'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('./a/b/c.d.js'));

	// Special exception for `gro/dist/`:
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/not_gro/dist/a.task.js'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/grodist/a.task.js'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/gro/distE'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('not_gro/dist/a.task.js'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('not_dist/a.task.js'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('grodist/a.task.js'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/home/gro/dist'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/home/gro/dist/'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('/home/gro/dist/a.task.js'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('gro/dist/a.task.js'));
	assert.ok(!DEFAULT_SEARCH_EXCLUDER.test('./gro/dist/a.task.js'));
	// But not `gro/build/` and others because they're not usecases:
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/gro/build/a.task.js'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/gro/buildE'));
	assert.ok(DEFAULT_SEARCH_EXCLUDER.test('/home/gro/node_modules/a.task.js'));
});

test.run();
