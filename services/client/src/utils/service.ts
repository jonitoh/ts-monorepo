// ----- api -----
export function getApiUrl(): string {
    const serverUrl = process.env.SERVER_URL;
    if (serverUrl) return serverUrl;

    const host = process.env.SERVER_HOST;
    const port = process.env.SERVER_PORT;
    const prefix = process.env.SERVER_PREFIXURL;
    if (host && port && prefix) return `http://${host}:${port}/${prefix}`;
    throw new Error("The url is not defined");
}
