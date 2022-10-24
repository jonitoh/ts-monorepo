// ----- api -----
export function getApiUrl(): string {
    const url = process.env.URL;
    const prefix = process.env.PREFIXURL;
    if (url) return prefix ? `${url}/${prefix}` : url;

    const host = process.env.HOST;
    const port = process.env.PORT;
    if (host && port) return prefix ? `http://${host}:${port}/${prefix}` : `http://${host}:${port}`;

    console.warn("No API url found");
    return "";
}
