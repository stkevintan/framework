const webpack = require('webpack');
const path = require('path');
//const CopyWebpackPlugin = require('copy-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry:{
        vendor:["jquery"],//基础库
        app:"./src/scripts/entry.js"
    },
    output:{
        path:path.resolve('dist'),
        filename:"bundle.js",
        publicPath:''
    },
    resolve:{
        root:[
            path.resolve('src')
        ]
    },
    module:{
        loaders:[
            {
                test:/(\.jsx|\.js)/,
                loader:'babel',
                exclude:/(node_modules|bower_components|^_)/,
                query: {
                    presets: ['es2015']
                }
            }
            //{test:/\.(css|sass|scss)$/,loader:"style!css!sass"},
            //{test:/\.(png|jpg)$/,loader:"url-loader?limit=10000&name=[name].[ext]"},
            //{test:/\.jade$/,loader:"jade"}
        ]
    },
    plugins:[
        new webpack.BannerPlugin(`This file is created by Kevin Tan.`),
        new webpack.optimize.CommonsChunkPlugin({
            name:'vendor',
            filename:'vendor.bundle.js',
            //minChunks:Infinity
            // (with more entries, this ensures that no other module
            //  goes into the vendor chunk)
            minChunks:3
        },'vendors.bundle.js'),
        new webpack.DefinePlugin({
            VERSION: '1.0.0',
            DEBUG:true,
            PRODUCTION:false
        }),
        new webpack.ProvidePlugin({
            $:'jquery'
        }),
        //new HtmlWebpackPlugin({
        //    title:'framework'
        //}),
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
}
