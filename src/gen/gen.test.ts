import * as fp from 'path';
const {resolve} = fp; // TODO esm

import {test} from '../oki/index.js';
import {toGenResult} from './gen.js';

test('toGenResult', t => {
	test('plain string', () => {
		t.equal(toGenResult(resolve('src/foo.gen.ts'), '/**/'), {
			originFileId: resolve('src/foo.gen.ts'),
			files: [{id: resolve('src/foo.ts'), contents: '/**/'}],
		});
	});
	test('object with a contents string', () => {
		t.equal(toGenResult(resolve('src/foo.gen.ts'), {contents: '/**/'}), {
			originFileId: resolve('src/foo.gen.ts'),
			files: [{id: resolve('src/foo.ts'), contents: '/**/'}],
		});
	});
	test('fail with an unresolved id', () => {
		t.throws(() => toGenResult('src/foo.ts', {contents: '/**/'}));
	});
	test('fail with a build id', () => {
		t.throws(() => toGenResult(resolve('build/foo.js'), {contents: '/**/'}));
	});
	test('fail with an empty id', () => {
		t.throws(() => toGenResult('', {contents: '/**/'}));
	});
	test('custom file name', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'fooz.ts',
				contents: '/**/',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/fooz.ts'), contents: '/**/'}],
			},
		);
	});
	test('custom file name that matches the default file name', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo.ts',
				contents: '/**/',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/foo.ts'), contents: '/**/'}],
			},
		);
	});
	test('fail when custom file name explicitly matches the origin', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo.gen.ts',
				contents: '/**/',
			});
		});
	});
	test('fail when file name implicitly matches the origin', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.ts'), {contents: '/**/'});
		});
	});
	test('fail with an empty file name', () => {
		t.throws(() =>
			toGenResult(resolve('src/foo.gen.ts'), {fileName: '', contents: '/**/'}),
		);
	});
	test('additional file name parts', () => {
		t.equal(toGenResult(resolve('src/foo.bar.gen.ts'), {contents: '/**/'}), {
			originFileId: resolve('src/foo.bar.gen.ts'),
			files: [{id: resolve('src/foo.bar.ts'), contents: '/**/'}],
		});
	});
	test('js', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo.js',
				contents: '/**/',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/foo.js'), contents: '/**/'}],
			},
		);
	});
	test('implicit custom file extension', () => {
		t.equal(toGenResult(resolve('src/foo.gen.json.ts'), '[/**/]'), {
			originFileId: resolve('src/foo.gen.json.ts'),
			files: [{id: resolve('src/foo.json'), contents: '[/**/]'}],
		});
	});
	test('implicit empty file extension', () => {
		t.equal(toGenResult(resolve('src/foo.gen..ts'), '[/**/]'), {
			originFileId: resolve('src/foo.gen..ts'),
			files: [{id: resolve('src/foo'), contents: '[/**/]'}],
		});
	});
	test('implicit custom file extension with additional file name parts', () => {
		t.equal(
			toGenResult(resolve('src/foo.bar.gen.json.ts'), {contents: '[/**/]'}),
			{
				originFileId: resolve('src/foo.bar.gen.json.ts'),
				files: [{id: resolve('src/foo.bar.json'), contents: '[/**/]'}],
			},
		);
	});
	test('implicit custom file extension with many dots in between', () => {
		t.equal(toGenResult(resolve('src/foo...gen.ts'), '[/**/]'), {
			originFileId: resolve('src/foo...gen.ts'),
			files: [{id: resolve('src/foo...ts'), contents: '[/**/]'}],
		});
	});
	test('fail with two parts following the .gen. pattern in the file name', () => {
		// This just ensures consistent file names - maybe loosen the restriction?
		// You can still implicitly name files like this,
		// but you have to move ".bar" before ".gen".
		t.throws(() => toGenResult(resolve('src/foo.gen.bar.json.ts'), '/**/'));
	});
	test('fail implicit file extension ending with a dot', () => {
		// This just ensures consistent file names - maybe loosen the restriction?
		// This one is more restrictive than the above,
		// because to have a file ending with a dot
		// you have to use an explicit file name.
		t.throws(() => toGenResult(resolve('src/foo.gen...ts'), '[/**/]'));
	});
	test('fail without a .gen. pattern in the file name', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.ts'), '/**/');
		});
	});
	test('fail without a .gen. pattern in a file name that has multiple other patterns', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.bar.baz.ts'), '/**/');
		});
	});
	test('fail with two .gen. patterns in the file name', () => {
		t.throws(() => toGenResult(resolve('src/gen.gen.ts'), '/**/'));
		t.throws(() => toGenResult(resolve('src/foo.gen.gen.ts'), '/**/'));
		t.throws(() => toGenResult(resolve('src/foo.gen.bar.gen.ts'), '/**/'));
		t.throws(() => toGenResult(resolve('src/foo.gen.bar.gen.baz.ts'), '/**/'));
	});
	test('explicit custom file extension', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo.json',
				contents: '[/**/]',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/foo.json'), contents: '[/**/]'}],
			},
		);
	});
	test('explicit custom empty file extension', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo',
				contents: '[/**/]',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/foo'), contents: '[/**/]'}],
			},
		);
	});
	test('explicit custom file extension ending with a dot', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), {
				fileName: 'foo.',
				contents: '[/**/]',
			}),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [{id: resolve('src/foo.'), contents: '[/**/]'}],
			},
		);
	});
	test('simple array of raw files', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), [
				{contents: '/*1*/'},
				{fileName: 'foo2.ts', contents: '/*2*/'},
			]),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [
					{id: resolve('src/foo.ts'), contents: '/*1*/'},
					{id: resolve('src/foo2.ts'), contents: '/*2*/'},
				],
			},
		);
	});
	test('complex array of raw files', () => {
		t.equal(
			toGenResult(resolve('src/foo.gen.ts'), [
				{contents: '/*1*/'},
				{fileName: 'foo2.ts', contents: '/*2*/'},
				{fileName: 'foo3.ts', contents: '/*3*/'},
				{fileName: 'foo4.ts', contents: '/*4*/'},
				{fileName: 'foo5.json', contents: '[/*5*/]'},
			]),
			{
				originFileId: resolve('src/foo.gen.ts'),
				files: [
					{id: resolve('src/foo.ts'), contents: '/*1*/'},
					{id: resolve('src/foo2.ts'), contents: '/*2*/'},
					{id: resolve('src/foo3.ts'), contents: '/*3*/'},
					{id: resolve('src/foo4.ts'), contents: '/*4*/'},
					{id: resolve('src/foo5.json'), contents: '[/*5*/]'},
				],
			},
		);
	});
	test('fail with duplicate names because of omissions', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.gen.ts'), [
				{contents: '/*1*/'},
				{contents: '/*2*/'},
			]);
		});
	});
	test('fail with duplicate explicit names', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.gen.ts'), [
				{fileName: 'foo.ts', contents: '/*1*/'},
				{fileName: 'foo.ts', contents: '/*2*/'},
			]);
		});
	});
	test('fail with duplicate explicit and implicit names', () => {
		t.throws(() => {
			toGenResult(resolve('src/foo.gen.ts'), [
				{contents: '/*1*/'},
				{fileName: 'foo.ts', contents: '/*2*/'},
			]);
		});
	});
});
