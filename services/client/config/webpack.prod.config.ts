import webpack from "webpack";
import { EnvArgs, Configuration } from "./utils";

export default function createConfiguration(env: EnvArgs): Configuration {
    return {
        // Customize the webpack build process
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {},
            }),
        ],

        // Determine how modules within the project are treated
        // module: { rules: [] },
    };
}
