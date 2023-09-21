const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');

 module.exports = {
   entry: {
//        polyfills: './src/polyfills',
        index: './index.js',
        },
   output: {
     filename: 'admin.js',
     path: path.join(__dirname, '../')+'/php/src/assets/js/',
   },
   mode: 'production',
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
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      ISPRO: true,
    })
   ]
 };