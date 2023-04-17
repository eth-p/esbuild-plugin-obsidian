import { expect, test } from '@jest/globals';

import { ObsidianPluginManifest } from './generate-manifest';
import generateVersions from './generate-versions';

test('adds version', () => {
	const { versions, errors, warnings } = generateVersions(
		{},
		{ version: '1.2.3', minAppVersion: '1.0.0' } as ObsidianPluginManifest,
		{},
	);

	expect(versions?.['1.2.3']).toBe('1.0.0');
	expect(errors?.length ?? 0).toBe(0);
	expect(warnings?.length ?? 0).toBe(0);
});

test('changes version', () => {
	const { versions, errors, warnings } = generateVersions(
		{ '1.2.3': '0.0.0' },
		{ version: '1.2.3', minAppVersion: '1.0.0' } as ObsidianPluginManifest,
		{},
	);

	expect(versions?.['1.2.3']).toBe('1.0.0');
	expect(errors?.length ?? 0).toBe(0);
	expect(warnings?.length ?? 0).toBe(0);
});
