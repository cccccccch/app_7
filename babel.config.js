module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      "@babel/preset-env",
      {
        "targets": "> 0.25%, not dead",
        "corejs": "3", // <---  此处加个这个，就没有报错警告了
        "useBuiltIns": "usage"
      }
    ]
  ],

}
