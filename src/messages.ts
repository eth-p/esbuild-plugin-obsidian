import { PartialMessage } from 'esbuild';

import { PackageJson } from './package-json';

export const enum WarningID {
	NoMinAppVersion = 'no-min-app-version',
	NoName = 'no-name',
	NoIsDesktopOnly = 'no-is-desktop-only',
	MissingVersionsFile = 'missing-versions-file',
	OverriddenVersion = 'overridden-version',
}

export const enum ErrorID {
	NoDescription = 'no-description',
	NoAuthor = 'no-author',
	InvalidVersionsFile = 'invalid-versions-file',
}

export function warnNoMinAppVersion(packageJson: PackageJson, detected: string | null): PartialMessage {
	const pos = packageJson.tryPos('.obsidian');
	return {
		id: WarningID.NoMinAppVersion,
		text: 'No minimum Obsidian version is specified.',
		detail: `A default value of "${detected}" (the dependency version) is being used.`,
		location: {
			...pos?.result,
			suggestion:
				pos?.prop === '.obsidian'
					? 'Add `minAppVersion` under the `obsidian` object.'
					: 'Add an `obsidian` object, then add `minAppVersion` under it.',
		},
	};
}

export function warnNoName(packageJson: PackageJson, defaultValue: string | null): PartialMessage {
	const pos = packageJson.tryPos('.obsidian');
	return {
		id: WarningID.NoName,
		text: `No plugin name is provided.`,
		detail: `A default value of "${defaultValue}" (the package name) is being used.`,
		location: {
			...pos?.result,
			suggestion:
				pos?.prop === '.obsidian'
					? 'Add `name` under the `obsidian` object.'
					: 'Add an `obsidian` object, then add `name` under it.',
		},
	};
}

export function warnNoIsDesktopOnly(packageJson: PackageJson, defaultValue: boolean): PartialMessage {
	const pos = packageJson.tryPos('.obsidian');
	return {
		id: WarningID.NoIsDesktopOnly,
		text: `No \`isDesktopOnly\` value was specified.`,
		detail: `A default value of ${defaultValue} is being used.`,
		location: {
			...pos?.result,
			suggestion:
				pos?.prop === '.obsidian'
					? 'Add `isDesktopOnly` under the `obsidian` object.'
					: 'Add an `obsidian` object, then add `isDesktopOnly` under it.',
		},
	};
}

export function errNoDescription(packageJson: PackageJson): PartialMessage {
	const pos = packageJson.tryPos('.');
	return {
		id: ErrorID.NoDescription,
		text: 'No plugin description was provided.',
		location: {
			...pos?.result,
			suggestion: 'Add a `description` to the package.json file.',
		},
	};
}

export function errNoAuthor(packageJson: PackageJson): PartialMessage {
	const pos = packageJson.tryPos('.');
	return {
		id: ErrorID.NoAuthor,
		text: 'No plugin author was provided.',
		location: {
			...pos?.result,
			suggestion: 'Add an `author` to the package.json file.',
		},
	};
}

export function warnOverriddenVersion(packageJson: PackageJson): PartialMessage {
	const pos = packageJson.tryPos('.obsidian.version');
	return {
		id: WarningID.OverriddenVersion,
		text: 'The plugin version does not follow the package verison.',
		detail: 'The value is being overridden under the `obsidian` object in your package.json.',
		location: {
			...pos?.result,
			suggestion: `If this is intentional, add \`ignoreWarning: ["${WarningID.OverriddenVersion}"]\` to the plugin options.`,
		},
	};
}

export function warnMissingVersionsFile(file: string): PartialMessage {
	return {
		id: WarningID.MissingVersionsFile,
		text: 'There is no `versions.json` file. One will be created.',
		detail: `Could not stat file at "${file}".`,
	};
}

export function errInvalidVersionsFile(file: string, err: Error): PartialMessage {
	return {
		id: ErrorID.InvalidVersionsFile,
		text: 'The `versions.json` file is invalid.',
		detail: err.message,
	};
}
