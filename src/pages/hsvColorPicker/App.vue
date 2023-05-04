<!--
 * @Author: Dywade
 * @Date: 2021-12-10 17:46:44
 * @LastEditTime: 2022-01-20 10:59:50
 * @LastEditors: Dywade
 * @Description: 
-->
<template>
  <div id="app">
    <color-picker @colorChange="colorChange" ref="colorPicker" />
  </div>
</template>

<script>
import colorPicker from "../lightHsv/components/ColorPicker";
import { execNativeFunc } from "../../utils/bridge";
import globalMixins from "../../mixins/index";
export default {
  name: "App",
  mixins: [globalMixins],
  data() {
    return {};
  },
  methods: {
    colorChange(data) {
      execNativeFunc("onHsvColorPicker", data);
    },
    setColor(data) {
      this.$refs.colorPicker._getPositionByHue(data.hue, data.saturation);
    },
  },
  mounted() {
    let that = this;
    window.WINGTO_H5.onSetHsvColor = function(data) {
      try {
        let result = JSON.parse(data);
        if (result) {
          that.setColor(result);
        }
      } catch (error) {
        console.error(error);
      }
    };
  },
  components: { colorPicker },
};
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
html,
body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;
}
</style>
