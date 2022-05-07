import * as path from "path";

const ROOT_PATHS = new Set(['.', '/']);

export function getModulesPathsForDirectory(directory: string) {
	let currentDirectory = directory;
	const paths = [] as string[]
	do {
		paths.push(path.join(currentDirectory, 'node_modules'));
		currentDirectory = path.dirname(currentDirectory);
	} while (!ROOT_PATHS.has(currentDirectory))
	paths.push('/node_modules');
	return paths;
}
