<template>
  <div id="ventilator" :class="{ active: isLightOn }">
    <tool-bar
      :title="deviceDetail.deviceName"
      @goBack="goback"
      :showRight="!!deviceDetail.dataId"
    >
      <template v-slot:options="data">
        <device-options :isShow="data.active"></device-options>
      </template>
    </tool-bar>

    <!-- 空气质量 -->
    <div class="air-wrap">
      <img :src="svgPic" class="air" alt />
      <div class="icon-box">
        <span class="icon icon-leaf"></span>
        <span class="desc">VOC</span>
      </div>
    </div>

    <div class="speed-wrap">
      <div
        class="speed-bg"
        :style="{ 'background-image': `url(${speedObject.bg})` }"
      >
        <div class="speed-box" @click="showModal('speed', $event)">
          <span class="speed-name">{{ speedObject.name }}</span>
          <span :class="['icon', speedObject.icon]"></span>
        </div>
      </div>
    </div> 
    <!-- 空气数据 -->
    <div class="air-data">
      <div class="pm25">
        <img :src="svgs.co2Pic" />
        <div class="data-box">
          <span class="data">{{airData.pm25Value}} ug/m³</span>
          <span class="desc">PM2.5</span>
        </div>
      </div>
      <div class="co2">
        <img :src="svgs.pm25Pic" />
        <div class="data-box">
          <span class="data">{{airData.co2Value}} ppm</span>
          <span class="desc">CO₂含量</span>
        </div>
      </div>
      <div class="temperature">
        <img :src="svgs.temperPic" />
        <div class="data-box">
          <span class="data">{{airData.measureTemprature}}℃ {{airData.measureHumidity}}%</span>
          <span class="desc">温湿度</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="left">
        <div :class="['item', isOnLine && isLightOn ? 'active' : 'offline']">
          <span
            :class="['icon', modeObject.icon]"
            @click="showModal('mode')"
          ></span>
          <span class="name">{{ modeObject.name }}</span>
        </div>
        <div
          :class="[
            'item',
            'center',
            isOnLine && isLightOn ? 'active' : 'offline',
          ]"
        >
          <span
            :class="['icon', 'icon-clock']"
            @click="showModal('countdown', $event)"
          ></span>
          <span class="name" v-if="getCloseTime > 0 && isLightOn">
            <span class="">{{ alarmClock.hour }}</span>
            <span class="name-alarm">:</span>
            <span class="">{{ alarmClock.minute }}</span>
          </span>
          <span class="name" v-else>定时</span>
        </div>
      </div>
      <div
        class="right switch icon-switch"
        :class="{ active: isLightOn && isOnLine }"
        @click="onSwithChange"
      ></div>
    </div>
    <!-- 模式模块 -->
    <div class="mode-panel" ref="modePanel" :class="{ active: ModalShow.mode }">
      <transition name="modal">
      <div
        class="mask"
        @click.stop="hideModal($event, 'mode')"
        v-show="ModalShow.mode"
      ></div>
      </transition>
      <div class="content">
        <div class="desc">
          <span class="icon icon-mode"> </span>
          <span class="mode-name"> 模式选择 </span>
        </div>
        <div class="mode-list mode-special">
          <div
            class="mode-item"
            v-for="item in modeList"
            :key="item.id"
            @click="onSelectMode($event, item)"
          >
            <span
              :class="['icon-logo', item.icon , item.id == modeObject.id ? 'selected': '']" 
            >
              <div
                class="shadow"
                :style="{ boxShadow: `${item.shadow} 0px 5px 5px 0px` }"
              ></div>
            </span>
            <span class="mode-item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 风速模块 -->
    <div
      class="mode-panel"
      ref="speedPanel"
      :class="{ active: ModalShow.windSpeed }"
    >
      <div
        class="mask"
        @click.stop="hideModal($event, 'speed')"
        v-show="ModalShow.windSpeed"
      ></div>
      <div class="content">
        <div class="desc">风速选择</div>
        <div class="mode-list">
          <div
            class="mode-item"
            v-for="item in windSpeedList"
            :key="item.id"
            @click="onSelectSpeed($event, item)"
          >
            <span :class="['icon-logo', item.icon]">
              <div
                class="shadow"
                :style="{ boxShadow: `${modeObject.shadow} 0px 5px 5px 0px` }"
              ></div>
            </span>
            <span class="mode-item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 倒计时模块 -->
    <div
      class="mode-panel"
      ref="speedPanel"
      :class="{ active: isShowCountdown }"
    >
      <div
        class="mask"
        @click.stop="hideModal($event, 'countdown')"
        v-show="isShowCountdown"
      ></div>
      <!-- 倒计时设定 -->
      <timer-picker
        style="z-index: 99"
        @on-cancel="onCountdownCancel"
        @on-confirm="onCountdownChange"
        v-model="isShowCountdown"
      ></timer-picker>
    </div>
    <Modal
      v-model="CloseHintModal"
      title="倒计时"
      content="您已开启风机倒计时，确定要现在关闭吗？"
      @on-ok="onRemove"
    />
    <net-status-error-modal ref="nsem"></net-status-error-modal>
    <device-disabled-modal v-model="deviceDisableModal"></device-disabled-modal>
    <upgrade-modal ref="upgradeModal"></upgrade-modal>
  </div>
