const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 개발 모드 감지
const isDevMode = process.env.NODE_ENV === 'development';

// 개발,배포 모든 모드에서 사용되는 Webpack 플러그인 목록(배열)
const plugins = [
  new HtmlWebpackPlugin({
    template: './public/index.html',
    filename: 'index.html',
  }),
  new ForkTsCheckerWebpackPlugin(),
  new CleanWebpackPlugin(),
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'development',
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'development',
  }),
];

// 배포 모드인 경우 plugins에 배포용 플러그인 추가
if (!isDevMode) {
  plugins.push(
    new MiniCssExtractPlugin({
      linkType: false,
      filename: 'assets/css/[name].[contenthash].css',
      chunkFilename: 'assets/css/[name].[contenthash].chunk.css',
    })
  );
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
    library: 'common',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        // 이미지 파일 로더
        test: /\.(jpg|jpeg|gif|png|svg|ico)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000, // 파일 사이즈가 10k보다 작은 경우 문자열로 만들어 사용하는 부분에 직접 삽입(번들로)
              fallback: 'file-loader', // 파일 사이즈가 10k 보다 큰 경우, file-loader를 이용하여 파일 복사
              name: 'images/[name].[ext]', // 복사할 때 파일을 이미지(image)폴더에 파일명(name)과 확장자(ext) 형태로 복사합니다.
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000, // 파일 사이즈가 10k보다 작은 경우 문자열로 만들어 사용하는 부분에 직접 삽입(번들로)
              fallback: 'file-loader', // 파일 사이즈가 10k 보다 큰 경우, file-loader를 이용하여 파일 복사
              name: 'fonts/[name].[ext]', // 복사할 때 파일을 이미지(image)폴더에 파일명(name)과 확장자(ext) 형태로 복사합니다.
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  plugins,
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    hot: true,
    open: true,
    historyApiFallback: true,
  },
};
