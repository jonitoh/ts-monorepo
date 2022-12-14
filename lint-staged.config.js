module.exports = {
    "*.{ts,js}": "npm run main --name=verify",
    "*.{json,md,mdx,html,css,scss}": "npm run main --name=format",
};
