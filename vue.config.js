/*
 * @Description:
 * @Version: 1.0
 * @Autor: Benjamin Chiu
 * @Date: 2021-06-28 15:00:43
 * @LastEditors: Dywade
 * @LastEditTime: 2022-02-22 11:01:05
 */
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const compressReg = /\.(js|css|json|txt|html|ico|svg)$/;

const { VantResolver } = require('unplugin-vue-components/resolvers');
const ComponentsPlugin = require('unplugin-vue-components/webpack');
module.exports = {
  // 使用相对路径，勿使用绝对路径
  publicPath: "./",
  pages: {
    light: {
      entry: "src/pages/light/index.js",
      template: "src/pages/light/public/index.html",
      filename: "light.html",
      title: "light",
      chunks: ["chunk-vendors", "chunk-common", "light"]
    },
    powerStrip: {
      entry: "src/pages/powerStrip/index.js",
      template: "src/pages/powerStrip/public/index.html",
      filename: "powerStrip.html",
      title: "powerStrip",
      chunks: ["chunk-vendors", "chunk-common", "powerStrip"]
    },
    aircondition: {
      entry: "src/pages/aircondition/index.js",
      template: "src/pages/aircondition/public/index.html",
      filename: "aircondition.html",
      title: "air-condition",
      chunks: ["chunk-vendors", "chunk-common", "aircondition"]
    },
    ventilator: {
      entry: "src/pages/ventilator/index.js",
      template: "src/pages/ventilator/public/index.html",
      filename: "ventilator.html",
      title: "fresh-air-ventilator",
      chunks: ["chunk-vendors", "chunk-common", "ventilator"]
    },
    socket: {
      entry: "src/pages/socket/index.js",
      template: "src/pages/socket/public/index.html",
      filename: "socket.html",
      title: "socket",
      chunks: ["chunk-vendors", "chunk-common", "socket"]
    },
    floorheating: {
      entry: "src/pages/floorheating/index.js",
      template: "src/pages/floorheating/public/index.html",
      filename: "floorheating.html",
      title: "Underfloor heating",
      chunks: ["chunk-vendors", "chunk-common", "floorheating"]
    },
    onOffSwitch: {
      entry: "src/pages/onOffSwitch/index.js",
      template: "src/pages/onOffSwitch/public/index.html",
      filename: "onOffSwitch.html",
      title: "onOffSwitch",
      chunks: ["chunk-vendors", "chunk-common", "onOffSwitch"]
    },
    onOffSwitchGroup: {
      entry: "src/pages/onOffSwitchGroup/index.js",
      template: "src/pages/onOffSwitchGroup/public/index.html",
      filename: "onOffSwitchGroup.html",
      title: "onOffSwitchGroup",
      chunks: ["chunk-vendors", "chunk-common", "onOffSwitchGroup"]
    },
    lightHsv: {
      entry: "src/pages/lightHsv/index.js",
      template: "src/pages/lightHsv/public/index.html",
      filename: "lightHsv.html",
      title: "lightHsv",
      chunks: ["chunk-vendors", "chunk-common", "lightHsv"]
    },
    hsvColorPicker: {
      entry: "src/pages/hsvColorPicker/index.js",
      template: "src/pages/hsvColorPicker/public/index.html",
      filename: "hsvColorPicker.html",
      title: "hsvColorPicker",
      chunks: ["chunk-vendors", "chunk-common", "hsvColorPicker"]
    },
    zigbeeDoorLock: {
      entry: "src/pages/zigbeeDoorLock/index.js",
      template: "src/pages/zigbeeDoorLock/public/index.html",
      filename: "zigbeeDoorLock.html",
      title: "zigbeeDoorLock",
      chunks: ["chunk-vendors", "chunk-common", "zigbeeDoorLock"]
    },
    home: {
      entry: "src/pages/home/index.js",
      template: "src/pages/home/public/index.html",
      filename: "index.html",
      title: "home",
      chunks: ["chunk-vendors", "chunk-common", "home"]
    },
    shadowK: {
      entry: "src/pages/shadowK/index.js",
      template: "src/pages/shadowK/public/index.html",
      filename: "shadowK.html",
      title: "shadowK",
      chunks: ["chunk-vendors", "chunk-common", "shadowK"]
    },
    curtain: {
      entry: "src/pages/curtain/index.js",
      template: "src/pages/curtain/public/index.html",
      filename: "curtain.html",
      title: "curtain",
      chunks: ["chunk-vendors", "chunk-common", "curtain"]
    },
    remoter: {
      entry: "src/pages/remoter/index.js",
      template: "src/pages/remoter/public/index.html",
      filename: "remoter.html",
      title: "Remoter",
      chunks: ["chunk-vendors", "chunk-common", "remoter"]
    },
    testing: {
      entry: "src/pages/testing/index.js",
      template: "src/pages/testing/public/index.html",
      filename: "testing.html",
      title: "testing",
      chunks: ["chunk-vendors", "chunk-common", "testing"]
    },
    
    // detector: {
    //   entry: "src/pages/detector/index.js",
    //   template: "src/pages/detector/public/index.html",
    //   filename: "detector.html",
    //   title: "detector",
    //   chunks: ["chunk-vendors", "chunk-common", "detector"]
    // }
  },
  configureWebpack: {
    resolve: {
      alias: {
        src: "@"
      }
    },
    plugins: [
      ComponentsPlugin({
        resolvers: [VantResolver()],
      }),
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: compressReg,
        threshold: 5120,
        minRatio: 0.8
      })
    ]
  },
  devServer: {
    proxy: {
      "/openapi": {
        // target: "http://iot-dev.wingto.com", // dev环境
        target: "http://iot-test.wingto.com", // test环境
        // target: "http://iot.wingto.com", // 正式环境
        changeOrigin: true,
        pathRewrite: {
          "^/openapi": "/openapi"
        }
      }
      // "/openapi": {
      //   target: "http://192.168.2.57:10212", // 丁桥坤环境
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/openapi": "/device",
      //   },
      // },
    }
  }
};
