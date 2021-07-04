const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const rm = require("rimraf");
const chalk = require("chalk");
const { exec } = require("child_process");
const tsConfig = path.join(__dirname, "..", "tsconfig.prod.json");

process.env.NODE_ENV = "production";

/**
 * Получить текущий хеш коммита на котором находимся
 * @returns {Promise<any>}
 */
function getGitVersion() {
    return new Promise((resolve, reject) => {
        exec("git rev-parse --short HEAD", (err, gitversion, stderr) => {
            if (err) {
                reject(err);
            }
            resolve(gitversion.replace(/(\r\n\t|\n|\r\t)/gm, ""));
        });
    });
}

async function letsDoIt() {
    let gitversion = await getGitVersion();

    console.log("gitversion", chalk.cyan(gitversion));

    const webpackConfig = {
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
        output: {
            pathinfo: true,
            path: path.resolve(path.join(__dirname, "..", "dist", gitversion)),
            // publicPath: "/dist/",
            publicPath: `${gitversion}/`,
            filename: "bundle.js",
            // chunkFilename: "[hash]_[name].js"
            chunkFilename: "[name].js"
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    extractComments: false,
                    terserOptions: {
                        ecma: 5,
                        warnings: false,
                        parse: {},
                        compress: {
                            ecma: 5,
                            arguments: true,
                            drop_console: true,
                            toplevel: true
                        },
                        mangle: {
                            module: true,
                            eval: true
                        },
                        module: true,
                        output: {
                            comments: false
                        },
                        eval: true,
                        toplevel: true,
                        nameCache: null,
                        ie8: false,
                        keep_classnames: false,
                        keep_fnames: false,
                        safari10: false
                    }
                })
            ],

            runtimeChunk: true,
            // если поставить true - то не даст сбилдить если есть косяки в коде.
            noEmitOnErrors: false,
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
                    vendor: {
                        chunks: "initial",
                        name: "vendor",
                        test: /[\\/]node_modules[\\/]/,
                        // minSize: 30000,
                        minChunks: 1,
                        maxAsyncRequests: 5,
                        maxInitialRequests: 3,
                        priority: -10,
                        enforce: true
                    },
                    default: {
                        minChunks: 1,
                        priority: -20,
                        reuseExistingChunk: true
                    }
                }
            }
        },
        plugins: [
            new webpack.ProgressPlugin({ profile: false }),

            new webpack.EnvironmentPlugin("NODE_ENV"),
            // плагин, который минимизирует id, которые используются webpack для подгрузки чанков и прочего.
            new webpack.optimize.OccurrenceOrderPlugin(),

            // чанки будут созданы с номерами вместо имени, но с этим плагином вебпак сохранит у себя мапу имен чанков
            // что в свою очередь позволит динамически импортировать чанк по настоящему имени.
            new webpack.HashedModuleIdsPlugin(),

            // агрессивное кеширование всего в вебпаке
            new HardSourceWebpackPlugin({
                cacheDirectory: "../../.hscache/[confighash]"
            }),

            new MiniCssExtractPlugin({}),
            new HtmlWebpackPlugin({
                hash: true,
                title: "Sandbox",
                gitversion: gitversion,
                template: "./src/index.html",
                chunksSortMode: "none",
                filename: "../index.html" //relative to root of the application
            })
        ],
        module: {
            rules: [
                {
                    enforce: "pre",
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "awesome-typescript-loader",
                            options: {
                                transpileOnly: true,
                                configFileName: tsConfig,
                                silent: true,
                                useCache: true
                            }
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
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader" // compiles Sass to CSS
                            // options: {
                            //     sourceMap: true,
                            //     sourceMapContents: false
                            // }
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
                },
                {
                    test: /\.svg$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: '..',
                        publicPath: "../"
                    }
                },
                {
                    test: /\.gif$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: '..',
                        publicPath: "../"
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
            // резолв расширений обязателен для тслоадера
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
        }
    };

    // собственно, сам запуск билда
    // дропнем
    rm(path.join("..", "dist"), (err) => {
        if (err) {
            throw err;
        }

        webpack(webpackConfig, function(err, stats) {
            // spinner.stop();
            if (err) {
                throw err;
            }

            console.log(chalk.cyan("  Build complete.\n"));
        });
    });
}

letsDoIt();