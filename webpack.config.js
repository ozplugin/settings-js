const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const webpack = require('webpack');

 module.exports = smp.wrap({
   entry: {
        index: './index.js',
        },
   output: {
     filename: 'admin.js',
     path: path.join(__dirname, '../')+'/php/src/assets/js/',
   },
   watch: true,
   optimization: {
    minimize: false
  },
  cache: true,
   devtool: 'eval-cheap-module-source-map',
   module: {
        rules: [

     {
       test: /\.js$/,
       exclude: /node_modules/,
       use: [{
           loader: "babel-loader",
           options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-transform-runtime"],
           }
        }],
     },
      {
       test: /\.s[ac]ss$/i,
       exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
       test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
     ],
   },
   plugins: [
    // new webpack.DefinePlugin({
    //   ISPRO: false,
    // })
   ]
 });