<template>
  <div id="app">
    <transition :name="slideName">
      <keep-alive :exclude="['BindSetting','SignalTest']">
        <router-view class="app-container"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import globalMixins from "../../mixins/index";
export default {
  name: "App",
  mixins: [globalMixins],
  data() {
    return {
      slideName: "slide-left",
    };
  },
  watch: {
    $route(to, from) { 
      if (from.meta && to.meta && from.meta.level > to.meta.level) {
        to.query.slideWay = "right";
      } 
      let slideWay = to.query.slideWay || "right";
      this.slideName = slideWay === "right" ? "slide-right" : "slide-left";
    },
  },
};
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.3s linear;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}
.slide-left-enter {
  transform: translate(100%, 0);
}
.slide-left-enter-active {
  z-index: 110;
}
.slide-left-leave-active {
  z-index: 0;
}
.slide-right-leave-active {
  transform: translate(100%, 0);
  z-index: 111;
}
</style>
