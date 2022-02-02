// generated by src/gen/fixtures/someTestObject.schema.ts

import {type A} from './someTestTypes.js';
import {type B, type C} from './someTestTypes.js';
import E, {type D, type C as C2, type F} from './someTestTypes.js';
import E2 from './someTestTypes.js';
import type {F as F2} from './someTestTypes.js';

export interface SomeTestObject {
	a: number;
	b: string;
	c?: A;
	d?: A<B<C<D<typeof E, C2, typeof F, typeof E2, typeof F2>>>>;
}
export type SomeTestPrimitive = number;

// generated by src/gen/fixtures/someTestObject.schema.ts
