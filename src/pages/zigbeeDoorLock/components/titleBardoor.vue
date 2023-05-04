<template>
  <div class="title-bar">
    <div class="left title-name" :class="{ all: !secondTitle }" v-show="!active">
      <span class="iconfont icon-back" @click="goback"></span>
      <slot name="title">
        <p class="title">{{ title }}</p>
      </slot>
    </div>
    <div class="left second" v-if="secondTitle" v-show="active">
      <span class="iconfont icon-back" @click="clickOption"></span>
      <p class="title">设置</p>
    </div>
    <div class="right" v-if="showRight && !active">
      <slot name="right">
        <div class="lines">
          <div @click="clickOption" id="option_svg" :class="{ active: active }">
            <div id="option_svg_top" class="px-option_svg_item "></div>
            <div id="option_svg_mid" class="px-option_svg_item"></div>
            <div id="option_svg_bot" class="px-option_svg_item"></div>
          </div>
        </div>
      </slot>
    </div>
    <transition name="slide">
      <deviceOptionsDoor v-if="active" :isShow="active" />
    </transition>
  </div>
</template>
<script>
import deviceOptionsDoor from "./option";
export default {
  name: "titleBardoor",
  props: {
    title: String,
    showRight: { type: Boolean, default: true },
    secondTitle: { type: Boolean, default: true },
  },
  data() {
    return {
      active: false,
    };
  },
  methods: {
    clickOption() {
      this.active = !this.active;
    },
    goback() {
      this.$emit("goBack");
    },
  },
  created(){

  },
  components: { deviceOptionsDoor },
};
</script>
<style lang="less" scoped>
.title-bar {
  position: relative;
  width: 100%;
  height: 88px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 40px;
  .icon-back {
    font-size: 36px;
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    color: #000000;
  }
  .left {
    display: flex;
    align-items: center;
    flex: 1;
    &.title-name {
      font-weight: bold;
      &.all {
        flex: 100%;
        width: 100%;
      }
    }
    .title {
      font-size: 40px;
      font-weight: bold;
      color: #000000;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 80px;
      white-space: nowrap;
      line-height: normal;
      box-sizing: border-box;
    }
    &.second {
      .title {
        flex: 1;
        text-align: center;
        font-size: 36px;
        color: #2f2f4a;
        padding-right: 40px;
      }
    }
  }
  .right {
    position: absolute;
    right: 40px;
    top: 50%;
    min-width: 40px;
    text-align: right;
    transform: translateY(-50%);
    .btn {
      width: 60px;
    }
  }
}
#option_svg {
  width: 40px;
  height: 40px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 9px;
  .px-option_svg_item {
    transform-origin: 7%;
    transition: all 0.2s linear;
    height: 2px;
    border-radius: 4px;
    background: #000;
  }
  #option_svg_mid {
    width: 40px;
    margin-bottom: 8px;
    opacity: 1;
  }
  #option_svg_top {
    margin-bottom: 8px;
    width: 24px;
  }
  #option_svg_bot {
    width: 30px;
  }
}
.slide-enter-active {
  transition: all 0.2s linear;
}
.slide-leave-active {
  transition: all 0.2s linear;
}
.slide-enter {
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
