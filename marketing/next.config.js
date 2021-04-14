const debug = process.env.NODE_ENV === 'development';
const GH_PAGES_DIRECTORY = 'landgriffon'; // change this in case you don't use GH Pages

module.exports = {
  basePath: debug ? '' : `/${GH_PAGES_DIRECTORY}`,
  assetPrefix: debug ? '' : `/${GH_PAGES_DIRECTORY}/`,
  // Little hack to replace next/image loader
  // resize and optimization props won't be supported
  images: {
    loader: 'imgix',
    path: debug ? '' : 'https://vizzuality.github.io/landgriffon/',
  },
};
