<template>
  <div class="correct flex-jb">
    <title-bar @goBack="goback">
      <template v-slot:title><p class="title title-bar">上下限位设置</p></template>
      <template v-slot:right><p class="rever-btn" @click="handleRever">反转</p></template>
    </title-bar>
    <div class="main flex-jb">
      <p class="tips">上限位指窗帘的顶端位置，下限位指窗帘的底端位置<br />如果电机错误请点击右上角“反转”切换</p>
      <div class="center flex-ac-jc-dc">
        <div class="btn flex-ac-jc" :class="{ active: !!isSetMax, disable: isSetLoading && curPosition !== 0 }" @click="clickShowPop(0)">
          <div class="loading-btn-wrap" v-show="isSetLoading && curPosition === 0"><loadingSvg color="#999" /></div>
          {{ isSetMax ? "已设上限位" : "上限位" }}
        </div>
        <c-roll :hideBtn="true" />
        <div class="btn flex-ac-jc" :class="{ active: !!isSetMin, disable: isSetLoading && curPosition !== 1 }" @click="clickShowPop(1)">
          <div class="loading-btn-wrap" v-show="isSetLoading && curPosition === 1"><loadingSvg color="#999" /></div>
          {{ isSetMin ? "已设下限位" : "下限位" }}
        </div>
      </div>
      <div class="bot flex-ac-jc" :class="{ disable: (isSetLoading && curPosition !== 2) || (!isSetMax && !isSetMin) }" @click="clickReset">
        <div class="loading-btn-wrap" v-show="isSetLoading && curPosition === 2"><loadingSvg color="#999" /></div>
        重置所有限位点
      </div>
    </div>
    <div class="pop-modal" :class="{ show: popModal, hide: !popModal }">
      <div class="mask" v-show="popModal"></div>
      <div class="pop-main flex-jb" :class="{ show: popModal }">
        <p class="pop-title">选择合适位置点击停止设置为{{ curPositionText }}点</p>
        <div class="btn-area flex-ac-jb">
          <div class="item flex-ac-jc-dc">
            <span class="iconfont icon-drap up" v-show="curCorrectWay !== 'up'" @click="clickCorrectBtn('up')"></span>
            <span class="iconfont icon-pause" v-show="curCorrectWay === 'up'" @click="clickCorrectBtn('pause')"></span>
            <span class="txt">{{ curCorrectWay === "up" ? "暂停" : "向上" }}</span>
          </div>
          <div class="item flex-ac-jc-dc">
            <span class="iconfont icon-drap" v-show="curCorrectWay !== 'down'" @click="clickCorrectBtn('down')"></span>
            <span class="iconfont icon-pause" v-show="curCorrectWay === 'down'" @click="clickCorrectBtn('pause')"></span>
            <span class="txt">{{ curCorrectWay === "down" ? "暂停" : "向下" }}</span>
          </div>
        </div>
        <div class="pop-bot flex-ac-jb">
          <span @click="onHidePop">取消</span>
          <span class="confirm" @click="clickConfirm">确定</span>
        </div>
      </div>
    </div>
    <transition name="toast-show">
      <div class="toast flex-ac-jc" v-show="showToast" @touchmove.stop="onToastToggle(false)">
        <span class="iconfont icon-check"></span>
        <span class="txt">{{ toastModalText }}</span>
      </div>
    </transition>
    <Modal v-model="resetModal" title="温馨提示" okText="确认" @on-cancel="cacelReset" @on-ok="handleReset" content="您确定删除所有限位点吗？"></Modal>
    <Modal v-model="timeoutModal" title="温馨提示" type="one" @on-ok="handleReset" content="设置超时，请点击确认按钮重新设置">确认</Modal>
  </div>
