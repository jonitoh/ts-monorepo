import Dotenv from "dotenv-webpack";
import { paths, EnvArgs, Configuration } from "./utils";

export default function createConfiguration(env: EnvArgs): Configuration {
    return {
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
        plugins: [
            new Dotenv({
                path: env.configPath ? `${env.configPath}` : undefined,
                systemvars: true,
            }),
        ],

        // Determine how modules within the project are treated
        // module: { rules: [] },
    };
}
