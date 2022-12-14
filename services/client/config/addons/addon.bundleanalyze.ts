import path from "path";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { paths } from "../utils";

export default {
	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: "static",
			reportFilename: path.resolve(paths.build, "report.html"),
			openAnalyzer: false,
		}),
	],
};
