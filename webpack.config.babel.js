import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import SpriteWebpack from 'sprite-webpack-plugin';

import pkg from './package.json';

const resolve = path.resolve;
const isDevelopment = pkg.config.env.dev === (process.env.NODE_ENV || pkg.config.env.dev);

console.log(
  'Is development?', isDevelopment,
  '\nSource: ', resolve(__dirname, 'src/'),
  '\nBuild:', resolve(__dirname, 'build/')
);

let config = {
  debug: isDevelopment,
  devtool: 'source-map',
  cache: !isDevelopment,

  context: resolve(__dirname, 'src/'),

  entry: {
    './scripts/base.js': './scripts/base.js',
    './styles/base.css': './styles/base.styl',
  },

  output: {
    path: resolve(__dirname, 'build/'),
    filename: '[name]',
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.styl'],
  },

  exclude: /(base|includes)/,

  module: {
    preLoaders: [
      {
        test: /(\.js|\.jsx)$/,
        loader: 'eslint-loader',
        include: path.join(__dirname, 'src/')
      }
    ],

    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      },

      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract(
          'css?sourceMap' + (!isDevelopment ? '&minimize' : '') + '!stylus?sourceMap'
        )
      },

      {
        test: /\.jpe?g$|\.gif$|\.png$|\.eot$|\.svg$|\.woff$|\.woff2$|\.ttf$|\.wav$|\.mp3$/,
        loader: "file?name=[path][hash].[ext]"
      }
    ]
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new SpriteWebpack({
      'source': resolve(__dirname, 'src/assets/images/spriting/'),
      'imgPath': resolve(__dirname, 'src/assets/images/'),
      'cssPath': resolve(__dirname, 'src/styles/includes/sprites/'),
      'bundleMode': 'multiple',
      'prefix': 'sprt',
    }),
    new ExtractTextPlugin('[name]', {allChunks: true})
  ].concat(
    isDevelopment
    ? [] : [
      new webpack.optimize.UglifyJsPlugin({
        include: /(\.js)$/,
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
    contentBase: resolve(__dirname, 'build/'),
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
