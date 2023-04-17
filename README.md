# esbuild-plugin-obsidian

An [esbuild](https://esbuild.github.io/) plugin for creating [Obsidian](https://obsidian.md) plugins.

## Usage

Inside your esbuild build script:

```js
import * as esbuild from 'esbuild';
import esbuildObsidian from 'esbuild-plugin-obsidian';

await esbuild.build({
	// ...
	plugins: [esbuildObsidian(/* options */)],
});
```

Inside your `package.json` file:

```json
{
	"name": "my-plugin",
	"version": "1.2.3",
	"author": "me",
	"obsidian": {
		"name": "My Plugin Name",
		"minAppVersion": "1.0.0",
		"isDesktopOnly": false
	}
}
```

### Options

```typescript
interface Options {
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
```

## Features

-   Automatically generates and updates `versions.json`.
-   Generates a `manifest.json` based on the `package.json` file.
    -   Package name as plugin ID.
    -   Package version as the plugin version.
    -   Package description as plugin description.
    -   Package [author](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#people-fields-author-contributors) for the plugin author name and URL.
    -   Package [funding field](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#funding) for the plugin funding URL.
    -   All manifest fields can be overridden in the `obsidian` field.
