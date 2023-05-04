<template>
  <div class="loading">
    <div class="loading-wrap">
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
      <span :style="{ background: color }"></span>
    </div>
    <div class="loading-mask" :style="{ background: maskColor }" v-show="showMask"></div>
  </div>
</template>
<script>
export default {
  name: "loading",
  props: {
    color: {
      type: String,
      default: "#fff",
    },
    showMask: {
      type: Boolean,
      default: true,
    },
    maskColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.3)",
    },
  },
};
</script>
<style lang="less" scoped>
.loading {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .loading-wrap {
    position: relative;
    z-index: 2;
    > span {
      position: absolute;
      width: 5px;
      height: 15px;
      background: #fff;
      &:nth-child(1) {
        top: 20px;
        left: 0;
        animation: line-spin-fade-loader 1.2s -0.84s infinite ease-in-out;
      }
      &:nth-child(2) {
        top: 13.64px;
        left: 13.64px;
        transform: rotate(-45deg);
        animation: line-spin-fade-loader 1.2s -0.72s infinite ease-in-out;
      }
      &:nth-child(3) {
        top: 0;
        left: 20px;
        transform: rotate(90deg);
        animation: line-spin-fade-loader 1.2s -0.6s infinite ease-in-out;
      }
      &:nth-child(4) {
        top: -13.64px;
        left: 13.64px;
        transform: rotate(45deg);
        animation: line-spin-fade-loader 1.2s -0.48s infinite ease-in-out;
      }
      &:nth-child(5) {
        top: -20px;
        left: 0;
        animation: line-spin-fade-loader 1.2s -0.36s infinite ease-in-out;
      }
      &:nth-child(6) {
        top: -13.64px;
        left: -13.64px;
        transform: rotate(-45deg);
        animation: line-spin-fade-loader 1.2s -0.24s infinite ease-in-out;
      }
      &:nth-child(7) {
        top: 0;
        left: -20px;
        transform: rotate(90deg);
        animation: line-spin-fade-loader 1.2s -0.12s infinite ease-in-out;
      }
      &:nth-child(8) {
        top: 13.64px;
        left: -13.64px;
        transform: rotate(45deg);
        animation: line-spin-fade-loader 1.2s 0s infinite ease-in-out;
      }
    }
  }
  .loading-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
  }
  @keyframes line-spin-fade-loader {
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>
