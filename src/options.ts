/**
 * The plugin options.
 */
export default interface Options {
	/**
	 * The path to the `package.json` file that will be used for creating the plugin manifest.
	 */
	packageJsonFile?: string;

	/**
	 * A list of plugin build warnings to ignore.
	 */
	ignoreWarnings?: string[];

	/**
	 * The path to write the `manifest.json` file to.
	 *
	 * This is relative to the working directory, and *does not* respect `outDir`.
	 * Publishing an Obsidian plugin requires that `manifest.json` is in the repository root.
	 */
	outManifestFile?: string;

	/**
	 * The path to write the `versions.json` file to.
	 *
	 * This is relative to the working directory, and *does not* respect `outDir`.
	 * Publishing an Obsidian plugin requires that `versions.json` is in the repository root.
	 */
	outVersionsFile?: string;
}
