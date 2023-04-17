module.exports = {
	presets: [
		['@babel/preset-env', { modules: false, targets: { node: 'current' } }], // Node
		['@babel/preset-typescript', { modules: false }], // TypeScript
	],
};
