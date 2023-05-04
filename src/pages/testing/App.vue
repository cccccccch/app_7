<!--
 * @Author: Dywade
 * @Date: 2022-01-21 11:40:22
 * @LastEditTime: 2022-02-21 17:46:38
 * @LastEditors: Dywade
 * @Description: 
-->
<template>
  <div id="app">
    <transition :name="slideName">

        <router-view class="app-container"></router-view>
    
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
      slideName: "slide-left"
    };
  },

  watch: {
    $route(to, from) {
      let slideWay = to.query.slideWay || "right";
      if (from.name === "TimerWeek" || (from.name === "TimerSetting" && to.name === "CurtainClock")) {
        slideWay = "right";
      }
      this.slideName = slideWay === "right" ? "slide-right" : "slide-left";
    }
  }
};
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
#app {
  user-select: none;
  height: 100vh;
  width: 100vw;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
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
  z-index: 10;
}
.slide-left-leave-active {
  z-index: 0;
}
.slide-right-leave-active {
  transform: translate(100%, 0);
  z-index: 123456799;
}
</style>
