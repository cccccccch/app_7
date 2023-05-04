<template>
  <div class="title-bar">
    <div class="nav">
      <div class="left title-name" v-show="!active">
        <span class="iconfont icon-back" @click="goback"></span>
        <slot name="title">
          <p class="title">{{ title }}</p>
        </slot>
      </div>
      <div class="left second" v-show="active">
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
    </div>
    <transition name="slide">
      <device-options v-if="active" :isShow="active" />
    </transition>
  </div>
</template>
<script>
import DeviceOptions from "./DeviceOption";
export default {
  name: "titleBar",
  props: {
    title: String,
    showRight: { type: Boolean, default: true },
    optionType: {
      type: String,
      default: "scene",
    },
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
  components: {
    DeviceOptions,
  },
};
</script>
<style lang="less" scoped>
.title-bar {
  width: 100%;
  height: 88px;
  background: #fff;
  .nav {
    position: relative;
    z-index: 11;
    background: #fff;
    width: 100%;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 40px;
  }
  .left {
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
    z-index: 10;
    &.title-name {
      flex: 0 0 75%;
      width: 90%;
      font-weight: bold;
    }
    .icon-back {
      font-size: 36px;
      margin-right: 20px;
      width: 40px;
      height: 40px;
      line-height: 40px;
    }
    .title {
      font-size: 48px;
      font-weight: bold;
      color: #000000;
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
    position: relative;
    z-index: 10;
    min-width: 40px;
    text-align: right;
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
  &.active {
    #option_svg_top {
      width: 40px;
      transform: rotate(45deg);
    }
    #option_svg_mid {
      opacity: 0;
    }
    #option_svg_bot {
      width: 40px;
      transform: rotate(-45deg);
    }
  }
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
  transition: all 0.05s linear;
}
.slide-leave-active {
  transition: all 0.05s linear;
}
.slide-enter {
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
