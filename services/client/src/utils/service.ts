// ----- api -----
export function getApiUrl(): string {
    const serverUrl = process.env.SERVER_URL;
    if (serverUrl) return serverUrl;

    const host = process.env.HOST;
    const port = process.env.PORT;
    const prefix = process.env.PREFIXURL;
    if (host && port) return prefix ? `http://${host}:${port}/${prefix}` : `http://${host}:${port}`;
    console.warn("No API url found");
    return "";
}
