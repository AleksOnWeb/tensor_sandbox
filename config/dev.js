const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

process.env.NODE_ENV = "development";

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        app: [path.resolve(path.join(__dirname, "..", "src", "main.ts"))],
        /*vendor: [
            //"core-js",
            //"lodash",
            //"regenerator-runtime",
            //"webfontloader",
            //"pixi.js"//,
            //"pixi-spine",
            //"pixi-particles",
            //"howler"
        ]*/
    },
    devtool: "cheap-source-map",
    output: {
        pathinfo: true,
        path: path.resolve(path.join(__dirname, "..", "dist")),
        publicPath: "",
        filename: "bundle.js",
        chunkFilename: "[name].js"
    },
    watch: true,
    optimization: {
        splitChunks: {
            // chunks: "all",
            chunks: "async",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            // automaticNameDelimiter: '~',
            name: true,

            cacheGroups: {
                /*vendor: {
                    chunks: "initial",
                    name: "vendor",
                    test: /[\\/]node_modules[\\/]/,
                    // minSize: 30000,
                    minChunks: 1,
                    maxAsyncRequests: 5,
                    maxInitialRequests: 3,
                    priority: -10,
                    enforce: true
                },*/
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },
        runtimeChunk: true
    },
    plugins: [
        new webpack.EnvironmentPlugin("NODE_ENV"),
        // чанки будут созданы с номерами вместо имени, но с этим плагином вебпак сохранит у себя мапу имен чанков
        // что в свою очередь позволит динамически импортировать чанк по настоящему имени.
        new webpack.NamedModulesPlugin(),

        // агрессивное кеширование всего в вебпаке
        new HardSourceWebpackPlugin({
            cacheDirectory: '../.hscache/[confighash]'
        }),

        new HtmlWebpackPlugin({
            hash: true,
            title: 'Sandbox',
            gitversion: '',
            template: "./src/index.html",
            filename: '../dist/index.html' //relative to root of the application
        }),

        new BrowserSyncPlugin({
            host: process.env.IP || "localhost",
            port: process.env.PORT || 3030,
            open: false,
            server: {
                baseDir: [
                    path.join(__dirname, ".."),
                    path.join(__dirname, "..", "dist")
                ]
            }
        })
    ],
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "awesome-typescript-loader",
                        options: {
                            // не проверяем ошибки ts
                            transpileOnly: true,
                            silent: true,
                            // используем кэш (компилить только изменившиеся файлы)
                            useCache: true
                        }
                    }
                ],
                include: path.join(__dirname, "..", "src")
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "source-map-loader"
                    }
                ],
                include: path.join(__dirname, "..", "src")
            },
            {
                test: /\.s[ac]ss$/,
                // test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader" // compiles Sass to CSS
                    }
                ]
            },
            {
                test: /\.png$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: undefined,
                    publicPath: "../assets/static/"
                }
            }
        ]
    },
    node: {
        fs: "empty",
        net: "empty",
        tls: "empty"
    },
    resolve: {
        alias: {},
        modules: ["node_modules", "local_modules"],
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    stats: {
        // Colored output
        colors: true
    },
    target: 'web'
};
