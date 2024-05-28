const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");

const config = {
  entry: {
    "js-modal": "./scripts/build.js",
    "js-modal.min": "./src/js-modal.css",
  },
  output: {
    path: path.resolve(__dirname, "dist/"),
  },
  plugins: [new RemoveEmptyScriptsPlugin(), new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ]
  }
};

module.exports = config;
