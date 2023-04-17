import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	PackageJson,
	PackageJsonData,
	getAuthorName,
	getAuthorURL,
	getFundingURL,
	getObsidianDependencyVersion,
	parsePersonString,
} from './package-json';

describe('parsePersonString', () => {
	test('only first name', () => {
		expect(parsePersonString('John')).toStrictEqual({ name: 'John', url: null, email: null });
	});

	test('first and last name', () => {
		expect(parsePersonString('John Smith')).toStrictEqual({ name: 'John Smith', url: null, email: null });
	});

	test('first name and last initial', () => {
		expect(parsePersonString('John S.')).toStrictEqual({ name: 'John S.', url: null, email: null });
	});

	test('first initial and last name', () => {
		expect(parsePersonString('J. Smith')).toStrictEqual({ name: 'J. Smith', url: null, email: null });
	});

	test('name and email', () => {
		expect(parsePersonString('John Smith <john@smith.example>')).toStrictEqual({
			name: 'John Smith',
			url: null,
			email: 'john@smith.example',
		});
	});

	test('name and url', () => {
		expect(parsePersonString('John Smith (https://smith.example/john)')).toStrictEqual({
			name: 'John Smith',
			url: 'https://smith.example/john',
			email: null,
		});
	});

	test('name, url, and email', () => {
		expect(parsePersonString('John Smith <john@smith.example> (https://smith.example/john)')).toStrictEqual({
			name: 'John Smith',
			url: 'https://smith.example/john',
			email: 'john@smith.example',
		});

		expect(parsePersonString('John Smith (https://smith.example/john) <john@smith.example>')).toStrictEqual({
			name: 'John Smith',
			url: 'https://smith.example/john',
			email: 'john@smith.example',
		});
	});
});

describe('getAuthorName', () => {
	test('author field is not a value', () => {
		expect(getAuthorName({ author: null } as unknown as PackageJsonData)).toBe(null);
		expect(getAuthorName({ author: undefined } as PackageJsonData)).toBe(null);
	});

	test('author field is string', () => {
		expect(getAuthorName({ author: 'john' } as PackageJsonData)).toBe('john');
		expect(getAuthorName({ author: 'john <john@smith.example>' } as PackageJsonData)).toBe('john');
		expect(getAuthorName({ author: 'john (https://smith.example/john)' } as PackageJsonData)).toBe('john');
	});

	test('author field is an object', () => {
		expect(getAuthorName({ author: { name: 'john' } } as PackageJsonData)).toBe('john');
	});
});

describe('getAuthorURL', () => {
	test('author field is not a value', () => {
		expect(getAuthorURL({ author: null } as unknown as PackageJsonData)).toBe(null);
		expect(getAuthorURL({ author: undefined } as PackageJsonData)).toBe(null);
	});

	test('author field is string', () => {
		expect(getAuthorURL({ author: 'john' } as PackageJsonData)).toBe(null);
		expect(getAuthorURL({ author: 'john (https://smith.example/john)' } as PackageJsonData)).toBe(
			'https://smith.example/john',
		);
	});

	test('author field is an object', () => {
		expect(getAuthorURL({ author: { name: 'john' } } as PackageJsonData)).toBe(null);
		expect(getAuthorURL({ author: { name: 'john', url: 'url' } } as PackageJsonData)).toBe('url');
	});
});

describe('getFundingURL', () => {
	test('funding field is not a value', () => {
		expect(getFundingURL({ funding: null } as unknown as PackageJsonData)).toBe(null);
		expect(getFundingURL({ funding: undefined } as PackageJsonData)).toBe(null);
	});

	test('funding URL is not a value', () => {
		expect(getFundingURL({ funding: { url: null } } as unknown as PackageJsonData)).toBe(null);
		expect(getFundingURL({ funding: { url: undefined } } as unknown as PackageJsonData)).toBe(null);
	});

	test('funding URL is a string', () => {
		expect(getFundingURL({ funding: { url: 'foo' } } as PackageJsonData)).toBe('foo');
	});
});

describe('getObsidianDependencyVersion', () => {
	test('when no dependencies', () => {
		expect(getObsidianDependencyVersion({} as PackageJsonData)).toBe(null);
	});

	test('when empty dependencies', () => {
		expect(getObsidianDependencyVersion({ dependencies: {}, devDependencies: {} } as PackageJsonData)).toBe(null);
	});

	test('when inside dependencies', () => {
		expect(
			getObsidianDependencyVersion({
				dependencies: {
					obsidian: '1.2.3',
				},
			} as unknown as PackageJsonData),
		).toBe('1.2.3');
	});

	test('when inside devDependencies', () => {
		expect(
			getObsidianDependencyVersion({
				devDependencies: {
					obsidian: '1.2.3',
				},
			} as unknown as PackageJsonData),
		).toBe('1.2.3');
	});

	test('when inside both', () => {
		expect(
			getObsidianDependencyVersion({
				devDependencies: {
					obsidian: '1.2.3',
				},
				dependencies: {
					obsidian: '3.2.1',
				},
			} as unknown as PackageJsonData),
		).toBe('3.2.1');
	});
});

describe('PackageJson.constructor', () => {
	test('copies file path', () => {
		expect(new PackageJson('path.json', '{}').file).toBe('path.json');
	});
});

describe('PackageJson.pos', () => {
	// prettier-ignore
	const packageJsonLines = [
		'{',
		'  "foo": "bar"',
		'}',
	];

	const packageJson = new PackageJson('path.json', packageJsonLines.join('\n'));

	test('returns null on failure', () => {
		expect(packageJson.pos('.nonexistent')).toBeNull();
	});

	test('gets position correctly', () => {
		const pos = packageJson.pos('.foo');
		expect(pos).not.toBeNull();
		expect(pos?.file).toBe('path.json');
		expect(pos?.line).toBe(2);
		expect(pos?.column).toBe(2);
		expect(pos?.length).toBe(5);
		expect(pos?.lineText).toBe(packageJsonLines[1]);
	});
});

describe('PackageJson.pos', () => {
	// prettier-ignore
	const packageJsonLines = [
		'{',
		'  "foo": {',
		'    "bar": "baz"',
		'  }',
		'}',
	];

	let packageJson!: PackageJson;
	beforeEach(() => {
		packageJson = new PackageJson('path.json', packageJsonLines.join('\n'));
	});

	test('calls .pos', () => {
		const posFn = jest.spyOn(packageJson, 'pos');

		packageJson.tryPos('.abc.def');
		expect(posFn).toBeCalledTimes(3);
		expect(posFn.mock.calls[0]).toStrictEqual(['.abc.def']);
		expect(posFn.mock.calls[1]).toStrictEqual(['.abc']);
		expect(posFn.mock.calls[2]).toStrictEqual(['.']);
	});

	test('returns prop path', () => {
		expect(packageJson.tryPos('.foo')?.prop).toBe(".foo");
	});

	test('returns highest found', () => {
		expect(packageJson.tryPos('.foo.bar.baz')?.prop).toBe(".foo.bar");
		expect(packageJson.tryPos('.fooze')?.prop).toBe(".");
		expect(packageJson.tryPos('.foo')?.prop).toBe(".foo");
	});

	test('returns null on failure', () => {
		expect(packageJson.tryPos('invalid')).toBeNull();
	});
});
