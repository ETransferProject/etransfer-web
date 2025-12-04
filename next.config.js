/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const { NEXT_PUBLIC_BUNDLE_ANALYZER, NEXT_PUBLIC_NODE_ENV } = process.env;
const pluginConfig = require('./build.config/plugin');
const development = require('./build.config/development');
const production = require('./build.config/production');

const config = NEXT_PUBLIC_BUNDLE_ANALYZER === 'true' || NEXT_PUBLIC_NODE_ENV === 'production' ? production : development;

module.exports = withPlugins(pluginConfig, config);
