<!--
 * @Author: Dywade
 * @Date: 2021-12-15 16:04:55
 * @LastEditTime: 2022-01-20 10:58:46
 * @LastEditors: Dywade
 * @Description: 
-->
<script lang="ts">
import PickerComp from "./components/picker.vue";
import { onMounted, ref, reactive, toRefs } from 'vue'
import { hex2rgb } from '../utils/index';
import { execNativeFunc } from "../utils/bridge";
import minxins from '../mixins/index'

interface ColorItem {
  isTouchEnd: boolean;
  color: string,
  templature: number,
  rgb: Array<number>
}

export default {
  mixins: [minxins],
  data() {
    return {
      colorType: 0,
      templature: 4500
    }
  },
  setup() {
    const pickerNode = ref<HTMLElement>()
    const tempratureChange = (data: ColorItem) => {
      let params: any = { ...data }
      params.rgba = [...hex2rgb(data.color), 1]
      execNativeFunc("onTempColorPicker", data);
    }
    return {
      pickerNode,
      tempratureChange,
    }
  },
  methods: {
    setColor(data: { colorType?: number, templature?: number }) {
      (this as any).templature = data.templature || 4500;
      (this as any).colorType = Number(data.colorType) || 0;
    }
  },
  components: {
    PickerComp,
  },
  mounted() {
    let that = this;
    (window as any).WINGTO_H5.onSetTempColor();
    
    (window as any).WINGTO_H5.onSetTempColor = function (data: string) {
      try {
        let result = JSON.parse(data);
        if (result) {
          (that as any).setColor(result);
        }
      } catch (error) {
        console.error(error);
      }
    };
  }
}
</script>

<template>
  <PickerComp
    color-type="normal"
    @onTempratureChange="tempratureChange"
    :colorType="colorType"
    :templature="templature"
    ref="pickerNode"
  />
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

