import { EnvArgs, Configuration } from './utils';

export default function createConfiguration(env: EnvArgs): Configuration {
  return {
    // no need to instantiate it with NODE_ENV
    mode: 'production',

    // devtools
    devtool: 'source-map',

    // Customize the webpack build process
    // plugins: [],

    // Determine how modules within the project are treated
    // module: { rules: [] },
  };
}
