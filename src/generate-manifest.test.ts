import { describe, expect, test } from '@jest/globals';

import generateManifest, { PackageJsonDataWithObsidian } from './generate-manifest';
import { PackageJson } from './package-json';

const packageJsonData: PackageJsonDataWithObsidian = {
	name: 'my-plugin',
	description: 'my description',
	version: '1.0.0',
	author: 'John Smith (https://smith.example/john)',
	dependencies: {
		obsidian: '1.0.0',
	},
	funding: {
		url: 'https://funding.example',
	},
	obsidian: {
		name: 'My Plugin',
		isDesktopOnly: false,
		minAppVersion: '1.0.0',
	},
};

function makePackageJson(
	override: Partial<{ [K in keyof PackageJsonDataWithObsidian]: Partial<PackageJsonDataWithObsidian[K]> }>,
): PackageJson {
	const merged = {
		...packageJsonData,
		...override,
		dependencies:
			'dependencies' in override && override.dependencies === undefined
				? undefined
				: {
						...packageJsonData.dependencies,
						...override.dependencies,
				  },
		funding:
			'funding' in override && override.funding === undefined
				? undefined
				: {
						...packageJsonData.funding,
						...override.funding,
				  },
		obsidian:
			'obsidian' in override && override.obsidian === undefined
				? undefined
				: {
						...packageJsonData.obsidian,
						...override.obsidian,
				  },
	};

	return new PackageJson('package.json', JSON.stringify(merged, undefined, 2));
}

test('generates valid manifest', () => {
	const res = generateManifest(makePackageJson({}), {});
	expect(res.errors?.length ?? 0).toBe(0);
	expect(res.warnings?.length ?? 0).toBe(0);

	const manifest = res.manifest;
	expect(manifest).not.toBeNull();
	expect(typeof manifest?.author).toBe('string');
	expect(typeof manifest?.authorUrl).toBe('string');
	expect(typeof manifest?.description).toBe('string');
	expect(typeof manifest?.id).toBe('string');
	expect(typeof manifest?.fundingUrl).toBe('string');
	expect(typeof manifest?.isDesktopOnly).toBe('boolean');
	expect(typeof manifest?.version).toBe('string');
	expect(typeof manifest?.name).toBe('string');
});

describe('manifest name', () => {
	test('default: copies from package name', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ obsidian: { name: undefined } }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(1); // Should be a warning.
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.name).toBe(packageJsonData.name);
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ obsidian: { name: 'foo' } }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.name).toBe('foo');
	});
});

describe('manifest id', () => {
	test('default: copies from package name', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({}), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.id).toBe(packageJsonData.name);
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ name: 'foo' }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.id).toBe('foo');
	});
});

describe('manifest version', () => {
	test('default: copies from package version', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ version: '1.2.3' }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.version).toBe('1.2.3');
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ obsidian: { version: 'foo' } }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(1);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.version).toBe('foo');
	});
});

describe('manifest author', () => {
	test('default: copies from package author', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ author: 'Foo' }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.author).toBe('Foo');
	});

	test('missing: errors', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ author: undefined }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(1);

		expect(manifest?.author).toBeUndefined();
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ obsidian: { author: 'foo' } }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.author).toBe('foo');
	});
});

describe('manifest authorUrl', () => {
	test('default: copies from package author', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ author: 'Foo (https://foo.bar/)' }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.authorUrl).toBe('https://foo.bar/');
	});

	test('missing: errors', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ author: undefined }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(1);

		expect(manifest?.authorUrl).toBeUndefined();
	});

	test('missing: omitted', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ author: { name: 'Foo' } }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.authorUrl).toBeUndefined();
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { authorUrl: 'foo' } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.authorUrl).toBe('foo');
	});
});

describe('manifest description', () => {
	test('default: copies from package description', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ description: 'Foo' }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.description).toBe('Foo');
	});

	test('missing: errors', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ description: undefined }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(1);

		expect(manifest?.description).toBeUndefined();
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { description: 'foo' } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.description).toBe('foo');
	});
});

describe('manifest fundingUrl', () => {
	test('default: copies from package funding', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ funding: { url: 'https://foo.bar/' } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.fundingUrl).toBe('https://foo.bar/');
	});

	test('missing: omitted', () => {
		const { manifest, errors, warnings } = generateManifest(makePackageJson({ funding: undefined }), {});

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.fundingUrl).toBeUndefined();
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { fundingUrl: 'https://foo.bar/' } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.fundingUrl).toBe('https://foo.bar/');
	});
});

describe('manifest minAppVersion', () => {
	test('default: copies from package dependencies', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ dependencies: { obsidian: '0.0.0' }, obsidian: { minAppVersion: undefined } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(1); // Should result in a warning
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.minAppVersion).toBe('0.0.0');
	});

	test('missing: errors', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ dependencies: undefined, obsidian: { minAppVersion: undefined } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(1);

		expect(manifest?.minAppVersion).toBeUndefined();
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { minAppVersion: '0.1.0' } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.minAppVersion).toBe('0.1.0');
	});
});

describe('manifest isDesktopOnly', () => {
	test('default: false', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { isDesktopOnly: undefined } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(1); // Should result in a warning
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.isDesktopOnly).toBe(false);
	});

	test('overridden', () => {
		const { manifest, errors, warnings } = generateManifest(
			makePackageJson({ obsidian: { isDesktopOnly: true } }),
			{},
		);

		expect(manifest).not.toBeNull();
		expect(warnings?.length ?? 0).toBe(0);
		expect(errors?.length ?? 0).toBe(0);

		expect(manifest?.isDesktopOnly).toBe(true);
	});
});
