
module.exports = {
  lintOnSave: process.env.NODE_ENV !== "production",
  productionSourceMap: false,
  assetsDir: "static",
  parallel: false,
  publicPath: "./",
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
    }
  },
  css: { extract: false }
};
