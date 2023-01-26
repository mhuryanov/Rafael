/* eslint-disable no-console */
const exec = require('child_process').exec;
const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ReactLoadableSSRAddon = require('react-loadable-ssr-addon')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const enableBundleAnalyzerPlugin = false // Show package usage 
const SelectedPlugins = []
if (enableBundleAnalyzerPlugin) {
  console.log('Setting BundleAnalyzerPlugin Plugin')
  SelectedPlugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    generateStatsFile: true,
    statsOptions: { source: false },
    openAnalyzer: true
  }))
}
const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));
const index_file_name = isDevServer ? 'index_webpack.html' : 'index.html' //will have 2 index File, one for dev server 
const distPath = path.resolve('./dist/webpack_bundles/')
const htmlTemplate = path.resolve(__dirname, './front_end/templates/' + index_file_name)
const backend_host = process.env.BACKEND_HOST || 'localhost';

const webpackConfig = {
  context: __dirname,

  entry: './front_end/resources/js/index.js',

  output: {
    path: distPath,
    filename: 'main.js',
    chunkFilename: '[name][contenthash].chunk.js',
    publicPath: '/static/webpack_bundles/'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    nodeEnv: 'development',
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          minChunks: 20
        },
        default: {
          minChunks: 5,
          reuseExistingChunk: true
        }
      }
    }
  },
  devtool: 'cheap-module-eval-source-map',
  // SIMPLE DEV SERVER
  devServer: {
    contentBase: distPath,
    disableHostCheck: true,
    hot: true,
    host: '0.0.0.0',
    port: 8080,
    index: 'index.html',
    writeToDisk: true,
    proxy: {
      '!/static/webpack_bundles/**': {
        target: `http://${backend_host}:8000`, // points to django dev server
        changeOrigin: true,
      },
    },
  },
  plugins: SelectedPlugins.concat([
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.put
      // all options are optional
      filename: 'index.css',
      chunkFilename: '[id].css',
      ignoreOrder: false // Enable to remove warnings about conflicting order
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: htmlTemplate,
      cache: false,
      base: '/',
      favicon: path.resolve(__dirname, './front_end/resources/js/imgs/favicon.ico')
    }),
    new BundleTracker({
      path: './dist/webpack_bundles/',
      filename: 'webpack-stats.json'
    }),
    new ReactLoadableSSRAddon({
      filename: 'react-loadable-ssr-addon.json'
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    /*
        The rafael_backend codebase is currently housed as a submodule in the rafael project.
        Due to directory structure and the way static files are served by Django, we need to
        make the following files that are needed by the web app available in the right directory
        of the backend:

        - front_end/templates:                                 Django templates with webpack template helpers
        - front_end/resources/js/_map_resources:               static files used by Django
        - front_end/resources/js/imgs:                         static files used by Django
        - dist/webpack_bundles:                       webpack code-splitted module bundles
        - dist/webpack_bundles/webpack-stats.json     webpack bundle statistics

        The following user-defined plugins, rely on Webpack compilation hooks, to perform all
        file copying needed to make the static files available to Django. `BeforeCompilePlugin`
        runs once when webpack initializes its environment and `AfterEmitPlugin` runs after the
        compilation is complete. webpack when used with watch option, will run this over and
        over again after every successful compilation.
    
        Relevant radar: rdar://82886981
    */
    {
      apply: (compiler) => {
        compiler.hooks.environment.tap('BeforeCompilePlugin', (compilation) => {
          exec(`
            bash -xc "
              rm -rf './assets/static/webpack_bundles/*';
              mkdir -p assets/static;
              "
            `, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    },
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec(`
            bash -xc "
              rm -rf 'assets/static/webpack_bundles/*';
              cp -v -r dist/webpack_bundles assets/static;
              cp -v -r front_end/templates assets;
              cp -v -r front_end/resources/js/_map_resources assets/static/webpack_bundles;
              cp -v -r front_end/resources/js/imgs assets/static/webpack_bundles;
              sleep 1;
              cp -v dist/webpack_bundles/webpack-stats.json assets/static/webpack_bundles/webpack-stats.json;
              "
            `, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    }
  ]),
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
        // query: {
        //   presets: ['react', 'es2015', 'react-hmre'],
        //   plugins: [],
        // },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.put
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development'
              // include: '/node_modules[/\\]react-dropdown-tree-select/',
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              javascriptEnabled: true,
              math: { 'parens-division': true }
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /favicon\.ico$/,
        loader: 'url',
        query: {
          limit: 1,
          name: '[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '*']
  }
}
module.exports = smp.wrap(webpackConfig)