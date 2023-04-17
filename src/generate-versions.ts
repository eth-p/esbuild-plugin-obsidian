import { readFile, stat } from 'node:fs/promises';

import { PartialMessage } from 'esbuild';

import { ObsidianPluginManifest } from './generate-manifest';
import { errInvalidVersionsFile, warnMissingVersionsFile } from './messages';
import Options from './options';

/**
 * The Obsidian plugin versions.json schema.
 * @see https://github.com/obsidianmd/obsidian-sample-plugin/blob/0b5e5a2f6e0425f75a55666f2fb7fb8f704b53be/README.md#releasing-new-releases
 */
export interface ObsidianPluginVersions {
	[PluginVersion: string]: string;
}

/**
 * Generates the Obsidian `manifest.json` file for a plugin.
 *
 * @param packageJson The `package.json`.
 * @param outPath The output path.
 */
export default function generateVersions(
	oldVersions: ObsidianPluginVersions,
	manifest: ObsidianPluginManifest,
	options: Options,
): { versions: ObsidianPluginVersions | null; warnings?: PartialMessage[]; errors?: PartialMessage[] } {
	const WARNING: PartialMessage[] = [];
	const ERROR: PartialMessage[] = [];

	const versions = { ...oldVersions };
	versions[manifest.version] = manifest.minAppVersion;

	// Return generated versions.
	return {
		versions,
		errors: ERROR,
		warnings: WARNING,
	};
}

/**
 * Reads the existing `versions.json` file.
 * @param file The path to the file.
 */
export async function readVersions(file: string): Promise<{
	versions: ObsidianPluginVersions | null;
	warnings?: PartialMessage[];
	errors?: PartialMessage[];
}> {
	try {
		await stat(file);
	} catch (ex) {
		return {
			versions: {},
			warnings: [warnMissingVersionsFile(file)],
		};
	}

	try {
		const contents = JSON.parse(await readFile(file, 'utf-8'));
		return {
			versions: contents,
		};
	} catch (ex) {
		return {
			versions: null,
			errors: [errInvalidVersionsFile(file, ex instanceof Error ? ex : new Error(`${ex}`))],
		};
	}
}
