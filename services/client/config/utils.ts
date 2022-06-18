import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

type Paths = {
  src: string;
  build: string;
  public: string;
  assets: string;
  nodeModules: string;
};

export const paths: Paths = {
  // Source files
  src: path.resolve(__dirname, '../src'),

  // Production build files
  build: path.resolve(__dirname, '../build'),

  // Static files that get copied to build folder
  public: path.resolve(__dirname, '../public'),

  // Static files that get copied to assets folder
  assets: path.resolve(__dirname, '../assets'),

  // files pointing to the node modules
  nodeModules: path.resolve(__dirname, '../../node_modules'),
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
  const addons = Array.isArray(addonsArgs) ? addonsArgs : [addonsArgs];

  // eslint-disable-next-line import/no-dynamic-require
  // eslint-disable-next-line global-require
  return addons.filter(Boolean).map((name) => require(`./addons/addon.${name}.ts`));
}

export type CreateConfiguration = (env: EnvArgs) => Configuration;

export function checkIfDevMode(env: EnvArgs): boolean {
  return env.WEBPACK_SERVE;
}

export function getChosenCreateConfiguration(env: EnvArgs): Configuration {
  if (!env.WEBPACK_BUILD && !env.WEBPACK_SERVE && !env.WEBPACK_WATCH) {
    throw new Error("We can choose the right mode between 'production', 'development' and 'watch'");
  }
  // eslint-disable-next-line import/no-dynamic-require
  // eslint-disable-next-line global-require
  const createConfiguration = require(`./webpack.${checkIfDevMode(env) ? 'dev' : 'prod'}.config.ts`)
    .default as CreateConfiguration;
  return createConfiguration(env);
}
