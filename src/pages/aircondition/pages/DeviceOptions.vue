<template>
  <div class="device-options" :class="{ active: showAnimation }">
    <transition name="opt-slide">
      <div class="options-normal" v-if="showAnimation">
        <p class="title">功能</p>
        <div class="cell" v-if="isShowChildMode">
          <div class="left">儿童模式</div>
          <div class="right mixed">
            <span class="tips">设定温度在25℃以上</span>
            <i-switch @onClickSwitch="onChangeChildMode" v-model="switchStatus" />
          </div>
        </div>
        <div class="cell" @click="clickCell('countdown')">
          <div class="left">倒计时</div>
          <div class="right">
            <span class="tips">{{ countDownTime }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-two">
      <div class="options-normal" v-if="showAnimation">
        <p class="title">常规</p>
        <div class="cell" @click="clickCell('deviceName')">
          <div class="left">设备名称</div>
          <div class="right limited">
            <span class="tips name">{{ deviceDetail.deviceName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goDeviceRoom">
          <div class="left">设备房间</div>
          <div class="right limited">
            <span class="tips name">{{ deviceDetail.goalDeviceRoomName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goScenePage">
          <div class="left">场景</div>
          <div class="right" v-if="deviceDetail.ownedCount > 0">
            <span class="tips">{{ deviceDetail.ownedCount }}个</span>
            <span class="iconfont icon-right"></span>
          </div>
          <div class="right" v-else>
            <span class="tips">无</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">添加到常用设备</div>
          <div class="right">
            <i-switch @onClickSwitch="clickUsually" v-model="isUsually" />
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-three">
      <div class="options-info" v-if="showAnimation">
        <p class="title">信息</p>
        <div class="cell">
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
        <!-- 存在UDID才显示 -->
        <div class="cell">
          <div class="left">UDID</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.bindUdid || "-" }}</span>
          </div>
        </div>
        <!-- <div class="cell" @click="signalTest">
          <div class="left">信号强度</div>
          <div class="right">
            <span class="tips">--</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div> -->

        <div class="cell" @click="goVersion">
          <div class="left" :class="{ active: deviceDetail.hasNewVersion }">
            软件版本
          </div>
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
        <div style="position: relative">
          <input class="input-area" ref="inputArea" v-model="deviceName" :maxlength="20" autofocus type="text" />
          <span class="iconfont icon-close" v-show="deviceName" @click="deviceName = ''"></span>
        </div>
        <div class="tips">
          <span>支持中/英文/数字/符号</span>
          <span>{{ (deviceName && deviceName.length) || 0 }}/20</span>
        </div>
      </div>
    </div>

    <transition name="countdown">
      <div class="countdown-modal" ref="countdown" @touchmove.stop.prevent @click.stop="forceFocus" v-show="countdownModal">
        <div class="mask" @click="clickOption('cancel-all')"></div>
        <!-- 倒计时方式 -->

        <transition name="options-ani">
          <div class="options-box" v-show="isShowOption">
            <div class="options">
              <div class="option-text first-option" @click="clickOption('countdown')">
                倒计时关机
              </div>
              <div class="border"></div>
              <div class="option-text last-option" @click="clickOption('fixedTime')">
                定时关机
              </div>
            </div>
            <div class="cancel" @click="clickOption('cancel')">取消</div>
          </div>
        </transition>

        <transition name="timer-ani">
          <!-- 倒计时设定 -->
          <timer-picker v-show="isShowCountdown" v-model="isShowCountdown" hourDesc="小时" minuteDesc="分钟" @on-cancel="onCountdownCancel" @on-confirm="onCountdownChange"></timer-picker>
        </transition>
        <transition name="timer-ani">
          <!-- 定时关机 -->
          <timer-picker @on-cancel="onCountdownCancel" :initHour="initHour" :initMinute="initMinute" @on-confirm="onFixedChange" v-model="isShowFixedTime" v-show="isShowFixedTime"></timer-picker>
        </transition>
      </div>
    </transition>

    <Modal v-model="delModal" title="删除设备" content="设备删除后将从您的家庭中移除，确定要删除吗" @on-ok="onDel" />
    <Modal v-model="reCountdownModal" title="倒计时" content="您已开启空调倒计时，确定要现在关闭吗？" @on-ok="onRemove" />
  </div>
</template>
<script>
import iSwitch from "@/components/switch";
import { deviceInfoUpdRep, deviceDelRep, endpointControlRep, addUsuallyRep, deviceSetTimeCloseRep, deviceRemoveTimeCloseRep, removeUsuallyRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "@/components/modals/modal/Modal";
import { execNativeFunc } from "@/utils/bridge";
import { emojiReg } from "@/utils/reg";
import TimerPicker from "@/components/TimerPicker";
import { deviceZigbeeType } from "@/utils/index";
import { CONFIG } from "../const";
import { CMD_KEY, CMD_KEY_VRV2 } from "../cmdkey";
import { isNumber } from "../../../utils/socketUtil";
export default {
  name: "DeviceOptionsAirCondition",
  components: {
    Modal,
    iSwitch,
    TimerPicker
  },
  props: {
    isShow: {
      type: Boolean
    },
    isTurnOn: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowChildMode: false,
      showAnimation: false,
      switchStatus: false,
      isUsually: false,
      nameModal: false,
      countdownModal: false,
      isShowOption: false,
      isShowCountdown: false,
      isShowFixedTime: false,
      initHour: 22,
      initMinute: 15,
      deviceName: "",
      delModal: false,
      reCountdownModal: false,
      switchTimer: 0,
      deviceZigbeeType: deviceZigbeeType
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setAirDuration", "setAirTimer"]),
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
    goFeedback() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 2, data: this.deviceDetail });
    },
    goScenePage() {
      if (this.deviceDetail.ownedCount <= 0) return;
      this.$router.push({ name: "ScenePage", query: { slideWay: "left" } });
    },
    clickDel() {
      this.delModal = true;
    },
    closeCountdownModal() {
      this.isShowCountdown = false;
      this.isShowFixedTime = false;
      this.isShowOption = false;
      this.countdownModal = false;
    },
    onCountdownCancel() {
      this.closeCountdownModal();
    },
    onCountdownChange(data) {
      // console.log(data);
      this.closeCountdownModal();
      if (data.hour == 0 && data.minute == 0) {
        return;
      }
      const hours = data.hour + new Date().getHours();
      const minutes = data.minute + new Date().getMinutes();
      this.setTimeClose(hours * 60 + minutes);
    },
    onFixedChange(data) {

      const curHour = new Date().getHours();
      const curMinute = new Date().getMinutes();
      this.closeCountdownModal();
      if (data.hour == curHour && data.minute == curMinute) {
        return;
      }
      if (data.hour < curHour || (data.hour == curHour && data.minute < curMinute)) {
        data.hour += 24;
      }
      const closeTime = data.hour * 60 + data.minute;
      this.setTimeClose(closeTime);
    },
    clickChangeName() {
      this.nameModal = true;
      this.deviceName = this.deviceDetail.deviceName;
      this.$nextTick(() => {
        this.forceFocus();
      });
    },
    setCountdown() {
      this.countdownModal = true;
      this.isShowOption = true;
    },
    clickOption(optionName) {
      if (optionName == "cancel-all") {
        this.closeCountdownModal();
      }
      if (optionName == "cancel") {
        this.isShowOption = false;
        this.countdownModal = false;
      } else {
        this.isShowOption = false;
        if (optionName == "countdown") {
          this.isShowCountdown = true;
        } else if (optionName == "fixedTime") {
          this.initMinute = new Date().getMinutes() + 0;
          if (this.initMinute >= 60) {
            this.initMinute %= 60;
            this.initHour = (new Date().getHours() + 1) % 24;
          } else {
            this.initHour = new Date().getHours();
          }
          this.isShowFixedTime = true;
        }
      }
    },
    // 设备强度
    signalTest() {
      if (!this.isOnline || !this.isTurnOn) {
        this.$emit("onError");
        return;
      }
      this.$router.push({
        name: "SignalTest",
        query: { slideWay: "left" }
      });
      // todo
    },
    clickCancel() {
      this.deviceName = this.deviceDetail.deviceName;
      this.nameModal = false;
    },
    async onChangeChildMode() {
      if (!this.isOnline) {
        this.$emit("onError");
        this.switchStatus = !this.switchStatus;
        return;
      }
      if (deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] !== deviceZigbeeType.VRV2 && !this.isTurnOn) {
        this.$emit("onError");
        this.switchStatus = !this.switchStatus;
        return;
      }
      if (this.switchTimer) return;
      let params = {};
      if (deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] !== deviceZigbeeType.VRV2) {
        params = {
          endpointId: this.globalDataId,
          cmdKey: this.switchStatus ? CMD_KEY.OPEN_CHILD_MODE : CMD_KEY.CLOSE_CHILD_MODE
        };
      } else {
        params = {
          endpointId: this.globalDataId,
          cmdKey: CMD_KEY_VRV2.SET_CHILD_MODE,
          cmdValue1: ~~this.switchStatus
        };
      }
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.switchTimer = setTimeout(() => {
          clearTimeout(this.switchTimer);
          this.switchTimer = 0;
        }, 300);
        this.$emit("onChildModeChange", this.switchStatus, !this.switchStatus);
      } else {
        this.switchStatus = !this.switchStatus;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    clickCell(cellName) {
      if (cellName === "deviceName") {
        this.clickChangeName();
      } else if (cellName === "countdown") {
        if (!this.isOnline || !this.isTurnOn) {
          this.$emit("onError");
          return;
        }
        if (this.getAirDuration > 0) {
          this.reCountdownModal = true;
        } else {
          this.setCountdown();
        }
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
      if (!this.deviceName || this.deviceName.length > 20) {
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
        // this.setDeviceDataModify(true);
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
    clickUsually() {
      if (this.isUsually) {
        this.addToUsually();
      } else {
        this.removeUsually();
      }
    },
    async removeUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device"
      };
      let { data, error } = await removeUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = false;
        execNativeFunc("onDataChannel", { type: 0 });
        this.setDeviceDetail(data);
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    async addToUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device"
      };
      let { data, error } = await addUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = true;
        this.setDeviceDetail(data);
        execNativeFunc("onDataChannel", { type: 0 });
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
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
    },
    async onRemove() {
      let { data, error } = await deviceRemoveTimeCloseRep({
        endpointId: ~~this.deviceDetail.dataId
      });
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        this.$emit("onAlarmCancel");
      }
    },
    async setTimeClose(closeTimeMinutes) {
      let params = {
        endpointId: this.deviceDetail.dataId,
        closeTimeMinutes
      };
      if (this.deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] === deviceZigbeeType.VRV2) {
        params.cmdKey = "vrv2_close";
      }
      let { data, error } = await deviceSetTimeCloseRep(params);
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        const { countDownTime, closeTime, cloudTime } = data.data;
        this.$emit("onAlarmSet", { countDownTime, closeTime, cloudTime });
      }
    }
  },
  created() {
    this.isShowChildMode = CONFIG.isSupportChildMode.includes(this.deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]);
  },
  mounted() {
    this.showAnimation = this.isShow;
    this.switchStatus = this.childMode;
    this.isUsually = this.deviceDetail.ifMostUsed;
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "childMode", "getAirDuration", "getAirTimer"]),
    countDownTime() {
      if (this.getAirDuration > 0) {
        const countDownTime = this.getAirDuration / 1000;
        return `${Math.floor(countDownTime / 60 / 60)
          .toString()
          .padStart(2, "0")}小时${(Math.ceil((countDownTime / 60) % 60) - 1).toString().padStart(2, "0")}分钟后关机`;
      }
      return "选择倒计时方式";
    }
  },
  watch: {
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;

        this.isUsually = this.deviceDetail.ifMostUsed;
        this.$nextTick(() => {
          this.switchStatus = this.childMode;
        });
      }
    },
    childMode() {
      this.switchStatus = this.childMode;
    },
    isShow() {
      this.showAnimation = this.isShow;
      this.showCountdown();
    }
  }
};
</script>
<style lang="less" scoped>
@import "../../../common/css/device-option.less";
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.35s;
}
.countdown-enter, .countdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.countdown-modal {
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

  .options-box {
    position: absolute;
    z-index: 2;
    left: 0;
    right: 0;
    bottom: 0;
    border-top-left-radius: 50px;
    border-top-right-radius: 50px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .options {
      height: 234px;
      border-radius: 16px;
      background: #ffffff;
      width: 100%;
      flex-direction: column;
      align-items: center;
      display: flex;
      margin-bottom: 16px;
      justify-content: space-evenly;
      .border {
        width: 100%;
        height: 2px;
        background: rgba(17, 17, 17, 0.5);
        opacity: 0.5;
      }
      .option-text {
        padding: 16px;
        min-width: 30vw;
        white-space: nowrap;
        text-align: center;
        height: 45px;
        font-size: 32px;

        font-weight: 400;
        color: #4289ff;
        line-height: 45px;
      }
    }
    .cancel {
      height: 117px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
