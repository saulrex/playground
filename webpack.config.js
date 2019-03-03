const chalk = require('chalk');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

const getLocalIdent = require('./node_modules/css-loader/lib/getLocalIdent');

module.exports = (env = {}) => {
  const DEV = !env.production;
  const CONTENT_DIR_NAME = DEV ? 'dist' : 'lib';
  const hash = DEV ? 'hash' : 'contenthash';
  const FILE_NAME = DEV ? `main.[name].[${hash}].js` : 'index.min.js';
  const ENTRY = DEV ? './src/example/index.jsx' : './src/index.js';
  const DEVTOOL = DEV ? 'source-map' : 'inline-source-map';

  console.log(chalk.green('Build to:' + CONTENT_DIR_NAME));

  const plugins = [
    new MiniCssExtractPlugin({
      filename: DEV ? '[name].css' : 'index.css'
    }),
    new CleanWebpackPlugin([CONTENT_DIR_NAME]),
    new webpack.EnvironmentPlugin({
      NODE_ENV: DEV ? 'development' : 'production',
    }),
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
    entry: ENTRY,

    output: {
      path: path.resolve(__dirname, CONTENT_DIR_NAME),
      publicPath: '/',
      filename: FILE_NAME,
      library: 'showTree',
      libraryTarget: 'umd',
      // umdNamedDefine: true,
    },

    resolve: {
      extensions: ['.js', '.jsx'],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {
              "presets": [
                "@babel/preset-env",
                "@babel/preset-react"
              ],
              "plugins": [
                "react-hot-loader/babel",
                "es6-promise",
                "@babel/plugin-proposal-object-rest-spread",
                "@babel/plugin-syntax-dynamic-import",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-transform-react-jsx-source"
              ]
            }
          }],
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
                localIdentName: 'showTree[local]--[hash:base64:5]',
                getLocalIdent: (context, localIdentName, localName, options) => {
                  return (/styles/).test(context.resourcePath) ?
                    localName : getLocalIdent(context, localIdentName, localName, options)
                },
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

    externals: {
      d3: 'd3',
      react: {
        'commonjs': 'react',
        'commonjs2': 'react',
        'amd': 'react',
        'root': 'React'
      },
      lodash : {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_'
      }
    },

    plugins,

    devtool: DEVTOOL,

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
