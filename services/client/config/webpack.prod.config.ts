import webpack from "webpack";
import { EnvArgs, Configuration } from "./utils";

export default function createConfiguration(env: EnvArgs): Configuration {
    return {
        devtool: "source-map",

        mode: "production",

        // Customize the webpack build process
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {},
            }),
        ],
    };
}
