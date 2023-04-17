import { PartialMessage } from 'esbuild';

import { errNoAuthor, errNoDescription, warnNoIsDesktopOnly, warnNoMinAppVersion, warnNoName, warnOverriddenVersion } from './messages';
import Options from './options';
import {
	PackageJson,
	PackageJsonData,
	getAuthorName,
	getAuthorURL,
	getFundingURL,
	getObsidianDependencyVersion,
} from './package-json';

/**
 * The Obsidian plugin manifest schema.
 * @see https://marcus.se.net/obsidian-plugin-docs/reference/manifest
 */
export interface ObsidianPluginManifest {
	id: string;
	name: string;
	version: string;
	author: string;
	description: string;
	isDesktopOnly: boolean;
	minAppVersion: string;

	authorUrl?: string;
	fundingUrl?: string;
}

/**
 * An extension to the package.json with a property for obsidian.
 */
export interface PackageJsonDataWithObsidian extends PackageJsonData {
	obsidian?: Partial<ObsidianPluginManifest> &
		Pick<ObsidianPluginManifest, 'name' | 'isDesktopOnly' | 'minAppVersion'>;
}

/**
 * Generates the Obsidian `manifest.json` file for a plugin.
 *
 * @param packageJson The `package.json`.
 * @param outPath The output path.
 */
export default function generateManifest(
	packageJson: PackageJson,
	options: Options,
): { manifest: ObsidianPluginManifest | null; warnings?: PartialMessage[]; errors?: PartialMessage[] } {
	const WARNING: PartialMessage[] = [];
	const ERROR: PartialMessage[] = [];
	const packageData = packageJson.data as PackageJsonDataWithObsidian;

	const authorUrl = getAuthorURL(packageData);
	const fundingUrl = getFundingURL(packageData);
	const author = getAuthorName(packageData);
	const description = packageData.description ?? null;
	const minAppVersion = getObsidianDependencyVersion(packageData);

	const manifest: Partial<ObsidianPluginManifest> = {
		id: packageData.name,
		version: packageData.version,
		...(packageData.obsidian ?? {}),
	};

	// Add the name. (unsafe)
	if (manifest.name == null) {
		WARNING.push(warnNoName(packageJson, packageData.name));
		manifest.name = packageData.name;
	}

	// Add the description.
	if (manifest.description == null) {
		if (description != null) {
			manifest.description = description;
		} else {
			ERROR.push(errNoDescription(packageJson));
		}
	}

	// Add the author.
	if (manifest.author == null) {
		if (author != null) {
			manifest.author = author;
		} else {
			ERROR.push(errNoAuthor(packageJson));
		}
	}

	// Add the `minAppVersion`. (unsafe)
	if (manifest.minAppVersion == null) {
		const warning = warnNoMinAppVersion(packageJson, minAppVersion);
		(minAppVersion == null ? ERROR : WARNING).push(warning);
		if (minAppVersion != null) {
			manifest.minAppVersion = minAppVersion;
		}
	}

	// Add the `isDesktopOnly`. (unsafe)
	if (manifest.isDesktopOnly == null) {
		WARNING.push(warnNoIsDesktopOnly(packageJson, false));
		manifest.isDesktopOnly = false;
	}

	// Add the author URL and funding URL.
	if (manifest.authorUrl == null && authorUrl != null) manifest.authorUrl = authorUrl;
	if (manifest.fundingUrl == null && fundingUrl != null) manifest.fundingUrl = fundingUrl;

	// Add warning if the version is overridden.
	if (packageData.obsidian?.version != null) {
		WARNING.push(warnOverriddenVersion(packageJson));
		manifest.isDesktopOnly = false;
	}

	// Return generated manifest.
	return {
		manifest: manifest as ObsidianPluginManifest,
		errors: ERROR,
		warnings: WARNING,
	};
}
