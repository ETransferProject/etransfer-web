const rewritesConfig = require('./rewrites/index');
const path = require('path');

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return rewritesConfig;
  },
  images: {
    // loader: 'akamai',
    // path: '',
    domains: [
      'raw.githubusercontent.com',
      'd.cobo.com',
      'forest-mainnet.s3.ap-northeast-1.amazonaws.com',
      'cms.etransfer.exchange',
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },

  productionBrowserSourceMaps: true,
  webpack: (config, { webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.ignoreWarnings = [{ module: /node_modules/ }];
    return config;
  },
};
