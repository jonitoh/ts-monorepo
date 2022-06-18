module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          '^@jonitoh-ts-monorepo/(.+)': '../\\1/src',
        },
      },
    ],
  ],
};
