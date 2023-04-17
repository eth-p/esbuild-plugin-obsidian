import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { env } from 'node:process';

import type { PartialMessage, Plugin, PluginBuild } from 'esbuild';

import generateManifest, { ObsidianPluginManifest } from './generate-manifest';
import generateVersions, { ObsidianPluginVersions, readVersions } from './generate-versions';
import Options from './options';
import { PackageJson } from './package-json';
import { ensureDir, findPackageJsonFile } from './util';

/**
 * Creates an esbuild plugin that generates Obsidian manifests.
 * @param options
 * @returns
 */
export default function obsidianPlugin(options?: Options): Plugin {
	const effectiveOptions = options ?? {};
	const ignoredWarnings = new Set(options?.ignoreWarnings ?? []);
	return {
		name: 'obsidian',
		async setup(build: PluginBuild) {
			const outVersionsFile = effectiveOptions.outVersionsFile ?? 'versions.json';
			const outManifestFile = effectiveOptions.outManifestFile ?? 'manifest.json';

			// Find the package.json file.
			const packageJsonFile =
				effectiveOptions.packageJsonFile ?? env['npm_package_json'] ?? (await findPackageJsonFile());

			if (packageJsonFile == null) {
				throw new Error('Unable to find package.json file.');
			}

			build.onStart(async () => {
				const packageJsonText = await readFile(packageJsonFile, 'utf8');
				const packageJson = new PackageJson(packageJsonFile, packageJsonText);

				const JOBS: Promise<unknown>[] = [];
				const WARNING: PartialMessage[] = [];
				const ERROR: PartialMessage[] = [];

				// Read the versions.json file.
				let oldVersions: ObsidianPluginVersions | null;
				{
					const { versions, warnings, errors } = await readVersions(outVersionsFile);
					if (warnings != null) WARNING.push(...warnings);
					if (errors != null) ERROR.push(...errors);
					oldVersions = versions;
				}

				// Create the manifest.
				let manifest: ObsidianPluginManifest | null;
				{
					const { manifest: result, warnings, errors } = generateManifest(packageJson, effectiveOptions);
					if (warnings != null) WARNING.push(...warnings);
					if (errors != null) ERROR.push(...errors);
					manifest = result;
					JOBS.push(writeManifest(outManifestFile, manifest));
				}

				// Create the versions.
				if (manifest != null && oldVersions != null) {
					const {
						versions: result,
						warnings,
						errors,
					} = generateVersions(oldVersions, manifest, effectiveOptions);
					if (warnings != null) WARNING.push(...warnings);
					if (errors != null) ERROR.push(...errors);
					JOBS.push(writeVersions(outVersionsFile, result));
				}

				// Wait and return errors.
				await Promise.all([JOBS]);
				return {
					warnings: WARNING.filter((w) => !ignoredWarnings.has(w.id ?? '')),
					errors: ERROR,
				};
			});
		},
	};
}

async function writeManifest(outManifestFile: string, manifest: ObsidianPluginManifest | null): Promise<void> {
	if (manifest != null) {
		await ensureDir(dirname(outManifestFile));
		await writeFile(outManifestFile, JSON.stringify(manifest, undefined, 2), 'utf-8');
	}
}

async function writeVersions(outVersionsFile: string, versions: ObsidianPluginVersions | null): Promise<void> {
	if (versions != null) {
		await ensureDir(dirname(outVersionsFile));
		await writeFile(outVersionsFile, JSON.stringify(versions, undefined, 2), 'utf-8');
	}
}
