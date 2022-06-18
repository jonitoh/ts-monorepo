import { paths, EnvArgs, Configuration } from './utils';

export default function createConfiguration(env: EnvArgs): Configuration {
  return {
    // no need to instantiate it with NODE_ENV
    mode: 'development',

    // devtools
    devtool: 'eval-source-map',

    // Where webpack looks to set the development server
    devServer: {
      // port: 3000,
      open: true,
      hot: true,
      historyApiFallback: true,
      static: paths.build,
      compress: true,
    },

    // Customize the webpack build process
    // plugins: [],

    // Determine how modules within the project are treated
    // module: { rules: [] },
  };
}
