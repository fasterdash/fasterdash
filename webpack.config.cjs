const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "."),
            // Optional space delimited arguments to appear before the wasm-pack
            // command. Default arguments are `--verbose`.
            // args: '--log-level warn',
            extraArgs: '--target nodejs',
            // // Default arguments are `--typescript --target browser --mode normal`.
            // extraArgs: "--target web",
            // extraArgs: '--no-typescript',
            // Optional array of absolute paths to directories, changes to which
            // will trigger the build.
            // watchDirectories: [
            //     path.resolve(__dirname, "src")
            // ],
            // // The same as the `--out-dir` option for `wasm-pack`
            // outDir: "pkg",
            // // The same as the `--out-name` option for `wasm-pack`
            // outName: "index",
            // If defined, `forceWatch` will force activate/deactivate watch mode for `.rs` files.
            // The default (not set) aligns watch mode for `.rs` files to Webpack's
            // watch mode.
            // forceWatch: true,
            // // If defined, `forceMode` will force the compilation mode for `wasm-pack`
            // //
            // // Possible values are `development` and `production`.
            // //
            // // the mode `development` makes `wasm-pack` build in `debug` mode.
            // // the mode `production` makes `wasm-pack` build in `release` mode.
            forceMode: "production",
            // // Controls plugin output verbosity, either 'info' or 'error'.
            // // Defaults to 'info'.
            pluginLogLevel: 'verbose'
        }),
        // Have this example work in Edge which doesn't ship `TextEncoder` or
        // `TextDecoder` at this time.
        new webpack.ProvidePlugin({
            TextDecoder: ['text-encoding', 'TextDecoder'],
            TextEncoder: ['text-encoding', 'TextEncoder']
        })
    ],
    mode: 'development',
    experiments: {
        asyncWebAssembly: true
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "fs": false  // or another appropriate setting based on your use case
        }
    }
};
