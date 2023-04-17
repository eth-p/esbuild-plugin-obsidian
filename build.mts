import { readFile } from 'node:fs/promises';

import builtins from 'builtin-modules';
import * as esbuild from 'esbuild';
import esbuildPluginDtsBundleGenerator from 'esbuild-plugin-dts-bundle-generator';

const packageJson = JSON.parse(await readFile('package.json', 'utf-8'));

const config: esbuild.BuildOptions = {
	entryPoints: { index: 'src/index.ts' },
	bundle: true,
	outdir: 'dist',
	platform: 'node',
	target: 'es2017',

	external: [...builtins, ...Object.keys(packageJson.dependencies), './node_modules/*'],
};

await esbuild.build({
	...config,
	format: 'esm',
	outExtension: { '.js': '.mjs' },
	plugins: [esbuildPluginDtsBundleGenerator({ printPerformanceMessage: true })],
});
