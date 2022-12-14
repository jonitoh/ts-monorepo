import fs from "fs";

export function checkIfDevMode(): boolean {
	return process.env.NODE_ENV === "development";
}

export type TCounter = {
	files: number;
	dirs: number;
};

export function countFilesAndDirectoriesFromPath(entry: string): TCounter {
	const isPathADir: boolean[] = fs
		.readdirSync(entry)
		.map((pth) => fs.lstatSync(`${entry}/${pth}`).isDirectory());

	return {
		files: isPathADir.filter((s) => !s).length,
		dirs: isPathADir.filter((s) => s).length,
	};
}

export function getFilesFromDirectory(
	entry: string,
	extensions: string[] = [],
	excludeExtensions: string[] = [],
) {
	let fileNames: string[] = [];
	const dirs: string[] = fs.readdirSync(entry);

	dirs.forEach((dir) => {
		const path = `${entry}/${dir}`;

		if (fs.lstatSync(path).isDirectory()) {
			fileNames = [
				...fileNames,
				...getFilesFromDirectory(path, extensions, excludeExtensions),
			];

			return;
		}

		if (
			!excludeExtensions.some((exclude) => dir.endsWith(exclude)) &&
			extensions.some((ext) => dir.endsWith(ext))
		) {
			fileNames.push(path);
		}
	});

	return fileNames;
}
