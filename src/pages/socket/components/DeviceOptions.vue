<template>
  <div class="device-options" :class="{ active: showAnimation }">
    <transition name="opt-slide">
      <div class="options-normal" v-if="showAnimation">
        <p class="title">功能</p>
        <!-- <div class="cell" @click="clickCell('countdown')">
          <div class="left">定时关闭</div>
          <div class="right">
            <span class="tips">{{ offDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div> -->

        <div class="cell" @click="clickCell('timing')">
          <div class="left">定时</div>
          <div class="right">
            <span class="tips">{{ getSocketTimingDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="clickCell('countdown')">
          <div class="left">倒计时</div>
          <div class="right">
            <span class="tips">{{ offDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <div class="cell" @click="clickCell('preoff')" v-if="deviceDetail.typeCode === 'LS10'">
          <div class="left">按键预约关闭</div>
          <div class="right">
            <span class="tips">{{ preOffDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <div class="cell" @click="clickCell('effect')">
          <div class="left">效果灯</div>
          <div class="right">
            <span class="tips">{{ effectDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <!-- <div class="cell" @click="goSignal">
          <div class="left">信号强度</div>
          <div class="right">
            <span class="tips"></span>
            <span class="iconfont icon-right"></span>
          </div>
        </div> -->
      </div>
    </transition>
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
        <div class="cell">
          <div class="left">UDID</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.bindUdid || "-" }}</span>
          </div>
        </div>
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
          <timer-picker v-show="isShowCountdown" hourDesc="小时" minuteDesc="分钟" @on-cancel="onCountdownCancel" @on-confirm="onCountdownChange"></timer-picker>
        </transition>
        <transition name="timer-ani">
          <!-- 定时关机 -->
          <timer-picker @on-cancel="onCountdownCancel" :initHour="initHour" :initMinute="initMinute" @on-confirm="onFixedChange" v-show="isShowFixedTime"></timer-picker>
        </transition>
      </div>
    </transition>
    <Modal v-transclude="'#socket'" v-model="delModal" title="删除设备" content="设备删除后将从您的家庭中移除，确定要删除吗" @on-ok="onDel" />
    <Modal v-transclude="'#socket'" v-model="reCountdownModal" title="温馨提示" :content="cancelCountDownContent" @on-ok="onRemoveTimer" />
  </div>
</template>
<script>
import iSwitch from "@/components/switch";
import {
  deviceInfoUpdRep,
  deviceDelRep,
  CreateDeviceScheduleTaskRep,
  DisabledDeviceScheduleTaskRep,
  addUsuallyRep,
  removeUsuallyRep
} from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "@/components/modals/modal/Modal";
import TimerPicker from "@/components/TimerPicker";
import { execNativeFunc } from "@/utils/bridge";
import { emojiReg } from "@/utils/reg";
export default {
  name: "DeviceOptionsSocket",
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
      showAnimation: false,
      isShowChildMode: true,
      isUsually: false,
      nameModal: false,
      countdownModal: false,
      reCountdownModal: false,
      currentCellName: "",
      countDownTime: "",
      isShowOption: false,
      isShowCountdown: false,
      isShowFixedTime: false,
      initHour: 22,
      alarmTimer: 0,
      initMinute: 15,
      deviceName: "",
      cancelCountDownContent: "",
      delModal: false,
      isEffectLight: false
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify"]),
    goDeviceRoom() {
      this.$router.push({ name: "DeviceRoom", query: { slideWay: "left" } });
    },
    goSignal() {
      if (!this.isOnline || !this.isTurnOn) {
        this.$emit("onError");
        return;
      }
      this.$router.push({ name: "SignalTest", query: { slideWay: "left" } });
    },
    goEffectSetting() {
      this.$router.push({
        name: "EffectLightSetting",
        query: { slideWay: "left" }
      });
    },
    goPreOffSetting() {
      this.$router.push({ name: "PreOffSetting", query: { slideWay: "left" } });
    },
    goScenePage() {
      if (this.deviceDetail.ownedCount <= 0) return;
      this.$router.push({ name: "ScenePage", query: { slideWay: "left" } });
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
    closeCountdownModal() {
      this.isShowCountdown = false;
      this.isShowFixedTime = false;
      this.isShowOption = false;
      this.countdownModal = false;
    },
    clickCell(cellName) {
      if (cellName === "deviceName") {
        this.clickChangeName();
      } else if (cellName === "timing") {
        this.currentCellName = "timing";
        if (!this.isOnline) {
          this.$emit("onError");
          return;
        }
        this.$router.push({ name: "TimingSettingList", query: { slideWay: "left" } });
        return;
      } else if (cellName === "countdown") {
        
        this.currentCellName = "countdown";
        if (!this.isOnline) {
          this.$emit("onError");
          return;
        }
        if (this.getSocketCountdownCloseTime > 0) {
          this.cancelCountDownContent = `当前插座正在执行倒计时${this.countdownType}任务，确定要终止吗？`;
          this.reCountdownModal = true;
        } else {
          this.$router.push({ name: "CDSetting", query: { slideWay: "left" } });
        }

        return;
      } else if (cellName === "preoff") {
        this.currentCellName = "preoff";
        if (!this.isOnline || !this.isTurnOn) {
          this.$emit("onError");
          return;
        }
        if (this.getSocketPreOffCloseTime > 0) {
          this.cancelCountDownContent = "当前插座正在执行按键预约关闭任务，确定要终止吗？";
          this.reCountdownModal = true;
        } else {
          this.goPreOffSetting();
        }
      } else if (cellName === "effect") {
        if (!this.isOnline || !this.isTurnOn) {
          this.$emit("onError");
          return;
        }
        this.goEffectSetting();
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
    changeChildMode() {},
    setCountdown() {
      this.countdownModal = true;
      this.isShowOption = true;
    },
    onCountdownCancel() {
      this.closeCountdownModal();
    },
    onCountdownChange(data) {
      const hours = data.hour;
      const minutes = data.minute;
      this.setTimeClose(hours * 60 + minutes);
      this.closeCountdownModal();
    },
    onFixedChange(data) {
      const curHour = new Date().getHours();
      const curMinute = new Date().getMinutes();
      if (data.hour < curHour || (data.hour == curHour && data.minute < curMinute)) {
        data.hour += 24;
      }
      const closeTime = (data.hour - curHour) * 60 + data.minute - curMinute;
      this.setTimeClose(closeTime);
      this.closeCountdownModal();
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
          this.initMinute = new Date().getMinutes() + 15;
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
    clickUsually() {
      if (this.isUsually) {
        this.addToUsually();
      } else {
        this.removeUsually();
      }
    },
    async onRemoveTimer() {
      // 倒计时
      if (this.currentCellName === "countdown") {
        this.onRemoveCountDown();
      } else {
        // 按键预约
        this.onRemovePreOff();
      }
    },
    async onRemoveCountDown() {
      let { error } = await DisabledDeviceScheduleTaskRep({
        id: this.getSocketCountdownTaskId
      });
      if (!error) {
        this.$emit("onRefreshTask");
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async onRemovePreOff() {
      let { error } = await DisabledDeviceScheduleTaskRep({
        id: this.getSocketPreOffTaskId
      });
      if (!error) {
        this.$emit("onRefreshTask");
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async setTimeClose(closeTimeMinutes) {
      this.setCloseTime(closeTimeMinutes);
      let { error } = await CreateDeviceScheduleTaskRep({
        endpointId: this.globalDataId,
        minutes: closeTimeMinutes,
        taskName: "插座" + this.globalDataId,
        taskTypeEnum: "off"
      });
      if (error) {
        this.setCloseTime(0);
        this.$Toast.show({ title: error.msg });
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
        execNativeFunc("onDataChannel", { type: 0 });
        this.setDeviceDetail(data);
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
    transformMinToText(seconds) {
      if (!seconds) return "";
      seconds -= 60;
      if (seconds > 3540) {
        let m = Math.ceil((seconds / 60) % 60);
        let h = Math.floor(seconds / 60 / 60);
        if (m == 60) {
          m = 0;
          h++;
        }
        return `${h}小时${m}分钟`;
      } else {
        return `${Math.ceil((seconds / 60) % 60)}分钟`;
      }
    }
  },
  mounted() {
    this.showAnimation = this.isShow;
    this.isUsually = this.deviceDetail.ifMostUsed;
  },
  computed: {
    ...mapGetters([
      "deviceDetail",
      "globalDataId",  
    ]),
    ...mapGetters({
      getSocketPreOffMinutes: "schedule/getPreOffMinutes", 
      getSocketEffectLight: "schedule/getEffectLight", 
      getSocketPreOffCloseTime: "schedule/getPreOffCloseTime", 
      getSocketPreOffTaskId: "schedule/getPreOffTaskId", 
      getSocketCountdownCloseTime: "schedule/getCountdownCloseTime", 
      getSocketCountdownTaskId: "schedule/getCountdownTaskId", 
      getSocketCountdownType: "schedule/getCountdownType", 
      getSocketTimingDesc: "schedule/getTimingDesc",
    } ),
    preOffDesc() {
      if (this.getSocketPreOffMinutes > 0) {
        if (this.getSocketPreOffCloseTime > 0) {
          return `${this.transformMinToText(this.getSocketPreOffCloseTime)}后`;
        } else {
          return `已设置${this.transformMinToText((this.getSocketPreOffMinutes + 1) * 60)}`;
        }
      } else {
        return "去设置";
      }
    },
    offDesc() {
      if (this.getSocketCountdownCloseTime > 0) {
        return `${this.transformMinToText(this.getSocketCountdownCloseTime)}后 ${this.countdownType }`;
      } else {
        return "";
      }
    },
    effectDesc() {
      return this.getSocketEffectLight ? "开启" : "关闭";
    },
    countdownType() {
      return this.getSocketCountdownType === 'on' ? '开启': '关闭'
    }
  },
  watch: {
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
        this.isUsually = this.deviceDetail.ifMostUsed;
      }
    },
    isShow() {
      this.showAnimation = this.isShow;
    }
  }
};
</script>
<style lang="less" scoped>
@import "../../../common/css/device-option.less";
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
    transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
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
        text-align: center;
        width: 100%;
        height: 45px;
        font-size: 32px;

        font-weight: 400;
        color: #4289ff;
        line-height: 45px;
      }
    }
    .cancel {
      transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
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
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.35s;
}
.countdown-enter, .countdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
