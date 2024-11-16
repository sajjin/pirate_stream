module.exports = {
    webpack: {
      configure: {
        module: {
          rules: [
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              enforce: 'pre',
              use: ['source-map-loader'],
            },
          ],
        },
        ignoreWarnings: [/Failed to parse source map/],
      },
    },
  };