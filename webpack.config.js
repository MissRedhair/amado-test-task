const path = require('path');

const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];

    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      minify: false,
    });
  });
}

const htmlPlugins = generateHtmlPlugins('./src/pug/pages');
module.exports = (env) => {

  const isDev = env.mode === 'development';

  return {
    mode: env.mode ?? 'development',
    // context: path.resolve(__dirname, 'src'),
    entry: path.resolve(__dirname, 'src', 'app.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true
    },
    stats: 'errors-warnings',
    devtool: 'inline-source-map',
    devServer: {
      static:[
        path.resolve(__dirname, 'src/pug'),
        path.resolve(__dirname, 'src/js'),

      ], 
      port: 5000,
      open: true,
      hot: true,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        browsers: '> 0.5%, IE 11, not dead',
                      },
                    },
                  ],
                ],
              },
            },
          ],
        },
        {
          test: /\.pug$/,
          loader: 'pug-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images',
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: 'images',
            to: 'images',
            noErrorOnMissing: true,
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: 'css/style.min.css',
      }),
      
    ].concat(htmlPlugins),
    resolve: {
      alias: {
        '@images': path.resolve(__dirname, 'src/images/'),
        '@layouts': path.resolve(__dirname, 'src/pug/layouts/'),
        '@partials': path.resolve(__dirname, 'src/pug/partials/'),
      },
    },
  };
};