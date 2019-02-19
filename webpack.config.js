const chalk = require('chalk');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

const getApiPath = (api) => {
  switch (api) {
    default:
      return 'http://api/v1';
  }
};

module.exports = (env = {}) => {
  const API_URL = getApiPath(env.api);
  const DEV = !env.production;
  const CONTENT_DIR_NAME = 'public';

  console.log(chalk.green('Build to:' + CONTENT_DIR_NAME));
  console.log(chalk.red('Api path:' + API_URL));

  const hash = DEV ? 'hash' : 'contenthash';

  const plugins = [
    new MiniCssExtractPlugin({
      filename: DEV ? '[name].css' : '[name].[hash].css',
      chunkFilename: DEV ? '[id].css' : '[id].[hash].css',
    }),
    new CleanWebpackPlugin([CONTENT_DIR_NAME]),
    new webpack.DefinePlugin({
      API_URL: JSON.stringify(API_URL),
      MODULE_DEVELOPMENT: DEV
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: DEV ? 'development' : 'production',
    }),
    new webpack.HashedModuleIdsPlugin()
  ];

  if (DEV) {
    plugins.push(
      new HtmlWebpackPlugin({
        template: './template/index.html',
        filename: './index.html',
        hash: true,
      })
    );
  }

  return {
    entry: [
      '@babel/polyfill',
      './src/index.jsx',
    ],

    output: {
      path: path.resolve(__dirname, CONTENT_DIR_NAME),
      publicPath: '/',
      // filename: `main.[name].[${hash}].js`,
      filename: `index.js`,
      chunkFilename: `chunk.[name].[${hash}].js`,
    },

    resolve: {
      extensions: ['.js', '.jsx'],
    },

    // externals: {
    //   'react': {
    //     'commonjs': 'react',
    //     'commonjs2': 'react',
    //     'amd': 'react',
    //     'root': 'React'
    //   },
    //   'react-dom': {
    //     'commonjs': 'react-dom',
    //     'commonjs2': 'react-dom',
    //     'amd': 'react-dom',
    //     'root': 'ReactDOM'
    //   }
    // },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        }, {
          test: /\.(jpe?g|png|gif|svg)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: DEV ? '[path][name].[ext]' : '[hash].[ext]',
              outputPath: 'img'
            },
          },
        }, {
          test: /\.less$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                minimize: true,
                importLoaders: 2,
                modules: true,
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
            { loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')
                ],
              }
            },
            { loader: 'less-loader' }
          ]
        }, {
          test: /\.html$/,
          use: {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        },
        {
          test: /\.(otf|ttf|eot|woff|woff2)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts',
          },
        },
        {
          test: /\.(pdf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: `[path][name][${hash}].[ext]`,
                outputPath: 'documents',
              }
            }
          ]
        }
      ],
    },

    plugins,

    devtool: 'source-map',

    devServer: {
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // },
      hot: true,
      historyApiFallback: true,
      publicPath: '/',
      contentBase: path.resolve(__dirname, './'),
      watchContentBase: true,
    },

    optimization: {
      runtimeChunk: true,
      minimizer: [
        new UglifyJsPlugin({
          parallel: true,
          sourceMap: false
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  };
};
