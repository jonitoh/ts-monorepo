import { getLength, getLogger, toUpperCase } from "./lib";

const log = getLogger({ filepath: __filename });
function dummyFunction(name: string): void {
	const lines: string[] = [
		`This is the name you chose: ${name}`,
		`Its uppercase version: ${toUpperCase(name)}`,
		`Its length: ${getLength(name)}`,
	];
	return lines.forEach((s: string) => log.info(`${s}\n`));
}

dummyFunction("Maximilian The Third");
