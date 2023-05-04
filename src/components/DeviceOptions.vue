<template>
  <div class="device-options" :class="{ active: showAnimation }">
    <transition name="opt-slide-two">
      <div class="options-normal" v-if="showAnimation">
        <p class="title">常规</p>
        <div class="cell" @click="clickCell('deviceName')">
          <div class="left">设备名称</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.deviceName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goDeviceRoom">
          <div class="left">设备房间</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.goalDeviceRoomName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <!-- <div class="cell">
          <div class="left">添加到常用设备</div>
          <div class="right">
            <i-switch @onClickSwitch="onClickSwitch" :status="switchStatus" />
          </div>
        </div>-->
        <div class="cell" @click="goFeedback">
          <div class="left">问题反馈</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-three">
      <div class="options-info" v-if="showAnimation">
        <p class="title">信息</p>
        <div class="cell"  v-if="addnum" @click="linkrouter">
          <div class="left">型号</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.deviceTypeCode }}</span>
          </div>
        </div>
        <div class="cell"  v-else>
          <div class="left">型号</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.deviceTypeCode }}</span>
          </div>
        </div>

        <div class="cell">
          <div class="left">MAC地址</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.deviceMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">所属网关MAC地址</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.parentMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">SN码</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.snCode || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">UDID</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.bindUdid || "-" }}</span>
          </div>
        </div>
        <!-- <div class="cell" @click="goSignal">
          <div class="left">信号强度</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div> -->
        <div class="cell" @click="goVersion">
          <div class="left" :class="{ active: deviceDetail.hasNewVersion }">软件版本</div>
          <div class="right">
            <span class="tips">V{{ deviceDetail.softVersion }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-four">
      <div class="del-btn" v-if="showAnimation" @click="clickDel">删除设备</div>
    </transition>
    <div class="device-name-modal" @touchmove.stop.prevent @click.stop="forceFocus" v-show="nameModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click.stop="clickCancel">取消</span>
          <span class="name">修改设备名称</span>
          <span class="comfirm" @click.stop="onComfirm">确定</span>
        </div>
        <div style="position:relative">
          <input class="input-area" ref="inputArea" v-model="deviceName" :maxlength="20" autofocus type="text" />
          <span class="iconfont icon-close" v-show="deviceName" @click="deviceName = ''"></span>
        </div>
        <div class="tips">
          <span>支持中/英文/数字/符号</span>
          <span>{{ (deviceName && deviceName.length) || 0 }}/20</span>
        </div>
      </div>
    </div>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="delModal" title="删除设备" content="设备删除后将从您的家庭中移除，确定要删除吗" @on-ok="onDel" />
  </div>
</template>
<script>
// import iSwitch from "./switch";
import { deviceInfoUpdRep, deviceDelRep } from "../api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "../components/modals/modal/Modal";
import { execNativeFunc } from "../utils/bridge";
import { emojiReg } from "../utils/reg";
export default {
  name: "DeviceOptions",
  props: {
    isShow: {
      type: Boolean
    },
    addnum:{
      type:Boolean,
      default:false,
    }
  },
  data() {
    return {
      showAnimation: false,
      switchStatus: false,
      nameModal: false,
      deviceName: "",
      delModal: false,
      deviceDisableModal: false,
      deviceDisableContent: "",
      num:0,
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify"]),
    // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return false;
      if (num === 1 || num === 5) return true;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
      return false;
    },
    goDeviceRoom() {
      this.$router.push({ name: "DeviceRoom", query: { slideWay: "left" } });
    },
    goVersion() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    linkrouter(){
      this.num ++ 
      if(this.num === 5){
         this.$router.push({ name: "calibration", query: { slideWay: "left" } });
      }
      if(this.num > 5){
        this.num = 0
      }
    },
    goSignal() {
      if (!this._showOfflineModal()) return;
      this.$router.push({ name: "SignalTest", query: { slideWay: "left" } });
    },
    goFeedback() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 2, data: this.deviceDetail });
    },
    clickDel() {
      this.delModal = true;
    },
    clickChangeName() {
      this.nameModal = true;
      this.deviceName = this.deviceDetail.deviceName;
      this.$nextTick(() => {
        this.forceFocus();
      });
    },
    clickCancel() {
      this.deviceName = this.deviceDetail.deviceName;
      this.nameModal = false;
    },
    onClickSwitch() {
      this.switchStatus = !this.switchStatus;
    },
    clickCell(cellName) {
      if (cellName === "deviceName") {
        this.clickChangeName();
      }
    },
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      this.$refs.inputArea.focus();
    },
    async onComfirm(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      if (emojiReg.test(this.deviceName)) {
        this.$Toast.show({
          title: "设备名称只支持中文、英文、数字、符号",
          postion: "bottom"
        });
        this.forceFocus();
        return;
      }
      if (!this.deviceName) {
        this.$Toast.show({ title: "请输入设备名称", postion: "bottom" });
        this.forceFocus();
        return;
      }
      let { data, error } = await deviceInfoUpdRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
        deviceName: this.deviceName
      });
      if (data && !error) {
        let detail = this.deviceDetail;
        detail.deviceName = this.deviceName;
        this.setDeviceDetail(detail);
        this.clickCancel();
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async onDel() {
      let { data, error } = await deviceDelRep({
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum
      });
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        this.$Toast.show({ title: "操作成功" });
        execNativeFunc("onDataChannel", {
          type: 4,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    }
  },
  mounted() {
    this.showAnimation = this.isShow;
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "globalDeviceStatus"])
  },
  watch: {
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
      }
    }
  },
  components: {
    Modal
  }
};
</script>
<style lang="less" scoped>
.device-options {
  position: fixed;
  left: 0;
  right: 0;
  width: 100vw;
  bottom: 0;
  top: 88px;
  z-index: 9;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 40px 0;
  overflow-x: hidden;
  .options-func,
  .options-normal,
  .options-info {
    width: 100%;
    background: #ffffff;
    border-radius: 16px;
    text-align: left;
    margin-bottom: 40px;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
    .title {
      font-size: 28px;
      color: #5e5e83;
      padding-left: 52px;
      height: 70px;
      line-height: 70px;
    }
    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 128px;
      width: 100%;
      box-sizing: border-box;
      padding: 0 40px 0 52px;
      position: relative;
      &::after {
        position: absolute;
        bottom: 0;
        left: 52px;
        right: 0;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border-bottom: none;
        }
      }
      .left {
        font-size: 32px;
        font-weight: bold;
        color: #000000;
        position: relative;
        &.active {
          &::after {
            position: absolute;
            right: -12px;
            top: 4px;
            content: " ";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #d80200;
          }
        }
      }
      .right {
        flex: 1;
        overflow: hidden;
        display: flex;
        justify-content: flex-end;
        .tips {
          line-height: 1;
          color: #797979;
          width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
          &.name {
            max-width: 360px;
          }
        }
        .icon-right {
          font-size: 28px;
          margin-left: 10px;
          color: #d8d8d8;
        }
      }
    }
  }
  .del-btn {
    width: 490px;
    height: 104px;
    line-height: 104px;
    background: #ffffff;
    border-radius: 52px;
    text-align: center;
    font-size: 32px;
    font-weight: 400;
    color: #ff453a;
  }
  .device-name-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }
    .main {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      height: 360px;
      background: #fff;
      border-top-left-radius: 50px;
      border-top-right-radius: 50px;
      box-sizing: border-box;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .input-area {
        width: 100%;
        height: 112px;
        background-color: #f1f1f1;
        font-size: 32px;
        color: #121212;
        line-height: 112px;
        border: none;
        outline: none;
        border-radius: 16px;
        padding: 0 80px 0 40px;
        box-sizing: border-box;
      }
      .tips {
        width: 100%;
        color: #959495;
        font-size: 26px;
        font-weight: 400;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 30px;
        font-weight: bold;
        color: #959495;
        .name {
          font-size: 32px;
          color: #121212;
        }
        .comfirm {
          color: #4289ff;
        }
      }
    }
    .icon-close {
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: rgba(0, 0, 0, 0.5);
    }
  }
}

.opt-slide-enter-active {
  animation: bounce-in 0.4s linear -0.18s;
}
.opt-slide-two-enter-active {
  animation: bounce-in 0.4s linear -0.15s;
}
.opt-slide-three-enter-active {
  animation: bounce-in 0.4s linear -0.12s;
}
.opt-slide-four-enter-active {
  animation: bounce-in 0.4s linear -0.09s;
}
@keyframes bounce-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  70% {
    transform: translateX(0%);
  }
  80% {
    transform: translateX(-5%);
  }
  90% {
    transform: translateX(0%);
  }
  100% {
    opacity: 1;
  }
}
</style>