</template>

<script>
import { MODELIST, WINDSPEED } from "../const";
import { CDUnTouch } from "../../../directive/index";
import { CMD_KEY } from "../cmdkey";
import { deviceDetailRep, endpointControlRep,
    getDeviceScheduleTaskListRep,
    DisabledDeviceScheduleTaskRep,
    CreateDeviceScheduleTaskRep,
    DeleteDeviceScheduleTaskRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { deviceZigbeeType } from "../../../utils/index";
import ToolBar from "../../../components/ToolBar";
import DeviceDisabledModal from "../../../components/modals/modal/DeviceDisabledModal";
import Modal from "../../../components/modals/modal/Modal";
import UpgradeModal from "../../../components/modals/modal/UpgradeModal";
import NetStatusErrorModal from "../../../components/modals/modal/NetStatusErrorModal";
import DeviceOptions from "./DeviceOptions";
import { execNativeFunc } from "../../../utils/bridge";
import pageMixins from "../mixins/index";
import { formatMQTTData, isBoolean, isNumber  } from "../../../utils/socketUtil";

import badPic from "../../../assets/svgs/air-bad.svg";
import excellentPic from "../../../assets/svgs/air-excellent.svg";
import goodPic from "../../../assets/svgs/air-good.svg";
import normalPic from "../../../assets/svgs/air-normal.svg";
import co2Pic from "../../../assets/svgs/CO2.svg";
import pm25Pic from "../../../assets/svgs/PM2.5.svg";
import temperPic from "../../../assets/svgs/temperature&humidity.svg"; 

import TimerPicker from "./TimerPicker";
export default {
  name: "Ventilator",
  mixins: [pageMixins],
  directives: {
    CDUnTouch,
  },
  components: {
    ToolBar,
    TimerPicker,
    DeviceDisabledModal,
    UpgradeModal,
    Modal,
    NetStatusErrorModal,
    DeviceOptions,
  },
  data() {
    return {
      deviceZigbeeType: deviceZigbeeType,
      windowHeight: 1,
      isShowCountdown: false,
      CloseHintModal: false,
      isOnLine: true, // 设备在线/离线
      isLightOn: false, // 设备开启/关闭

      airData: {
        measureHumidity: '-',
        measureTemprature: '-',
        pm25Value: '-',
        co2Value: '-',
        vocValue: 0
      },
      svgs: {
        co2Pic,
        pm25Pic,
        temperPic
      }, 
      ModalShow: {
        mode: false,
        windSpeed: false,
      },
      isSettingMode: false, // 是否正在设置模式
      timer: {
        degreeTimer: 0,
        modeTimer: 0,
        speedTimer: 0,
        statusTimer: 0,
        toggleTimer: 0,
        AlarmTimer: 0,
      }, // 定时器，4秒钟后若MQTT设备状态不匹配，恢复原来配置
      touchTimers: {
        // 定时器， 手指操作松开时，在指定时间内如果mqtt返回的数据与手指操作产生的数据一致，则不更新对应指示器的位置
        degreeTimer: {
          timer: null,
          data: {},
        },
      },
      deviceDisableModal: false,
    };
  },
  methods: {
    ...mapMutations([
      "setVentilatorTaskId",
      "setVentilatorMode",
      "setVentilatorWindSpeed",
      "setGlobalDeviceStatus",
      "setDataToNative",
      "setGlobalMac",
      "setDeviceDetail",
      "setLightOnStatus",
      "setElectriDefaultLightStatus",
      "setCloseTime",
      "setTaskMinutes",
      "setTaskStartTimeMs"
    ]),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    // 离线状态下触摸刻度尺
    onTouchDegree() {
      if (!this.isOnLine) {
        this.deviceDisableModal = true;
        return;
      }
      if (!this.isLightOn) {
        this.deviceDisableModal = true;
      }
    },
    hideModal(event, type) {
      if (type === "speed") {
        this.ModalShow.windSpeed = false;
      } else if (type === "mode") {
        this.ModalShow.mode = false;
      } else if (type === "countdown") {
        this.isShowCountdown = false;
      }
    },
    stopEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    // 模式选择
    async onSelectMode($event, item) { 
      const params = {
        cmdKey: this.getModeById(item.id).cmdKey,
        cmdValue1: this.getModeById(item.id).cmdValue1,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        const oldMode = this.getVentilatorMode;
        this.timer.modeTimer = setTimeout(() => {
          // console.log("执行了定时器modeTimer，oldMode：", oldMode);
          this.setVentilatorMode(oldMode);
        }, 4000);
        this.setVentilatorMode(item.id);
      }
      this.hideModal($event, "mode");
    },
    // 风速选择
    async onSelectSpeed($event, item) { 
      const params = {
        cmdKey: this.getSpeedById(item.id).cmdKey,
        cmdValue1: this.getSpeedById(item.id).cmdValue,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        const oldSpeed = this.getVentilatorWindSpeed;
        this.timer.speedTimer = setTimeout(() => {
          // console.log("执行了定时器speedTimer，oldSpeed：", oldSpeed);
          this.setVentilatorWindSpeed(oldSpeed);
        }, 4000);
        this.setVentilatorWindSpeed(item.id);
      }
      this.hideModal($event, "speed");
    },
    onCountdownCancel() {
      // console.log("cancel");
    },
    async onCountdownChange(data) {
      this.setCloseTime(data.hour * 60)
      let { error } = await CreateDeviceScheduleTaskRep({
        endpointId: this.globalDataId,
        minutes: this.getCloseTime,
        taskName: '新风机' + this.globalDataId,
        taskTypeEnum: 'off'
      })
      if(!error) {
        this.getScheduleTask()
      } else {
        this.$Toast.show({ title: error.msg });
      } 
    },
    setCountdown() {
      clearTimeout(this.AlarmTimer);
      this.AlarmTimer = setTimeout(() => {
        this.setCloseTime(this.getCloseTime-1);
        if (this.getCloseTime > 0) {
          this.setCountdown();
        } else {
          clearTimeout(this.AlarmTimer);
        }
      }, 60 * 1000);
    },
    // 模式、风速弹框
    showModal(type, event) {
      if (!this.isOnLine) {
        this.deviceDisableModal = true;
        return;
      }
      if (!this.isLightOn) {
        this.deviceDisableModal = true;
        return;
      }
      if (type === "speed") {
        this.ModalShow.windSpeed = true;
        return;
      }
      if (type === "mode") {
        this.ModalShow.mode = true;
        return;
      }

      if (type === "countdown") {
        if(this.getCloseTime > 0) {
          this.CloseHintModal = true 
        } else {
          this.isShowCountdown = true;
        }
        
      }
    },
    async onRemove(){
      let { error } = await DisabledDeviceScheduleTaskRep({ id: this.getVentilatorTaskId })
      if(!error) {
        this.clearTaskData()
        clearTimeout(this.AlarmTimer)
        this.isShowCountdown = true;
      } else { 
        this.$Toast.show({ title: error.msg });
      }
      
    },
    // 开关切换
    onSwithChange(data) {
      if (!this.isOnLine) {
        this.deviceDisableModal = true; 
        return;
      }
      // console.log(this.timer.toggleTimer)
      if (this.timer.toggleTimer) return;
      this.handleToggle();
    }, 
    // 初始化数据
    _initData(data = {}) {
      const deviceData = formatMQTTData(data); 
      // console.log(deviceData)
      const displayData = Object.keys(deviceData).reduce((acc, cur) => {
        if(deviceData[cur] != null){
          acc[cur] = deviceData[cur]
        }
        return acc
      }, {})

      Object.assign(this.airData, displayData)
      // console.log(displayData)
      if (deviceData) {
        if (isBoolean(deviceData.isOnLine)) {
          // 设备在线状态
          this.isOnLine = deviceData.isOnLine;
          if (!this.isOnLine) {
            return;
          }
        } 
        if (deviceData.isChildMode !== null) { 
          // childmode
        }

 
        if (isBoolean(deviceData.isLightOn)) {
          // 设备开关状态
          if (this.isLightOn == deviceData.isLightOn) {
            clearTimeout(this.timer.statusTimer);
          }
          this.isLightOn = deviceData.isLightOn;
        } 
        if (isNumber(deviceData.airConditionTemprature) ) {  
          if (this.degree == Math.round(Number(_value))) {
            clearTimeout(this.timer.degreeTimer);
          }
          this.degree = Math.round(Number(_value));
          this.setOldTemperature(this.degree); 
        }

        // 空调模式
        if ( isNumber(deviceData.airFresherMode)) {
          if (
            this.getVentilatorMode == deviceData.airFresherMode
          ) {
            clearTimeout(this.timer.modeTimer);
          }
          this.setVentilatorMode(deviceData.airFresherMode);
        }

        // 风速模式
        if (isNumber(deviceData.airConditionWindSpeed)) {
          if (this.getVentilatorWindSpeed == deviceData.airConditionWindSpeed) {
            clearTimeout(this.timer.speedTimer);
          }
          this.setVentilatorWindSpeed(deviceData.airConditionWindSpeed);
        }  
        // 倒计时处理
        if (isNumber(deviceData.timerStatus)) { 
          this.getScheduleTask();
        }
      }
    },
    // 初始化获取数据
    getData() {
      this.getDeviceData(); 
    },
    /**
     *   校准倒计时时间
    **/
    adjustAlarm() {
      const countdown = this.getTaskStartTimeMs + this.getTaskMinutes * 60 * 1000 - Date.now(); 
      this.setCloseTime(Math.floor(countdown / 1000 / 60));
      this.setCountdown();
    },
    async getScheduleTask() {
      let { data, error } = await getDeviceScheduleTaskListRep({endpointId: this.globalDataId}) 
      if (data && !error) { 
        if(data.data.length > 0) {
          const { ifEnableEnum, taskId, startTimeMs, minutes, taskTypeEnum } = data.data[0]

          const countdown = startTimeMs + minutes * 60 * 1000 - Date.now(); 
          // 倒计时关机
          let isSetCloseTime = false
          if (taskTypeEnum == "off") {
            if (ifEnableEnum == "yes" && countdown > 0) {
              this.setVentilatorTaskId(taskId); 
              this.setCloseTime(Math.floor(countdown / 1000 / 60));
              this.setCountdown();
              this.setTaskMinutes(minutes)
              this.setTaskStartTimeMs(startTimeMs);
              isSetCloseTime = true;
            } else {
              if (!isSetCloseTime) {
                this.clearTaskData()
              }
              clearTimeout(this.AlarmTimer);
              this.AlarmTimer = null;
            }
          }
        }
      }
    },
     clearTaskData() {
      this.setVentilatorTaskId(0);
      this.setCloseTime(0);
      this.setTaskMinutes(0)
      this.setTaskStartTimeMs(0); 
    },
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType,
      });
      if (data && !error) {
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        const deviceStateEnum = new Map([
          ["offNetwork", 4],
          ["binding", 7],
          ["online", 1],
          ["default", 0],
        ]);
        let num =
          deviceStateEnum.get(data.data.deviceStateEnum) ||
          deviceStateEnum.get("default");
        this.setGlobalDeviceStatus(num);
this.$refs.nsem.checkNetStatus()
this.$refs.upgradeModal.checkUpgrade()

        this.$nextTick(() => {
          this._initData(data.data);
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async handleToggle() {
      let params = {
        endpointId: this.globalDataId,
        cmdKey: this.isLightOn ? CMD_KEY.CLOSE : CMD_KEY.OPEN,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.timer.toggleTimer = setTimeout(() => {
          clearTimeout(this.timer.toggleTimer);
          this.timer.toggleTimer = 0
        }, 300);

        const oldLightOn = this.isLightOn;
        this.timer.statusTimer = setTimeout(() => {
          // console.log("执行了定时器statusTimer，oldLightOn：", oldLightOn);
          this.isLightOn = oldLightOn;
        }, 4000);
        this.isLightOn = !this.isLightOn;
      }
    },
    getModeById(id) {
      const item = MODELIST.find((s) => s.id == id);
      return {
        icon: item.icon,
        shadow: item.shadow,
        cmdKey: item.cmdKey,
        cmdValue1: item.cmdValue1,
        name: item.name,
        id: item.id,
      };
    },
    getSpeedById(id) {
      const item = WINDSPEED.find((s) => s.id == id);
      return {
        icon: item.icon,
        name: item.name,
        cmdKey: item.cmdKey,
        bg: this.isOnLine && this.isLightOn ? item.bg : WINDSPEED[0].bg,
        cmdValue: item.cmdValue,
        id: item.id,
      };
    },
  },
  watch: {
    globalMattData(newV, oldV) {
      const attrs = newV
        .map((item) => item.attrs)
        .reduce((acc, i) => {
          acc.push(...i);
          return acc;
        }, []);
      const res = newV.reduce((acc, item) => {
        return Object.assign(acc, item);
      });
      res.attrs = attrs;
      this._initData(res);
    },
    globalDeviceStatus(newV) {
      this.isLightOn = Number(newV) === 1 || Number(newV) === 5;
      if (!this.isLightOn) {
        clearTimeout(this.AlarmTimer);
        this.clearTaskData()
      }
    },
  },
  computed: {
    ...mapGetters([
      "getVentilatorTaskId",
      "getVentilatorMode",
      "getVentilatorWindSpeed",
      "airConditionStatus",
      "deviceDataModify",
      "globalDeviceType",
      "globalData",
      "getTaskStartTimeMs",
      "getTaskMinutes",
      "getCloseTime",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "childMode",
    ]),
    windActiveClass() {
      if (this.isLightOn) {
        if (this.getVentilatorWindSpeed == 1) {
          return "circle-weak-active";
        } else if (this.getVentilatorWindSpeed == 2) {
          return "circle-normal-active";
        } else if (this.getVentilatorWindSpeed == 3) {
          return "";
        } else {
          return "circle-offline circle-offline-active";
        }
      } else {
        return "circle-offline circle-offline-active";
      }
    },
    alarmClock() {
      return {
        hour: Math.floor(this.getCloseTime / 60)
          .toString()
          .padStart(2, "0"),
        minute: Math.floor(this.getCloseTime % 60)
          .toString()
          .padStart(2, "0"),
      };
    },
    modeList() {
      return MODELIST.filter(s => s.isOptions);
    },
    windSpeedList() {
      return WINDSPEED.filter(s => s.isOptions);
    },
    modeObject() {
      return this.getModeById(this.isLightOn ? this.getVentilatorMode : 0);
    },
    speedObject() {
      return this.getSpeedById(this.getVentilatorWindSpeed);
    },
    svgPic() {
      switch (this.airData.vocValue) {
          case 3:
            return normalPic;
          case 4:
            return excellentPic;
          case 8:
            return goodPic;
          case 7:
            return badPic;
          default:
            return badPic;
        }
    },
  },
  created() {
    this.getData(); 
  },
  mounted() {
    window.WINGTO_H5.onPageChange = (data) => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if(result.type == 2) {
              clearTimeout(this.AlarmTimer);
              this.AlarmTimer = 0;
            }
            //  app回到前台
            if(result.type == 3) {
              this.adjustAlarm();
            } 
          } 
        } catch (error) {}
      }
    };
  }
};
</script>
<style lang="less">
.icon {
  font-family: "iconfont";
}
#ventilator {
  font-family: "PingFangSC-Regular, PingFang SC";
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  color: rgba(0, 0, 0, 0.6);
  background: #fbfbfc;
  transition: all 0.15s ease-in-out;
  .speed-wrap {
    float: right;
    position: absolute;
    top: 212px;
    -webkit-tap-highlight-color: transparent;
    right: 0;
    height: 788px;
    width: 344px;
    .speed-bg {
      width: inherit;
      height: inherit;
      background-position: center;
      background-size: cover;
      position: relative;

      .speed-gear {
        position: absolute;
        background-position: center;
        background-size: cover;
      }
      .top {
        right: 0;
        top: -5px;
        width: 298px;
        height: 286px;
      }
      .middle {
        top: 223px;
        right: 182px;
        width: 164px;
        height: 344px;
      }

      .bot {
        right: 0;
        bottom: -3px;
        width: 297px;
        height: 285px;
      }

      .speed-box {
        padding: 24px;
        z-index: 8;
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        flex-direction: column;
        .speed-name {
          font-size: 40px;
          line-height: 40px;
        }
        .icon {
          transform: rotate(360deg);
          transition: all 0.35s ease-out;
          margin-top: 10px;
          font-size: 32px;
        }
      }
    }
  }
  .circle-wrap {
    position: absolute;
    right: 0;
    top: 212px;
    -webkit-tap-highlight-color: transparent;
    .mask {
      width: 540px;
      height: 540px;
      position: absolute;
      border-radius: 50%;
      background: #fff;
      overflow: hidden;
      transform: translate(77vw, 17vw);
      z-index: 8;
    }
    .circle {
      width: 800px;
      height: 800px;
      border-radius: 50%;
      position: relative;
      transition: clip-path 0.2s;
      -webkit-mask: radial-gradient(transparent, transparent 260px, #000 260px);
      mask: radial-gradient(transparent 140px, #000 140px);
      overflow: hidden;
      transform: translateX(60vw);
      .sector {
        width: 300px;
        height: 300px;
        position: absolute;
        clip: rect(0 300px 300px 150px);
        overflow: hidden;
      }
      .sector::after {
        content: "";
        width: 100%;
        height: 100%;
        background: currentColor;
        position: absolute;
        clip: rect(0 150px 300px 0);
        transform: rotate(30deg);
        border-radius: 50%;
      }
      // .fade-enter-active, .fade-leave-active {
      //   transition: opacity .5s;
      //   transform: rotate(0);
      // }
      // .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
      //   opacity: 0;
      // }
    }
    .circle-part {
      width: 50%;
      height: 100%;
      position: absolute;
      transform: rotate(180deg);
      transform-origin: right;
      transition: transform 0.5s cubic-bezier(0.39, 0.575, 0.565, 1);
      background: linear-gradient(to top, #e5e5e5, #ffffff);
      float: left;
    }
    .circle-transtion {
      transition: all 0.35s ease-out;
    }
    .circle-offline {
      width: 50%;
      height: 100%;
      opacity: 0;
      position: absolute;
      transform-origin: right;
      background: linear-gradient(to top, #ffffff, #e5e5e5, #ffffff);
      float: left;
    }

    .circle-full {
      width: 50%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        #22f5d2,
        #8ffdeb,
        #22f5d2,
        #57cbff,
        #57cbff,
        #fbfbfc
      );
      float: left;
    }

    .circle-weak-active {
      transform: rotate(65deg) !important;
    }

    .circle-normal-active {
      transform: rotate(115deg) !important;
    }

    .circle-offline-active {
      transform: rotate(0) !important;
      opacity: 1;
    }
    .top-white-line {
      background: #fff;
      width: 100%;
      position: absolute;
      top: 390px;
      transform-origin: center;
      height: 10px;
      transform: rotate(25deg);
      z-index: 5;
    }

    .bottom-white-line {
      background: #fff;
      width: 100%;
      position: absolute;
      bottom: 390px;
      transform-origin: center;
      height: 10px;
      z-index: 5;
      transform: rotate(-25deg);
    }

    .box {
      position: relative;
      .speed-box {
        z-index: 9;
        position: absolute;
        right: 44px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        flex-direction: column;
        .speed-name {
          font-size: 40px;
          line-height: 40px;
        }
        .icon {
          transform: rotate(360deg);
          transition: all 0.35s ease-out;
          margin-top: 10px;
          font-size: 32px;
        }
      }
    }

    .right {
      position: absolute;
      right: 0;
      z-index: 1;
      box-shadow: 10px 0px 20px 10px #fff;
      height: 100%;
      width: 0px;
    }
  }

  &.active {
    color: #000;
  }
  .offline {
    color: #c0c0cd;
  }
  .air-wrap {
    float: left;
    position: relative;
    display: flex;
    .air {
      position: relative;
      width: 100px;
      height: 100px;
      margin-left: 90px;
      margin-top: 104px;
      z-index: 5;
    }
    .icon-box {
      margin-top: 104px;
      margin-left: 18px;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
      .icon {
        color: #979797;
        font-size: 24px;
        margin-bottom: 15px;
      }
      .desc {
        color: #848484;
        font-size: 24px;
        line-height: 24px;
      }
    }
  }
  .air-data {
    margin-left: 52px;
    margin-top: 160px;
    display: flex;
    flex-direction: column;
    img {
      width: 134px;
      height: 113px;
    }
    .data-box {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      .data {
        font-size: 28px;
        line-height: 32px;
        color: #000;
      }
      .desc {
        margin-top: 14px;
        line-height: 24px;
        color: #797979;
      }
    }
    .pm25 {
      display: flex;
    }
    .co2 {
      margin-top: 50px;
      display: flex;
    }
    .temperature {
      margin-top: 50px;
      display: flex;
    }
  }
  .panel {
    position: absolute;
    bottom: 80px;
    left: 70px;
    right: 60px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .active {
      color: #000;
    }
    .left {
      display: flex;
      align-items: center;
      flex: 1;
      .item {
        display: flex;
        align-items: center;
        flex-direction: column;
        &.center {
          margin: 0 40px;
        }
        .icon {
          display: inline-block;
          font-family: "iconfont" !important;
          width: 100px;
          height: 100px;
          background: #ffffff;
          box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.04);
          border-radius: 40px;
          font-size: 50px;
          text-align: center;
          line-height: 100px;
        }
        .offline {
          color: #c0c0cd;
        }
        .name {
          margin-top: 18px;
          font-size: 26px;
          line-height: 24px;
        }
        .name-alarm {
          animation: cursorAlarm 1s infinite steps(1, start);
        }
      }
    }
    .right {
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
      &.switch {
        border-radius: 50%;
        font-family: "iconfont" !important;
        background: #ffffff;
        box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.05);
        line-height: 140px;
        text-align: center;
        font-size: 50px;
        &.active {
          box-shadow: 0px 0px 30px 0px rgba(216, 2, 0, 0.16);
          color: #d80200;
        }
      }
    }
  }

  .mode-panel {
    position: absolute;
    bottom: -528px;
    right: 0;
    left: 0;
    height: 360px;
    background-color: #d1d1d1;
    box-shadow: 0px -4px 40px 0px rgba(0, 0, 0, 0.06);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    display: flex;
    flex-direction: column;
    transition: bottom 0.2s linear;
    &.active {
      bottom: 0;
    }
    .icon-logo {
      display: inline-block;
      font-family: "iconfont" !important;
      width: 100px;
      position: relative;
      height: 100px;
      background: #ffffff;
      box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.04);
      border-radius: 40px;
      font-size: 50px;
      text-align: center;
      line-height: 100px;
      .shadow {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        border-radius: 40px;
        font-size: 50px;
        text-align: center;
        line-height: 100px;
      }
    }
    .selected{
      color: rgb(216, 2, 0);
    }

    .name {
      margin-top: 18px;
      font-size: 26px;
      line-height: 24px; 
    }

    .mask {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 98;
      background-color: rgba(0, 0, 0, 0.2);
    }
    .content {
      position: relative;
      width: 100%;
      height: 100%;
      background: #f9f9f9;
      z-index: 99;
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      display: flex;
      align-items: center;
      flex-direction: column;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
      .desc {
        font-size: 24px;
        line-height: 40px;
        margin-top: 40px;
        display: flex;
        align-items: baseline;
        .mode-name {
          margin-left: 12px;
        }
      }
      .mode-list {
        flex: 1;
        width: 100%;
        height: calc(100% - 8px);
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 40px;
        margin-top: 30px;
        box-sizing: border-box;
        overflow-y: auto;
        margin-bottom: 76px;
        align-content: flex-start;
        -webkit-overflow-scrolling: touch;
        .mode-item-name {
          line-height: 24px;
          font-size: 24px;
          color: #2f2f4a;
          text-align: center;
          display: block;
          margin-top: 10px;
        }
        .mode-item {
          flex-direction: column;
          position: relative;
          width: 140px;
          height: 160px;
          background-position: center;
          overflow: hidden;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
@keyframes cursorAlarm {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s;
}
.modal-enter, .modal-leave-to{
  opacity: 0;
}
</style>
