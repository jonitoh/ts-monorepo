import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import { merge } from "webpack-merge";
import Dotenv from "dotenv-webpack";
import {
    paths,
    EnvArgs,
    Configuration,
    CreateConfiguration,
    getAddons,
    checkIfDevMode,
} from "./utils";

function createCommonConfiguration(env: EnvArgs): Configuration {
    const isDevMode = checkIfDevMode(env);
    return {
        // Where webpack looks to start building the bundle
        entry: `${paths.src}/index.tsx`,

        devtool: isDevMode ? "eval-source-map" : "source-map",

        optimization: {
            usedExports: true,
        },

        // Where webpack outputs the assets and bundles
        output: {
            path: paths.build,
            filename: "[name].bundle.js",
            publicPath: "/",
            clean: true,
        },

        // Customize the webpack build process
        plugins: [
            // Removes/cleans build folders and unused assets when rebuilding
            new CleanWebpackPlugin(),

            // Copies files from target to destination folder
            new CopyWebpackPlugin({
                patterns: [
                    // keep the assets folder as-is
                    {
                        from: paths.assets,
                        to: "assets",
                    },
                ],
            }),

            // Generates an HTML file from a template
            // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
            new HtmlWebpackPlugin({
                title: "Monorepo Typescript",
                // favicon: `${paths.assets}/favicon.png`,
                template: `${paths.src}/template.html`, // template file
                filename: `${paths.build}/index.html`, // output file
            }),

            // Load environment variables
            new Dotenv({
                path: env.configPath ? `${env.configPath}` : undefined,
                systemvars: true,
            }),

            // Check ESLint in runtime
            new ESLintPlugin({
                extensions: ["js", "jsx", "ts", "tsx"],
                emitError: true,
                emitWarning: false,
                failOnError: false,
                failOnWarning: false,
            }),

            // Check Typescript in runtime
            new ForkTsCheckerWebpackPlugin({
                async: false,
            }),
        ].concat(
            isDevMode
                ? []
                : [
                      new MiniCssExtractPlugin({
                          filename: "[name].[contenthash].css",
                          chunkFilename: "[id].[contenthash].css",
                      }),
                  ],
        ),

        // Determine how modules within the project are treated
        module: {
            rules: [
                // Typescript: Use TS Loader to transpile TypeScript files
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                // disable type checker - we will use it in fork plugin
                                transpileOnly: true,
                                // configFile: 'tsconfig.json',
                            },
                        },
                    ],
                },

                // JavaScript: Use Babel to transpile JavaScript files
                { test: /\.jsx?$/, use: ["babel-loader"] },

                // Images: Copy image files to build folder
                { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: "asset/resource" },

                // Fonts: Inline files
                { test: /\.(woff(2)?|eot|ttf|otf|)$/, type: "asset/inline" },

                // SVGs: Use SVGR to load them
                {
                    test: /\.svg$/i,
                    type: "asset",
                    resourceQuery: /url/, // *.svg?url
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
                    use: ["@svgr/webpack"],
                },

                // regular scss files
                {
                    test: /\.scss$/i,
                    exclude: /\.module\.scss$/i,
                    use: [
                        { loader: isDevMode ? "style-loader" : MiniCssExtractPlugin.loader },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isDevMode,
                                importLoaders: 1,
                                modules: {
                                    mode: "icss",
                                    auto: true,
                                    localIdentName: isDevMode ? "[name]__[local]" : "[hash:base64]",
                                    localIdentHashSalt: "monorepotypescript",
                                },
                            },
                        },
                        { loader: "postcss-loader" },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: isDevMode,
                                sassOptions: {
                                    outputStyle: "compressed",
                                },
                            },
                        },
                    ],
                },

                // (s)css module files
                {
                    test: /\.module\.scss$/i,
                    use: [
                        { loader: isDevMode ? "style-loader" : MiniCssExtractPlugin.loader },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isDevMode,
                                importLoaders: 1,
                                modules: {
                                    mode: "local",
                                    auto: true,
                                    localIdentName: isDevMode ? "[name]__[local]" : "[hash:base64]",
                                    localIdentHashSalt: "monorepotypescript",
                                },
                            },
                        },
                        { loader: "postcss-loader" },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: isDevMode,
                                sassOptions: {
                                    outputStyle: "compressed",
                                },
                            },
                        },
                    ],
                },
            ],
        },

        resolve: {
            modules: [paths.src, paths.nodeModules, "node_modules"],
            // https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/61
            plugins: [new TsconfigPathsPlugin() as any],
            extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
        },
    };
}

// export default createConfiguration;

export default function createMergedConfiguration(
    createConfiguration: CreateConfiguration,
): CreateConfiguration {
    return function createUnifiedConfiguration(env: EnvArgs): Configuration {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return merge(
            createCommonConfiguration(env),
            createConfiguration(env),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            ...getAddons(env.addon),
        );
    };
}
