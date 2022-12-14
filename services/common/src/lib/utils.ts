export function toUpperCase(name: string): string {
	return `--${name}--`.toUpperCase();
}

export function getLength(name: string): number {
	return toUpperCase(name).length;
}
