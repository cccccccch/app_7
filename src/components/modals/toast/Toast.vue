<template>
  <transition :name="slideName">
    <div class="cd-toast-normal" :class="postion" v-if="isShow && type === 1" :style="{ 'z-index': zIndex }">
      <p class="title">{{ title || "服务出错" }}</p>
    </div>
    <div class="cd-toast-normal white" v-if="isShow && type === 2" :style="{ 'z-index': zIndex }">
      <span class="iconfont icon-check"></span>
      <span class="txt">记忆成功</span>
    </div>
  </transition>
</template>
<script>
export default {
  name: "modal",
  props: {
    zIndex: {
      type: Number,
      default: 999999
    },
    title: {
      type: String
    },
    type: {
      type: Number,
      default() {
        return 1;
      }
    },
    postion: {
      type: String,
      default: "top" // top middle bottom
    }
  },
  data() {
    return {
      isShow: false
    };
  },
  methods: {
    cancel() {
      this.isShow = false;
      this.$destroy();
      this.$el && document.removeChild(this.$el);
    }
  },
  watch: {
    value(newV) {
      this.isShow = newV;
    }
  },
  computed: {
    slideName() {
      return "fade_" + this.postion;
    }
  }
};
</script>
<style lang="less" scoped>
.cd-toast-normal {
  position: fixed;
  top: 80px;
  left: 20%;
  right: 20%;
  word-break: break-all;
  max-width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  .title {
    color: #000;
    padding: 18px 30px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 10px;
    color: #fff;
    font-size: 28px;
    line-height: 36px;
  }
  &.top {
    top: 80px;
  }
  &.bottom {
    top: unset;
    bottom: 380px;
  }
  &.middle {
    top: 50%;
  }
  &.white {
    left: 20px;
    right: 20px;
    top: 20px;
    transform: none;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 126px;
    box-shadow: 0 0 4px 4px #f0f0f0;
    position: fixed;
    max-width: unset;
    .txt {
      font-size: 34px;
      font-weight: 400;
      color: #121212;
      margin-left: 16px;
    }
    .iconfont {
      width: 42px;
      height: 42px;
      line-height: 42px;
      text-align: center;
      font-size: 30px;
      color: #fff;
      border-radius: 50%;
      background: #d6a467;
    }
  }
}
.fade_top-enter-active,
.fade_bottom-enter-active,
.fade_middle-enter-active {
  transition: all 0.3s ease;
}
.fade_top-leave-active,
.fade_bottom-leave-active,
.fade_middle-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade_top-enter,
.fade_top-leave-to {
  opacity: 0;
  top: 60px;
}
.fade_bottom-enter,
.fade_bottom-leave-to {
  opacity: 0;
  bottom: 400px;
}
.fade_middle-enter,
.fade_middle-leave-to {
  opacity: 0;
  top: 46%;
}
</style>
