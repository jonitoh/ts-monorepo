import express, { Response, Request, Application } from "express"; // Import express framework
import { Server } from "http";
import path from "path";
import cors from "cors";
import { toUpperCase as sharedFunction } from "@jonitoh-ts-monorepo/common";

if (process.env.NODE_ENV === "development" || process.env.NODE_DOTENV_FORCE === "true") {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-var-requires
	require("dotenv").config({
		path: process.env.NODE_DOTENV_PATH || ".env",
		debug: process.env.NODE_DOTENV_DEBUG === "true",
		override: true,
	});
}

type SharedParams = {
	text: string;
};
// thx https://github.com/kentcdodds/express-app-example
function setupCloseOnExit(server: Server): void {
	// thank you stack overflow
	// https://stackoverflow.com/a/14032965/971592
	function exitHandler(options: { exit?: boolean } = {}): void {
		try {
			server.close();
			console.info("Server successfully closed");
		} catch (e: unknown) {
			console.warn(
				`Something went wrong closing the server${
					e instanceof Error && e.stack ? `: ${e.stack}` : ""
				}`,
			);
		}
		// eslint-disable-next-line no-process-exit
		if (options.exit) process.exit();
	}

	// do something when app is closing
	process.on("exit", exitHandler);

	// catches ctrl+c event
	process.on("SIGINT", exitHandler.bind(null, { exit: true }));

	// catches "kill pid" (for example: nodemon restart)
	process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
	process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

	// catches uncaught exceptions
	process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}

export async function startServer(
	port: number = parseFloat(process.env.PORT || "5000"),
	host: string | undefined = process.env.HOST,
): Promise<Server> {
	// Initiate express app
	const app: Application = express();

	// CORS
	app.use(cors()); // corsOptions));
	// CORS -- enable pre-flight across-the-board
	// app.options('*', cors(corsOptions));
	// parse requests of content-type - application/json
	app.use(express.json());
	// parse requests of content-type - application/x-www-form-urlencoded
	app.use(express.urlencoded({ extended: true }));

	// HELLO WORLD ROUTE
	app.get("/hello-world", (req: Request, res: Response) => {
		res.send({ message: "YOUR EXPRESS BACKEND IS ALIVE" });
	});

	// HELLO WORLD ROUTE
	app.get("/shared/:text", (req: Request<SharedParams>, res: Response) => {
		const { text } = req.params;
		const result = sharedFunction(text);
		res.send({ result });
	});

	// for development and avoid CORS stuff, Express will serve the built frontend
	if (process.env.NODE_ENV === "production") {
		const monorepoMode = process.env.MONOREPO === "true";
		console.info(`monorepo Mode activated? ${monorepoMode ? "YES" : "NO"}`);
		app.use(express.static(path.join(__dirname, "../../client/build")));
		// app.use(express.static(path.join(__dirname, '../../client/build/assets')));
		app.get("*", (req: Request, res: Response) => {
			res.sendFile(path.join(__dirname, "../../client/build/index.html"));
		});
	}

	let server: Server;
	const makeCallback = (resolve: (value: Server | PromiseLike<Server>) => void) => () => {
		const usedServer = server?.address();
		if (process.env.NODE_ENV === "development") {
			if (usedServer && typeof usedServer !== "string") {
				console.info(`Listening on port ${usedServer.port || "unknown"}`);
				console.info(`Listening on host ${usedServer.address || "unknown"}`);
				if (usedServer.port && usedServer.address) {
					console.info(`Listening on http://${usedServer.address}:${usedServer.port}`);
					console.info(
						`Hello world route on http://${usedServer.address}:${usedServer.port}/hello-world`,
					);
				}
			}
		}
		const originalClose = server.close.bind(server);

		function closeServer(callback?: ((err?: Error | undefined) => void) | undefined) {
			return originalClose(callback);
		}
		server.close = closeServer;
		setupCloseOnExit(server);
		resolve(server);
	};

	return host
		? new Promise((resolve) => {
				server = app.listen(port, host, makeCallback(resolve));
		  })
		: new Promise((resolve) => {
				server = app.listen(port, makeCallback(resolve));
		  });
}

export default { startServer };
