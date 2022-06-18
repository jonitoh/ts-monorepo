// ----- api -----
export function getApiUrl(): string {
  const serverUrl = process.env.SERVER_URL;
  if (serverUrl) return serverUrl;

  const host = process.env.SERVER_HOST;
  const port = process.env.SERVER_PORT;
  const prefix = process.env.SERVER_PREFIXURL;

  return `http://${host}:${port}/${prefix}`;
}
