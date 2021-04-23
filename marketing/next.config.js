/* eslint-disable @typescript-eslint/no-var-requires */
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
});

module.exports = withMDX({
  basePath: '',
  assetPrefix: '',
  pageExtensions: ['js', 'jsx', 'mdx'],
});
