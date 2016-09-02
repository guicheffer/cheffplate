import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import SpriteWebpack from 'sprite-webpack-plugin';

import pkg from './package.json';

const resolve = path.resolve;
const isDevelopment = pkg.config.env.dev === (process.env.NODE_ENV || pkg.config.env.dev);

console.log(
  'Is development?', isDevelopment,
  '\nSource: ', resolve(__dirname, pkg.config.path.src),
  '\nBuild:', resolve(__dirname, pkg.config.path.build)
);

let config = {
  cache: !isDevelopment,
  debug: isDevelopment,
  devtool: 'source-map',
  context: resolve(__dirname, pkg.config.path.src),

  entry: {
    './scripts/base.js': pkg.config.base,
    './styles/base.css': pkg.config.style,
  },

  output: {
    path: resolve(__dirname, pkg.config.path.build),
    filename: '[name]',
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.styl'],
  },

  module: {
    preLoaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /(node_modules|build)/,
        loader: 'eslint-loader',
        include: path.join(__dirname, pkg.config.path.src, 'scripts')
      }
    ],

    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /(node_modules|build)/,
        loader: 'babel',
        include: path.join(__dirname, pkg.config.path.src, 'scripts'),
        query: {
          presets: ['react', 'es2015', 'stage-0']
        }
      },

      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract(
          'css?sourceMap' + (!isDevelopment ? '&minimize' : '') + '!stylus?sourceMap'
        )
      },

      {
        test: /\.eot$|\.woff$|\.woff2$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file?name=[path][hash].[ext]'
      },

      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
        loaders: [
          'file?name=[path][hash].[ext]'
        ].concat(
          isDevelopment
          ? [] : [
            'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
          ]
        )
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: pkg.name,
      inject: false,
      minify: {
        collapseInlineTagWhitespace: true,
        collapseWhitespace: !isDevelopment,
        removeAttributeQuotes: true,
        removeComments: !isDevelopment,
      },
      cache: !isDevelopment,
      template: resolve(__dirname, pkg.config.path.src, pkg.config.views, pkg.config.html)
    }),
    new ExtractTextPlugin('[name]', {allChunks: true}),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new SpriteWebpack({
      'source': resolve(__dirname, pkg.config.path.src, 'assets/images/spriting/'),
      'imgPath': resolve(__dirname, pkg.config.path.src, 'assets/images/'),
      'cssPath': resolve(__dirname, pkg.config.path.src, 'styles/includes/sprites/'),
      'bundleMode': 'multiple',
      'prefix': 'sprt',
    })
  ].concat(
    isDevelopment
    ? [] : [
      new webpack.optimize.UglifyJsPlugin({
        include: /(\.js|\.jsx)$/,
        exclude: /(node_modules|build)/,
        sourceMap: true,
        output: {
          comments: true
        },
        compressor: {
          screw_ie8: true,
          keep_fnames: true,
          warnings: false
        },
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        }
      })
    ]
  ),

  eslint: {
    configFile: resolve(__dirname, '.eslintrc')
  }
};

/*WebpackDevServer*/
if (isDevelopment) {
  new WebpackDevServer(webpack(config), {
    contentBase: resolve(__dirname, pkg.config.path.build),
    hot: true,
    debug: true
  }).listen(pkg.config.port, pkg.config.host, function (err, result) {
    if (err) {
      console.log(err);
    }
  });
  console.log(
    'Running at:',
    `${pkg.config.protocol}${pkg.config.host}:${pkg.config.port}`
  );
}

export default config;
