const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const configFn = require('./webpack.config');

const config = configFn({ env: { production: true }});

config.plugins = [...config.plugins, new BundleAnalyzerPlugin()];

module.exports = {...config};
