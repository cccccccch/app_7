<template>
  <div class="scene-btn" @touchstart.stop="onTouchStart" @touchend.stop="onTouchEnd" ref="btn">
    <div class="bind" v-if="btnType === 'bind'">
      <p class="name">{{ sceneName }}</p>
    </div>
    <div class="empty" v-else></div>
    <div class="loading-area" v-show="showLoading">
      <loading-comp v-model="showLoading" />
    </div>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
  </div>
</template>
<script>
import LoadingComp from "../../../../components/SpinLoading";
import Modal from "../../../../components/modals/modal/Modal";
import { mapGetters } from "vuex";
export default {
  name: "scene-btn-comp",
  props: {
    disabled: { type: Boolean, default: false },
    sceneName: {
      type: String,
    },
    btnType: {
      type: String,
      default() {
        return "empty";
      },
    },
    loading: Boolean,
  },
  data() {
    return {
      rect: {},
      longtouch: 0,
      timer: null,
      showLoading: false,
      deviceDisableModal: false,
      deviceDisableContent: "",
    };
  },
  methods: {
    _showDisableModal() {
      let txt = "暂时无法操作";
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
    },
    onTouchStart(el) {
      if (this.deviceDisableModal) return;
      if (this.disabled) {
        this._showDisableModal();
        return;
      }
      if (this.showLoading) return;
      this.rect = this.$refs.btn.getBoundingClientRect();
      this.longtouch = 0;
      this.timer = setTimeout(() => {
        this.longtouch = 1;
        this.$emit("longtap");
        this.timer && clearTimeout(this.timer);
      }, 360);
    },
    onTouchEnd(e) {
      if (this.showLoading) return;
      const evt = e.changedTouches[0];
      const x = evt.clientX;
      const y = evt.clientY;
      if (x < this.rect.left || y < this.rect.top || x > this.rect.right || y > this.rect.bottom) {
        // 不在元素内松手，认为是取消事件
        this.longtouch = 0;
        this.timer && clearTimeout(this.timer);
        return;
      }
      if (this.deviceDisableModal) return;
      if (this.disabled) return;
      if (this.longtouch) {
        this.$emit("longtap");
      } else {
        if (this.disabled || this.showLoading) return;
        this.$emit("tap");
        this.showLoading = this.btnType && this.btnType !== "empty" && !this.disabled;
      }
      this.rect = {};
      this.longtouch = 0;
      this.timer && clearTimeout(this.timer);
    },
  },
  computed: {
    ...mapGetters(["globalDeviceStatus"]),
  },
  components: {
    LoadingComp,
    Modal,
  },
  beforeDestroy() {
    this.rect = {};
    this.longtouch = 0;
    this.timer && clearTimeout(this.timer);
  },
};
</script>
<style lang="less" scoped>
.scene-btn {
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    user-select: none;
    &::after {
      width: 60px;
      height: 6px;
      border-radius: 3px;
      background: #f1f1f1;
      content: " ";
      display: block;
    }
    &::before {
      width: 6px;
      height: 60px;
      border-radius: 3px;
      background: #f1f1f1;
      content: " ";
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .bind {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    user-select: none;
    &::after {
      position: absolute;
      left: 50%;
      bottom: 20px;
      width: 60px;
      height: 6px;
      border-radius: 3px;
      background: #efefef;
      content: " ";
      transform: translateX(-50%);
    }
    .name {
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: #959495;
      font-size: 32px;
      font-weight: 400;
      user-select: none;
      box-sizing: border-box;
      padding: 0 20px;
    }
  }
  .loading-area {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    user-select: none;
  }
}
</style>
