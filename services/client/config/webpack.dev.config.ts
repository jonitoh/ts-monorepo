import Dotenv from "dotenv-webpack";
import { paths, EnvArgs, Configuration } from "./utils";

export default function createConfiguration(env: EnvArgs): Configuration {
    return {
        devtool: "eval-source-map",

        mode: "development",

        // Where webpack looks to set the development server
        devServer: {
            open: true,
            hot: true,
            historyApiFallback: true,
            static: paths.build,
            compress: true,
            client: {
                progress: true,
            },
        },

        // Customize the webpack build process
        plugins: [
            new Dotenv({
                path: env.configPath ? `${env.configPath}` : undefined,
                systemvars: true,
            }),
        ],
    };
}
