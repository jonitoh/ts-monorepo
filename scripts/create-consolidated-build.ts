import fs from "fs";
import mkdirp from "mkdirp";
import _ncp from "ncp";
import pth from "path";
import _rimraf from "rimraf";
import type { PackageJson } from "type-fest";
import util from "util";

const rimraf = util.promisify(_rimraf);
const ncp = util.promisify(_ncp);

const availableDirnames: string[] = ["build", "dist"];
const outDirname = "build";
const workspaceDirname = "services";
const outDirPath = `./${outDirname}`;
const mainTsConfig = `${workspaceDirname}/tsconfig.json`;

async function copyBuildFilesAsync(src: string, dest: string) {
	try {
		console.log(`Creating directory: ${dest}`);
		await mkdirp(dest);

		console.log(`Copying files: ${src} -> ${dest}`);
		await ncp(src, dest);
	} catch (err) {
		console.log(`Unexpected error`);
		throw err;
	}
}

async function createConsolidatedBuild() {
	try {
		console.log(`Clean outDir at: ${outDirPath}`);
		await rimraf(outDirPath);

		// load main workspace TSConfig
		const { references } = JSON.parse(fs.readFileSync(mainTsConfig).toString()) as PackageJson;
		if (!references) {
			return;
		}

		(references as { path: string }[]).forEach(({ path }) => {
			let isOutDirWorkspaceFound = false;
			const currDir = pth.join(workspaceDirname, path);

			availableDirnames.forEach((name) => {
				if (!isOutDirWorkspaceFound) {
					const dir = pth.join(currDir, name);
					if (!(fs.existsSync(dir) && fs.lstatSync(dir).isDirectory())) {
						return;
					}
					console.log(`outDir found here: ${dir}`);
					copyBuildFilesAsync(dir, pth.join(outDirPath, name)).then(
						() => {},
						() => {},
					);
					isOutDirWorkspaceFound = true;
				}
			});

			if (!isOutDirWorkspaceFound) {
				console.log(`No outDir found here: ${currDir}`);
			}
		});
	} catch (err) {
		console.log("Build failed.");
		if (err) return console.error(err);
	}
}

createConsolidatedBuild().then(
	() => {},
	() => {},
);
