import path from "path";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

type Paths = {
    src: string;
    build: string;
    public: string;
    assets: string;
    nodeModules: string;
};

export const paths: Paths = {
    // Source files
    src: path.resolve(__dirname, "../src"),

    // Production build files
    build: path.resolve(__dirname, "../build"),

    // Static files that get copied to build folder
    public: path.resolve(__dirname, "../public"),

    // Static files that get copied to assets folder
    assets: path.resolve(__dirname, "../assets"),

    // files pointing to the node modules
    nodeModules: path.resolve(__dirname, "../../node_modules"),
};

export type EnvArgs = {
    configPath?: string;
    addon?: string;
    WEBPACK_SERVE: boolean;
    WEBPACK_BUILD: boolean;
    WEBPACK_WATCH: boolean;
};

export interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

export function getAddons(addonsArgs: string | undefined | string[]) {
    let addons: string[] = [];
    if (addonsArgs) {
        addons = Array.isArray(addonsArgs) ? addonsArgs : [addonsArgs];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, import/no-dynamic-require, global-require
    return addons.filter(Boolean).map((name) => require(`./addons/addon.${name}.ts`));
}

export type CreateConfiguration = (env: EnvArgs) => Configuration;

export function checkIfDevMode(env: EnvArgs): boolean {
    return process.env.NODE_ENV === "development";
}

export function getChosenCreateConfiguration(env: EnvArgs): Configuration {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
    const createConfiguration = require(`./webpack.${
        checkIfDevMode(env) ? "dev" : "prod"
    }.config.ts`).default as CreateConfiguration;
    return createConfiguration(env);
}
