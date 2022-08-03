#!/usr/bin/env node
// cf. https://blog.ah.technology/a-guide-through-the-wild-wild-west-of-setting-up-a-mono-repo-with-typescript-lerna-and-yarn-ed6a1e5467a
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const isCI = require("is-ci");

const mainTsConfig = "services/tsconfig.json";
const mainDirConfig = path.dirname(mainTsConfig);
const config = JSON.parse(fs.readFileSync(mainTsConfig).toString());
config.files = [];
config.references = [];

(async function () {
    if (isCI) {
        // dont run it on CI
        return;
    }

    const { stdout, stderr } = await exec("yarn workspaces info --json");

    const lines = stdout.split("\n");
    const depthTree = lines.slice(1, lines.length - 2).join("\n");
    const workspaces = JSON.parse(depthTree);

    for (const name in workspaces) {
        const workspace = workspaces[name];
        const location = path.resolve(process.cwd(), workspace.location);

        console.info("----- location:", location, "-----");
        const majorTsconfigPath = path.resolve(location, "tsconfig.json");

        if (fs.existsSync(majorTsconfigPath)) {
            console.info("major tsconfig file: ", majorTsconfigPath);
            config.references.push({
                path: path.relative(mainDirConfig, location), // workspace.location,
            });
            const workspaceConfig = JSON.parse(fs.readFileSync(majorTsconfigPath).toString());
            workspaceConfig.compilerOptions.composite = true;
            workspaceConfig.references = [];
            for (const dependency of workspace.workspaceDependencies) {
                const dependecyLocation = path.resolve(
                    process.cwd(),
                    workspaces[dependency].location,
                );
                if (fs.existsSync(path.resolve(dependecyLocation, "tsconfig.json"))) {
                    workspaceConfig.references.push({
                        path: path.relative(location, dependecyLocation),
                    });
                }
            }

            const files = fs
                .readdirSync(location)
                .filter((f) => f.startsWith("tsconfig.") && f.endsWith(".json"));
            console.info("any other tsconfig files ?");

            for (const file of files) {
                const tsconfigPath = path.resolve(location, file);
                if (!fs.lstatSync(tsconfigPath).isDirectory() && file !== "tsconfig.json") {
                    if (fs.existsSync(tsconfigPath)) {
                        console.info("-->", tsconfigPath);
                        fs.writeFileSync(
                            tsconfigPath,
                            JSON.stringify(workspaceConfig, undefined, 4),
                        );
                    }
                }
            }
        }
    }
    fs.writeFileSync(mainTsConfig, JSON.stringify(config, undefined, 4));
})();
