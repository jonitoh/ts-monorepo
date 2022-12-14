import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

function createLogger(): winston.Logger {
	// VARIABLE SECTION
	const isDev = process.env.NODE_ENV !== "production";
	const nodeEnvStr: string = process.env.NODE_ENV || "default";

	// FORMAT SECTION
	const privateFormat = winston.format((info) => (info.private ? false : info));
	const uppercaseLevelFormat = winston.format((info) => {
		const { level, ...rest } = info;
		return {
			level: level ? level.toUpperCase() : level,
			...rest,
		};
	});
	function cleanInfoFormat(excludedKeys: string[] = ["private"]) {
		return winston.format((info) => {
			const filteredInfo = Object.fromEntries(
				Object.entries(info).filter(([key]) => !excludedKeys.includes(key)),
			);
			return filteredInfo as winston.Logform.TransformableInfo;
		});
	}
	const lineDefaultFormat = winston.format.printf(
		({ level, message, label, timestamp, stack, metadata }) => {
			const parts: string[] = [];
			parts.push(`${timestamp as string}`);
			parts.push(`[${label as string}]`);
			parts.push(`${level} ::`);
			if (message) {
				parts.push(`${message as string}`);
			}
			if (metadata) {
				parts.push(`${JSON.stringify(metadata)}`);
			}
			if (stack) {
				return `-- ${stack as string}`;
			}
			return parts.join(" ");
		},
	);
	/*
	const lineHTTPFormat = undefined;
	*/
	const baseFormat = winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: isDev }),
		uppercaseLevelFormat(),
		privateFormat(),
		cleanInfoFormat(["private"])(),
	);
	const storedFormat = winston.format.combine(baseFormat, winston.format.json());

	const readDefaultFormat = winston.format.combine(
		baseFormat,
		// winston.format.colorize({ level: isDev }),
		lineDefaultFormat,
	);

	/*
	const readHTTPFormat = winston.format.combine(
		baseFormat,
		winston.format.colorize({ level: isDev }),
		lineHTTPFormat,
	);
	*/

	// TRANSPORT SECTION
	const consoleTransport = new winston.transports.Console({
		format: readDefaultFormat,
		handleExceptions: true,
		handleRejections: true,
	});

	const dirname: string = process.env.LOG_DIRPATH || "logs";
	fs.mkdirSync(dirname, { recursive: true });

	const fileTransport = process.env.LOG_ROTATE_FILE
		? new DailyRotateFile({
				dirname,
				filename: `${nodeEnvStr}__%DATE%.log`,
				datePattern: "YYYY-MM-DD-HH",
				zippedArchive: true,
				maxSize: "20m",
				maxFiles: "14d",
				format: storedFormat,
		  })
		: new winston.transports.File({
				dirname,
				filename: `${nodeEnvStr}.log`,
				format: storedFormat,
				handleExceptions: true,
				handleRejections: true,
				zippedArchive: true,
				maxsize: 5 * 1 * 1024 * 1024, // 5MB
				maxFiles: 5,
		  });
	/*
	const httpTransport = new winston.transports.Http({
		format: readHTTPFormat,
		handleExceptions: true,
		handleRejections: true,
	});
	*/

	// COLOR SECTION
	const myCustomLevels = {
		levels: {
			error: 0,
			warn: 1,
			info: 2,
			http: 3,
			verbose: 4,
			debug: 5,
			silly: 6,
		},
		colors: {
			error: "red",
			warn: "orange",
			info: "blue",
			http: "yellow",
			verbose: "grey",
			debug: "green",
			silly: "pink",
		},
	};
	winston.addColors(myCustomLevels.colors);

	const logger: winston.Logger = winston.createLogger({
		levels: myCustomLevels.levels,
		level: process.env.FORCE_LOG_LEVEL || (isDev ? "debug" : "info"),
		// service,
		transports: [consoleTransport, fileTransport],
		exitOnError: !isDev,
	});

	return logger;
}

const defaultLogger: winston.Logger = createLogger();

function formatPath(filepath?: string) {
	if (!filepath) {
		return undefined;
	}

	const parts: string[] = path.resolve(filepath).split(path.sep);
	if (parts.length === 1) {
		return parts.join(path.sep);
	}
	if (parts[parts.length - 1].startsWith("index")) {
		return parts.slice(-2).join(path.sep);
	}
	return parts[parts.length - 1];
}

export type GetLoggerOptions = {
	label?: string;
	filepath?: string;
};

export default function getLogger({ label, filepath }: GetLoggerOptions): winston.Logger {
	return defaultLogger.child({
		label: label || formatPath(filepath) || "default logger",
		filepath,
	});
}
