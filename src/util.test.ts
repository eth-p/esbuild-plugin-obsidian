import { expect, test } from '@jest/globals';

import { dirname, join } from 'node:path';

import { findPackageJsonFile } from './util';

const __filename = new URL(import.meta.url).pathname;
const __dirname = dirname(__filename);

test('findPackageJsonFile', async () => {
	expect(findPackageJsonFile()).resolves.toBe(join(dirname(__dirname), 'package.json'));
	await expect(findPackageJsonFile('/')).rejects.toThrow();
});
