import { jsonpos } from 'jsonpos';

/**
 * A subset of the `package.json` schema.
 *
 * @see https://docs.npmjs.com/cli/v9/configuring-npm/package-json
 * @see https://nodejs.org/api/packages.html
 */
export interface PackageJsonData {
	name: string;
	version: string;
	description?: string;

	author?:
		| string
		| `${string} (${string})`
		| `${string} <${string}>`
		| `${string} (${string}) <${string}>`
		| `${string} <${string}> (${string})`
		| {
				name: string;
				email?: string;
				url?: string;
		  };

	funding?: {
		url: string;
	};

	devDependencies?: Record<string, string>;
	dependencies?: Record<string, string>;
}

interface PackageJsonPos {
	line: number;
	column: number;
	length: number;
	lineText: string;
	file: string;
}

/**
 * A wrapper for a `package.json` file.
 * This allows properties to be looked up.
 */
export class PackageJson {
	private readonly textLines: string[];

	public readonly text: string;
	public readonly file: string;
	public readonly data: PackageJsonData;

	public constructor(file: string, text: string) {
		this.file = file;
		this.text = text;
		this.textLines = text.split('\n');
		this.data = JSON.parse(text);
	}

	/**
	 * Gets the position and text of a property within this `package.json` file.
	 *
	 * @param propPath The property path.
	 * @returns The position, or null if not found.
	 */
	public pos(propPath: string): PackageJsonPos | null {
		try {
			const loc = jsonpos(this.text, { dotPath: propPath, markIdentifier: true });
			if (loc.start == null || loc.end == null) return null;
			return {
				file: this.file,
				line: loc.start.line,
				column: loc.start.column - 1,
				length: loc.end.offset - loc.start.offset,
				lineText: this.textLines[loc.start.line - 1],
			};
		} catch (ex) {
			return null;
		}
	}

	/**
	 * Gets the position and text of a property within this `package.json` file.
	 * If the specific property cannot be a found, one of its parents will be returned instead.
	 *
	 * @param propPath The property path.
	 * @returns The position, or null if not found.
	 */
	public tryPos(propPath: string): { prop: string; result: PackageJsonPos } | null {
		const parts = propPath.split('.');

		// Try each component.
		while (parts.length > 1) {
			const prop = parts.join('.');
			const result = this.pos(prop);
			if (result != null) return { prop, result };
			parts.pop();
		}

		// Try the root.
		const prop = parts[0] === '' ? '.' : parts[0];
		const result = this.pos(prop);
		if (result != null) return { prop, result };
		return null;
	}
}

/**
 * Parses a person string in the format of `Name <Email> (URL)` where the email and URL are optional.
 *
 * @param person The person string.
 * @returns The parsed fields.
 */
export function parsePersonString(person: string): {
	name: string;
	email: string | null;
	url: string | null;
} {
	const REGEX_EMAIL_FIELD = /\s<([^>]*@[^>]*)>/;
	const REGEX_URL_FIELD = /\s\(([^)]+)\)/;

	let email: string | null = null;
	let url: string | null = null;

	// Extract the email.
	const match_email = REGEX_EMAIL_FIELD.exec(person);
	if (match_email != null) {
		email = match_email[1];
		person = person.substring(0, match_email.index) + person.substring(match_email.index + match_email[0].length);
	}

	// Extract the URL.
	const match_url = REGEX_URL_FIELD.exec(person);
	if (match_url != null) {
		url = match_url[1];
		person = person.substring(0, match_url.index) + person.substring(match_url.index + match_url[0].length);
	}

	// Return.
	return {
		name: person.trim(),
		email,
		url,
	};
}

/**
 * Gets the author of the package.
 *
 * @param packageJson The package.json contents.
 * @returns The author name, or null if none was specified.
 */
export function getAuthorName(packageJson: PackageJsonData): string | null {
	if (packageJson.author == null) return null;
	if (typeof packageJson.author === 'object') return packageJson.author.name;
	return parsePersonString(packageJson.author).name;
}

/**
 * Gets the package author's URL.
 *
 * @param packageJson The package.json contents.
 * @returns The author URL, or null if none was specified.
 */
export function getAuthorURL(packageJson: PackageJsonData): string | null {
	if (packageJson.author == null) return null;
	if (typeof packageJson.author === 'object') return packageJson.author.url ?? null;
	return parsePersonString(packageJson.author).url;
}

/**
 * Gets the package funding URL.
 *
 * @param packageJson The package.json contents.
 * @returns The funding URL, or null if none was specified.
 */
export function getFundingURL(packageJson: PackageJsonData): string | null {
	return packageJson.funding?.url ?? null;
}

/**
 * Gets the Obsidian version from the package dependencies.
 *
 * @param packageJson The package.json contents.
 * @returns The obsidian version.
 */
export function getObsidianDependencyVersion(packageJson: PackageJsonData): string | null {
	if (packageJson.dependencies != null && packageJson.dependencies.obsidian != null) {
		return packageJson.dependencies.obsidian;
	}

	if (packageJson.devDependencies != null && packageJson.devDependencies.obsidian != null) {
		return packageJson.devDependencies.obsidian;
	}

	return null;
}
