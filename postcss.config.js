module.exports = {
  plugins: {
    "postcss-px-to-viewport": {
      // "exclude": /(/|\)(node_modules)(/|\)/
      unitToConvert: "px",
      viewportWidth: 750,
      unitPrecision: 5,
      propList: ["*"],
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      selectorBlackList: ["px-"],
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      exclude: undefined,
      include: undefined,
      landscape: false,
      landscapeUnit: "vw",
      landscapeWidth: 568,
    },
  },
};
