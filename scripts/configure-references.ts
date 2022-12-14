#!/usr/bin/env node
// cf. https://blog.ah.technology/a-guide-through-the-wild-wild-west-of-setting-up-a-mono-repo-with-typescript-lerna-and-yarn-ed6a1e5467a
import { exec as _exec } from "child_process";
import fs from "fs";
import isCI from "is-ci";
import pth from "path";
import type { JsonObject, PackageJson } from "type-fest";
import util from "util";

type DepthTreeElement = {
	location: string;
	workspaceDependencies: string[];
	mismatchedWorkspaceDependencies: string[];
};

type DepthTree = {
	[key: string]: DepthTreeElement;
};

async function configureReferences() {
	if (isCI) {
		// dont run it on CI
		return;
	}
	const exec = util.promisify(_exec);
	const mainTsConfig = "services/tsconfig.json";
	const mainDirConfig = pth.dirname(mainTsConfig);
	const config = JSON.parse(fs.readFileSync(mainTsConfig).toString()) as PackageJson;

	const { stdout } = await exec("yarn workspaces info --json");

	const lines = stdout.split("\n");
	const depthTree = lines.slice(1, lines.length - 2).join("\n");
	const workspaces = JSON.parse(depthTree) as DepthTree;
	const references: { path: string }[] = [];

	Object.entries(workspaces).forEach(([name, workspace]) => {
		if (Object.prototype.hasOwnProperty.call(workspaces, name)) {
			const location = pth.resolve(process.cwd(), workspace.location);

			console.info("----- location:", location, "-----");
			const majorTsconfigPath = pth.resolve(location, "tsconfig.json");

			if (fs.existsSync(majorTsconfigPath)) {
				console.info("major tsconfig file: ", majorTsconfigPath);
				references.push({
					path: pth.relative(mainDirConfig, location), // workspace.location,
				});
				const workspaceConfig = JSON.parse(
					fs.readFileSync(majorTsconfigPath).toString(),
				) as PackageJson;
				const workspaceReferences: { path: string }[] = [];

				workspace.workspaceDependencies.forEach((dep) => {
					const depLocation = pth.resolve(process.cwd(), workspaces[dep].location);
					if (fs.existsSync(pth.resolve(depLocation, "tsconfig.json"))) {
						workspaceReferences.push({
							path: pth.relative(location, depLocation),
						});
					}
				});
				workspaceConfig.compilerOptions = {
					...(!!workspaceConfig.compilerOptions === null ||
					workspaceConfig.compilerOptions === undefined
						? {}
						: (workspaceConfig.compilerOptions as JsonObject)),
					composite: true,
				};
				workspaceConfig.references = workspaceReferences;

				const files = fs
					.readdirSync(location)
					.filter((f) => f.startsWith("tsconfig.") && f.endsWith(".json"));
				console.info("any other tsconfig files ?");

				files.forEach((file) => {
					const tsconfigPath = pth.resolve(location, file);
					if (!fs.lstatSync(tsconfigPath).isDirectory() && file !== "tsconfig.json") {
						if (fs.existsSync(tsconfigPath)) {
							console.info("-->", tsconfigPath);
							fs.writeFileSync(
								tsconfigPath,
								JSON.stringify(workspaceConfig, undefined, 4),
							);
						}
					}
				});
			}
		}
	});

	config.files = [];
	config.references = references;

	fs.writeFileSync(mainTsConfig, JSON.stringify(config, undefined, 4));
}

configureReferences().then(
	() => {},
	() => {},
);