</template>
<script>
import CRoll from "../components/c-roll.vue";
import TitleBar from "../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import { mapGetters, mapMutations } from "vuex";
import { endpointControlRep } from "../../../api/request";
import loadingSvg from "../components/loading-svg.vue";
export default {
  name: "correct",
  data() {
    return {
      resetModal: false,
      popModal: false,
      showToast: false,
      curPositionText: "上限位",
      curPosition: -1,
      curCorrectWay: "",
      isSetLoading: false,
      toastModalText: "设置成功",
      isFromTypeChoose: false,
      settingTimer: null,
      timeoutModal: false,
    };
  },
  methods: {
    ...mapMutations(["setCurtainMaxMinPoint", "setCurtainRunWay"]),
    goback() {
      let pageIdx = this.isFromTypeChoose ? -2 : -1;
      this.$router.go(pageIdx);
    },
    clickReset() {
      if (this.isSetLoading || (!this.isSetMax && !this.isSetMin)) return;
      this.resetModal = true;
      this.curPosition = 2;
    },
    cacelReset() {
      this.resetModal = false;
    },
    clickShowPop(type) {
      if ((type === 0 && this.isSetMax) || (type === 1 && this.isSetMin)) {
        this.$Toast.show({ title: "请先重置限位再进行修改", postion: "middle" });
        return;
      }
      if (this.isSetLoading) return;
      this.curPosition = type;
      this.curPositionText = type === 0 ? "上限位" : "下限位";
      this.popModal = true;
    },
    onHidePop(needStop = true) {
      this.popModal = false;
      if (this.curCorrectWay !== "") {
        needStop && this.handlePause();
        this.curCorrectWay = "";
      }
    },
    clickConfirm() {
      this.onHidePop(false);
      this.handleSetPoint();
    },
    // 设置成功后的toast
    onToastToggle(isShow, type) {
      if (!isShow) {
        this.showToast = false;
        return;
      }
      this.curPosition = -1;
      if (type < 0) return;
      this.toastModalText = type === 0 ? "上限位设置成功" : type === 1 ? "下限位设置成功" : type === 2 ? "重置成功" : type === 3 ? "电机已反转" : "设置成功";
      this.showToast = true;
      let timer = setTimeout(() => {
        this.showToast = false;
        timer && clearTimeout(timer);
      }, 1500);
    },
    handleSetTimer() {
      this.settingTimer && clearTimeout(this.settingTimer);
      this.settingTimer = setTimeout(() => {
        this.timeoutModal = true;
      }, 10000);
    },
    // 点击校准弹窗上下暂停按钮
    clickCorrectBtn(way) {
      this.curCorrectWay = way;
      if (way === "pause") {
        this.curCorrectWay = "";
        return this.handlePause();
      }
      let params = {};
      if (this.getCurtainRunWay === 0) {
        params = {
          cmdKey: way === "up" ? "windowCoveringUp" : way === "down" ? "windowCoveringDown" : "windowCoveringStop",
          endpointId: this.globalDataId,
        };
      } else {
        params = {
          cmdKey: way === "up" ? "windowCoveringDown" : way === "down" ? "windowCoveringUp" : "windowCoveringStop",
          endpointId: this.globalDataId,
        };
      }

      endpointControlRep(params);
    },
    async handlePause() {
      return await endpointControlRep({ cmdKey: "windowCoveringStop", endpointId: this.globalDataId });
    },
    async handleRever() {
      let k = this.getCurtainRunWay === 0 ? "windowCoveringDirectionReversed" : "windowCoveringDirectionNormal";
      let v = this.getCurtainRunWay === 0 ? 1 : 0;
      let result = await endpointControlRep({ cmdKey: k, endpointId: this.globalDataId });
      if (result && !result.error) {
        this.onToastToggle(true, 3);
        this.setCurtainRunWay(v);
      } else {
        let msg = (result && result.error && result.error.msg) || "切换失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    // 重置点位
    async handleReset() {
      this.resetModal = false;
      this.isSetLoading = true;
      this.curPosition = 2;
      let params = {
        cmdKey: "roll_curtains_set_attr",
        endpointId: this.globalDataId,
        cmdValue1: 4,
      };
      let result = await endpointControlRep(params);
      if (result && !result.error) {
        setTimeout(() => {
          this.isSetLoading = false;
          this.setCurtainMaxMinPoint(0b0000);
        }, 1000);
      } else {
        this.isSetLoading = false;
        let msg = (result && result.error && result.error.msg) || "删除失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    // 设置上下限位
    async handleSetPoint() {
      let params = {
        cmdKey: "roll_curtains_set_attr",
        endpointId: this.globalDataId,
        cmdValue1: this.curPosition === 0 ? 2 : 3,
      };
      this.isSetLoading = true;
      let result = await endpointControlRep(params);
      if (result && !result.error) {
        this.handleSetTimer();
        // this.onToastToggle(true, this.curPosition);
        this.setCurtainMaxMinPoint(this.curPosition === 0 ? this.getCurtainMaxMinPoint | 0b0001 : this.getCurtainMaxMinPoint | 0b0010);
      } else {
        let msg = (result && result.error && result.error.msg) || "设置失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
  },
  mounted() {
    this.isFromTypeChoose = this.$route.query.isFromTypeChoose;
  },
  beforeDestroy() {
    this.settingTimer && clearTimeout(this.settingTimer);
  },
  deactivated() {
    this.settingTimer && clearTimeout(this.settingTimer);
  },
  computed: {
    ...mapGetters(["getCurtainMaxMinPoint", "globalDataId", "getCurtainRunWay"]),
    isSetMax() {
      return this.getCurtainMaxMinPoint & 0b0001;
    },
    isSetMin() {
      return this.getCurtainMaxMinPoint & 0b0010;
    },
  },
  watch: {
    getCurtainMaxMinPoint(newV, oldV) {
      if (this.isSetLoading && this.curPosition >= 0) {
        this.isSetLoading = false;
        this.onToastToggle(true, this.curPosition);
        this.settingTimer && clearTimeout(this.settingTimer);
        if (newV === 0b0011) {
          this.goback();
        }
      }
    },
  },
  components: {
    TitleBar,
    CRoll,
    Modal,
    loadingSvg,
  },
};
</script>
<style lang="less" scoped>
.correct {
  flex-direction: column;
  background: #fbfbfc;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-weight: 400;
  .disable {
    opacity: 0.3;
  }
  .rever-btn {
    font-size: 30px;
    font-weight: bold;
    color: #4289ff;
  }
  .main {
    height: calc(100% - 88px);
    flex-direction: column;
    box-sizing: border-box;
    padding: 34px 40px 40px;
    overflow: hidden;
    .tips {
      font-size: 24px;
      color: #5e5e83;
      text-align: center;
      line-height: 1.5;
    }
    .center {
      box-sizing: border-box;
      padding: 0 36px;
      .btn {
        width: 290px;
        height: 96px;
        background: #ffffff;
        box-shadow: 0px 10px 40px 0px rgba(18, 18, 18, 0.15);
        border-radius: 10px;
        text-align: center;
        line-height: 96px;
        font-size: 32px;
        font-weight: 400;
        color: #5e5e83;
        &:active {
          box-shadow: 0px 0px 20px 0px rgba(18, 18, 18, 0.15);
        }
        &.active {
          border: 1px solid #6165c5;
          box-shadow: none;
          color: #6165c5;
        }
      }
      .c-roll {
        height: 628px;
        margin: 36px 0;
      }
    }
    .bot {
      width: 100%;
      height: 104px;
      border-radius: 52px;
      background-color: #6165c5;
      text-align: center;
      line-height: 104px;
      font-size: 32px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 2px;
    }
  }
  .pop-modal {
    position: absolute;
    bottom: -120%;
    left: 0;
    right: 0;
    height: 600px;
    &.show {
      bottom: 0;
    }
    &.hide {
      transition: none 0;
      transition-delay: 0.2s;
    }
    .mask {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .pop-main {
      position: relative;
      z-index: 12;
      height: 600px;
      border-top-right-radius: 20px;
      border-top-left-radius: 20px;
      transition: all 0.2s ease-in-out;
      background-color: #fff;
      flex-direction: column;
      top: 100%;
      &.show {
        top: 0;
      }
    }
    .pop-title {
      height: 150px;
      line-height: 150px;
      text-align: center;
      box-sizing: border-box;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 32px;
      font-weight: bold;
      color: #2f2f4a;
      flex: 0 0 150px;
    }
    .btn-area {
      width: 100%;
      box-sizing: border-box;
      padding: 0 160px;
      .iconfont {
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        border: 1px solid #5e5e83;
        border-radius: 50%;
        color: #5e5e83;
        font-size: 50px;
        margin-bottom: 18px;
        &:active {
          background-color: rgba(0, 0, 0, 0.05);
        }
        &.icon-pause {
          background-color: #6165c5;
          color: #fff;
          border-color: #6165c5;
        }
      }
      .up {
        transform: rotate(180deg);
      }
      .txt {
        font-size: 32px;
        color: #5e5e83;
      }
    }
    .pop-bot {
      height: 130px;
      flex: 0 0 130px;
      line-height: 130px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      > span {
        font-size: 32px;
        color: #999999;
        flex: 1;
        text-align: center;
        &:active {
          background-color: rgba(0, 0, 0, 0.03);
        }
        &.confirm {
          font-size: 32px;
          font-weight: bold;
          color: #4289ff;
          position: relative;
          &::after {
            position: absolute;
            left: 0;
            top: 30%;
            bottom: 30%;
            border-left: 1px solid rgba(0, 0, 0, 0.05);
            content: " ";
          }
        }
      }
    }
  }
  .toast {
    width: 710px;
    height: 128px;
    background-color: #fff;
    box-shadow: 0px 10px 20px 0px rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 10px;
    left: 20px;
    .icon-check {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      color: #fff;
      background-color: #6165c5;
      text-align: center;
      line-height: 46px;
      font-size: 28px;
      margin-right: 16px;
    }
    .txt {
      font-size: 34px;
      color: #0d0d0d;
    }
  }
  .loading-btn-wrap {
    width: 66px;
    height: 66px;
    flex: 0 0 66px;
    margin-right: 10px;
  }
}

.toast-show-enter-active {
  transition: all 0.3s ease;
}
.toast-show-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.toast-show-enter,
.toast-show-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
