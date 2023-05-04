<template>
  <div
    class="modal"
    v-show="isShow"
    @touchstart.stop
    @touchmove.stop
    :style="{ 'z-index': zIndex }"
  >
    <div class="mask" @touchmove.prevent @click="cancel('mask')" ></div>
    <transition name="fade">
      <div class="modal-main" v-show="isShow">
        <slot name="title">
          <p class="title">{{ title || "提示" }}</p>
        </slot>

        <div class="content">{{ content }}</div>
        <div class="bot" v-if="type === ''" @touchstart="onTouch">
          <div class="normal">
            <span class="cancel" @click="cancel('btn')">{{ cancelText }}</span>
            <span class="line"></span>
            <span class="comfirm" @click="comfirm">{{ okText }}</span>
          </div>
        </div>
        <div
          class="bot"
          v-if="type === 'one'"
          @touchstart="onTouch"
          @click.stop="comfirm"
        >
          <slot>我知道了</slot>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: "modal",
  props: {
    dismiss: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Boolean,
      default: false,
    },
    zIndex: {
      type: Number,
      default: 123456789,
    },
    content: {
      type: String,
    },
    title: {
      type: String,
    },
    type: {
      // 如果是none，则没有底部点击按钮, 如果是one，则只有一颗按钮
      type: String,
      default: "",
    },
    okText: {
      type: String,
      default: "确定",
    },
    cancelText: {
      type: String,
      default: "取消",
    },
    maskCancel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow: false,
      isTouch: false, // 防止外部的触摸事件影响
    };
  },
  methods: {
    onTouch(e) {
      this.isTouch = true;
    },
    comfirm(e) {
      if (!this.isTouch) return;
      if (this.dismiss) {
        this.isShow = false;
        this.isTouch = false;
        this.$emit("input", false);
      }
      this.$emit("on-ok");
    },
    cancel(type) {
      if (type === "mask" && !this.maskCancel) return;
      this.$emit("on-cancel");
      if (this.dismiss) {
        this.$emit("input", false);
        this.isShow = false;
      }
    },
  },
  watch: {
    value(newV) {
      this.isShow = newV;
    },
  },
  created() {
    this.isShow = this.value;
  },
};
</script>
<style lang="less" scoped>
.modal {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .mask {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
  .modal-main {
    width: 500px;
    background: #fff;
    border-radius: 30px;
    z-index: 2;
    box-sizing: border-box;
    padding: 40px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #121212;
      margin-bottom: 40px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
      padding: 0 68px;
    }
    .content {
      flex: 1;
      font-size: 28px;
      font-weight: 400;
      color: #121212;
      text-align: center;
      width: 100%;
      word-break: break-all;
      line-height: 45px;
      box-sizing: border-box;
      padding: 0 40px;
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    .bot {
      height: 114px;
      width: 100%;
      border-top: 2px solid rgba(0, 0, 0, 0.05);
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      color: #4289ff;
      line-height: 114px;
      .normal {
        height: 114px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 32px;
        font-weight: 400;
        .line {
          width: 2px;
          height: 40px;
          background-color: rgba(0, 0, 0, 0.05);
        }
        .cancel {
          flex: 1;
          text-align: center;
          color: #797979;
        }
        .comfirm {
          flex: 1;
          text-align: center;
        }
      }
    }
  }
}
.fade-enter-active {
  transition: all 0.2s ease;
}
.fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
