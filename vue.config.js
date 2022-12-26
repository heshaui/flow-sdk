const CompressionPlugin = require('compression-webpack-plugin')
module.exports = {
  lintOnSave: process.env.NODE_ENV !== "production",
  productionSourceMap: false,
  // assetsDir: "static",
  parallel: false,
  publicPath: "weihu-flow-sdk/",
  runtimeCompiler: true,
  devServer: {
    host: "localhost",
    port: "8888",
    open: true,
    hot: true,
    proxy: {
      "/api": {
        //企业门户
        target: "http://192.168.0.187:8084/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/"
        }
      },
    }
  },
  configureWebpack: {
    output: {
      libraryExport: "default"
    },
    plugins: [
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css)$/, // 匹配文件名
            threshold: 10240, // 对超过10k的数据压缩
            deleteOriginalAssets: false, // 不删除源文件
            minRatio: 0.8 // 压缩比
        })
    ]
  },
  css: { extract: false }
};
