<!--
 * @Author: Dywade
 * @Date: 2021-12-15 16:04:55
 * @LastEditTime: 2022-02-19 17:15:23
 * @LastEditors: Dywade
 * @Description: 
-->
<script lang="ts">
import ColorPicker from "./components/ColorPicker.vue";
import minxins from "../mixins/index";
import { execNativeFunc } from "./utils/bridge";
import { ref } from "vue";

export default {
  mixins: [minxins],
  data() {
    return {
      xyColor: "22056 22256",
    };
  },

  setup() {
    const onColorChange = (data: any) => {
      let params: any = { curXY: data.curXY, isTouchEnd: !!data.isTouchEnd };
      params.rgba = [data.color[0] | 0, data.color[1] | 0, data.color[2] | 0, 1];
      execNativeFunc("onXyColorPicker", params);
    };
    const pickerNode = ref<HTMLElement>();
    return {
      pickerNode,
      onColorChange,
    };
  },
  methods: {
    setColor(data: any) {
      (this as any).xyColor = data.curXY;
      (this as any).pickerNode._initIndicatorPosition(data.curXY, false)
    },
  },
  components: {
    ColorPicker,
  },
  mounted() {
    let that = this;
    (window as any).WINGTO_H5.onSetXyColor = function (data: string) {
      if (!data) return;
      try {
        let result = JSON.parse(data);
        if (result) {
          (that as any).setColor(result);
        }
      } catch (error) {
        console.error(error);
      }
    };
  },
};
</script>

<template>
  <ColorPicker @onColorChange="onColorChange" :xyColor="xyColor" ref="pickerNode" />
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;
}
</style>
