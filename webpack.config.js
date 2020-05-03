// entry -> output
const webpack = require('webpack');
const path = require('path');
let dotenv = require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
    entry: ['babel-polyfill', './client/src/index.js'],
    output: {
        path: path.resolve(__dirname, 'client/public'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    },
    module: {
        rules: [{
            loader: "babel-loader",
            test: /\.(js|jsx)$/,
            exclude: /node_modules/
        }, {
            test: /\.s?css$/,
            use:[
                'style-loader',
                'css-loader'
            ]
        }, {
            test: /\.(pdf|gif|png|jpe?g|svg|ico)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    }
                }
            ]
        },{
            test: /\.less$/,
            use: [{
              loader: 'style-loader',
            }, {
              loader: 'css-loader', // translates CSS into CommonJS
            }, {
              loader: 'less-loader', // compiles Less to CSS
              options: {
                    modifyVars: {
                    },
                    javascriptEnabled: true,
                },
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(dotenv.parsed)
        }),
    ],
    resolve: {
        extensions: [' ', '.js', '.jsx', '.css'],
    },
    devServer: {
        historyApiFallback: true,
    }
};

// Loader: ES6 -> ES5; JSX -> JavaScript
