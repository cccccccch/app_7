<template>
  <div id="floorHeating" :class="{ active: isLightOn }">
    <ToolBarFloorHeating :title="deviceDetail.deviceName" @goBack="goback" :showRight="!!deviceDetail.dataId">
      <template v-slot:options="data">
        <DeviceOptionsFloorHeating :isShow="data.active"></DeviceOptionsFloorHeating>
      </template>
    </ToolBarFloorHeating>

    <!-- 室内温度 -->
    <div class="environment-wrap">
      <div class="environment-box">
        <span class="temperature-text">{{ isLightOn ? homeTemprature : "--" }}℃</span>
        <span class="desc-text">室内温度</span>
      </div>
    </div>

    <!-- 设备温度 -->
    <div class="temperature-wrap">
      <div class="temperature-box">
        <span class="icon icon-floor-heating temperature-icon"></span>
        <div class="temperature">
          <span class="temperature-text">{{ isLightOn ? temperature : "--" }}</span>
          <span class="unit-text">℃</span>
        </div>
      </div>
    </div>

    <!-- 温度控制器 -->
    <div class="degree-wrap" :class="{'degree-wrap-disabled': !canHandleDegree}">
      <div class="degree-bg">
        <div class="degree-triangle icon icon-triangle"></div>
        <div class="degree-comp">
          <DegreeSlideItem
            @clickOnLine="clickOnLine"
            :disabled="!canHandleDegree"
            ref="DegreeSlideComp"
            :isTurnOn="isLightOn"
            :initDegree="temperature"
            :startDegree="startDegree"
            :endDegree="endDegree"
            @onSlide="degreeChange"
            @onFingerTouch="onFingerTouch($event, 'degree')"
          />
        </div>
        <div class="degree-ctrl icon icon-circle"></div>
      </div>
    </div>

    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="item" @click="showModal('countdown', $event)">
        <span class="icon icon-clock"></span>
        <span class="name" v-if="getCloseTime > 0 && isLightOn">
          <span class="">{{ alarmClock.hour }}</span>
          <span class="name-alarm">:</span>
          <span class="">{{ alarmClock.minute }}</span>
        </span>
        <span class="name" v-else>定时</span>
      </div>

      <div class="toggle switch icon icon-switch" @click="onSwithChange"></div>

      <div class="item" @click="showModal('mode')">
        <span :class="['icon', modeObject.icon]"></span>
        <span class="name">{{ modeObject.name }}</span>
      </div>
    </div>

    <!-- 模式模块 -->
    <div class="mode-panel" ref="modePanel" :class="{ active: ModalShow.mode }">
      <transition name="modal">
        <div class="mask" @click.stop="hideModal($event, 'mode')" v-show="ModalShow.mode"></div>
      </transition>
      <div class="content">
        <div class="desc">
          <span class="icon icon-mode"> </span>
          <span class="mode-name"> 模式选择 </span>
        </div>
        <div class="mode-list mode-special">
          <div class="mode-item" v-for="item in modeList" :key="item.id" @click="onSelectMode($event, item)">
            <span :class="['icon', 'icon-logo', item.icon, item.id == modeObject.id ? 'selected' : '']">
              <div class="shadow" :style="{ boxShadow: `${item.shadow} 0px 5px 5px 0px` }"></div>
            </span>
            <span class="mode-item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 倒计时模块 -->
    <div class="mode-panel" ref="speedPanel" :class="{ active: isShowCountdown }">
      <div class="mask" @click.stop="hideModal($event, 'countdown')" v-show="isShowCountdown"></div>
      <!-- 倒计时设定 -->
      <timer-picker style="z-index: 99" @on-cancel="onCountdownCancel" @on-confirm="onCountdownChange" v-model="isShowCountdown"> </timer-picker>
    </div>
    <Modal v-model="ModalShow.closeHintModal" title="定时关闭" content="您已开启地暖定时关闭，确定要现在取消吗？" @on-ok="onRemove" />
    <net-status-error-modal ref="nsem"></net-status-error-modal>
    <device-disabled-modal v-model="ModalShow.deviceDisableModal"></device-disabled-modal>
    <upgrade-modal ref="upgradeModal"></upgrade-modal>
  </div>
</template>

<script>
import { MODELIST } from "../const";
import { CMD_KEY } from "../cmdkey";
import { deviceDetailRep, endpointControlRep, getDeviceScheduleTaskListRep, DisabledDeviceScheduleTaskRep, CreateDeviceScheduleTaskRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";

import DeviceDisabledModal from "../../../components/modals/modal/DeviceDisabledModal";
import Modal from "../../../components/modals/modal/Modal";
import UpgradeModal from "../../../components/modals/modal/UpgradeModal";
import NetStatusErrorModal from "../../../components/modals/modal/NetStatusErrorModal";
import pageMixins from "../mixins/index";
import { execNativeFunc } from "../../../utils/bridge";

import { formatMQTTData, isNumber, isBoolean } from "../../../utils/socketUtil";
import ToolBarFloorHeating from "../../../components/ToolBar";
import DeviceOptionsFloorHeating from "../components/DeviceOptions";
import TimerPicker from "../components/TimerPicker";
import DegreeSlideItem from "../components/DegreeSlide";

export default {
  name: "UnderfloorHeating",
  mixins: [pageMixins],
  components: {
    ToolBarFloorHeating,
    TimerPicker,
    DeviceDisabledModal,
    UpgradeModal,
    Modal,
    NetStatusErrorModal,
    DeviceOptionsFloorHeating,
    DegreeSlideItem
  },
  data() {
    return {
      isShowCountdown: false,
      isOnLine: true, // 设备在线/离线
      isLightOn: false, // 设备开启/关闭
      homeTemprature: 0, // 室内温度
      temperature: 26, // 空调温度
      startDegree: 5, // 最小温度 
      onFingerTouching: false,
      endDegree: 37, // 最大温度
      ModalShow: {
        deviceDisableModal: false,
        mode: false, // 设备模式 modal标记
        closeHintModal: false // 关闭设备倒计时modal标记
      },
      changeTemperatureList: [],
      changeTemperatureTimeoutList: [],
      timer: {
        degreeTimer: 0,
        modeTimer: 0,
        speedTimer: 0,
        statusTimer: 0,
        toggleTimer: 0,
        AlarmTimer: 0
      }, // 定时器，4秒钟后若MQTT设备状态不匹配，恢复原来配置
      touchTimers: {
        // 定时器， 手指操作松开时，在指定时间内如果mqtt返回的数据与手指操作产生的数据一致，则不更新对应指示器的位置
        degreeTimer: {
          timer: null,
          data: {}
        }
      }
    };
  },
  methods: {
    ...mapMutations([
      "setVentilatorTaskId",
      "setVentilatorMode",
      "setGlobalDeviceStatus",
      "setVentilatorTemperature", 
      "setDataToNative",
      "setGlobalMac",
      "setDeviceDetail",
      "setLightOnStatus",
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
    degreeChange(data) {
      this.temperature = data.degree;
      if (data.touchEnd) {
        // console.log("touchEnd", this.temperature);
        this.handleDegreeChange(this.temperature);
      }
    },
    hideModal(event, type) {
      if (type === "mode") {
        this.ModalShow.mode = false;
      } else if (type === "countdown") {
        this.isShowCountdown = false;
      }
    },
    /**
     * 修改温度
     */
    async handleDegreeChange(value) {
      let params = {
        cmdKey: CMD_KEY.SET_TEMPERATURE,
        cmdValue1: value * 10,
        endpointId: this.globalDataId
      };
      this.changeTemperatureList.push(value);
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        // 调温度之前设置定时器，4秒之后没收到MQTT消息恢复原来的温度 
        
        if (this.timer.degreeTimer) {
          clearTimeout(this.timer.degreeTimer);
        }

        this.timer.degreeTimer = setTimeout(() => {
          if (this.onFingerTouching) return;
          // console.log('执行了定时器')
          this.getData();
        }, 4000);
        this.temperature = value; 
      } else {
        // console.warn('发送指令失败')
        let timer = setTimeout(() => {
          this._initData(this.deviceDetail);
          timer && clearTimeout(timer);
        }, 1000);
      }
    },
    // 模式选择，4内秒没接收到MQTT消息，则恢复原来状态
    async onSelectMode($event, item) {
      const params = {
        cmdKey: this.getModeById(item.id).cmdKey,
        cmdValue1: this.getModeById(item.id).cmdValue1,
        endpointId: this.globalDataId
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
    onCountdownCancel() {
      // console.log("cancel");
    },
    async onCountdownChange(data) { 
      const minutes = (data.hour || 0) * 60 + (data.minute || 0)
      this.setCloseTime(minutes * 60); 
      let { error } = await CreateDeviceScheduleTaskRep({
        endpointId: this.globalDataId,
        minutes: minutes,
        taskName: "地暖" + this.globalDataId,
        taskTypeEnum: "off"
      });
      if (!error) {
        this.getScheduleTask();
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    // 设置定时器
    setCountdown(miles) { 
      clearTimeout(this.AlarmTimer);
      this.AlarmTimer = setTimeout(() => {
        this.setCloseTime(this.getCloseTime - 60);
        if (this.getCloseTime > 0) { 
          this.setCountdown();
        } else {
          clearTimeout(this.AlarmTimer);
        }
      }, miles || 60 * 1000);
    },
    // 模式、风速弹框
    showModal(type, event) {
      if (!this.isOnLine || !this.isLightOn) {
        this.ModalShow.deviceDisableModal = true;
        return;
      }
      if (type === "mode") {
        this.ModalShow.mode = true;
        return;
      }
      if (type === "countdown") {
        if (this.getCloseTime > 0) {
          this.ModalShow.closeHintModal = true;
        } else {
          this.isShowCountdown = true;
        }
      }
    },
    /**
     * 移除定时任务
     */
    async onRemove() {
      let { error } = await DisabledDeviceScheduleTaskRep({
        id: this.getVentilatorTaskId
      });
      if (!error) {
        this.clearTaskData();
        clearTimeout(this.AlarmTimer);
        // this.isShowCountdown = true;
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    // 手指是否正在触摸某个组件
    onFingerTouch(flag, type) {
      this.onFingerTouching = flag;
    },
    // 开关切换
    onSwithChange(data) {
      // debug
      // this.isLightOn = !this.isLightOn;
      // return
      if (!this.isOnLine) {
        this.ModalShow.deviceDisableModal = true;
        return;
      }
      // console.log(this.timer.toggleTimer);
      if (this.timer.toggleTimer) return;
      this.handleToggle();
    },
    // 初始化数据
    _initData(data = {}, isFromMQTT = false) {
      const deviceData = formatMQTTData(data);
      // console.log(deviceData)
      if (deviceData) {
        // 设备在线状态
        if (isBoolean(deviceData.isOnLine)) {
          this.isOnLine = deviceData.isOnLine;
          if (!this.isOnLine) {
            return;
          }
        }

        // 设备开关状态
        if (isBoolean(deviceData.isLightOn)) {
          if (this.isLightOn == deviceData.isLightOn) {
            clearTimeout(this.timer.statusTimer);
          }
          this.isLightOn = deviceData.isLightOn;
        }

        // 室内温度
        if (isNumber(deviceData.homeTemprature)) {
          this.homeTemprature = deviceData.homeTemprature;
        }

        // 空调温度
        if (isNumber(deviceData.airConditionTemprature)) {
          const _value = deviceData.airConditionTemprature; 
          // if (this.temperature == Math.round(Number(_value))) {
          //   clearTimeout(this.timer.degreeTimer);
          // }
          if (isFromMQTT) {
            // console.log(JSON.stringify(this.changeTemperatureList),'接收到得温度：',_value)
            let index = this.changeTemperatureList.indexOf(_value);
            if (index >= 0) {
              this.changeTemperatureList.length >= index && this.changeTemperatureList.splice(index, 1);
              if (this.changeTemperatureList.length == 0) {
                clearTimeout(this.timer.degreeTimer);
              }
            } else {
              if (this.onFingerTouching) return;

              this.temperature = this.limitTemperature(Math.round(Number(_value)));
              this.$refs.DegreeSlideComp._initDegree(this.temperature); 
            }
          } else {
            this.temperature = this.limitTemperature(Math.round(Number(_value)));
            this.$refs.DegreeSlideComp._initDegree(this.temperature); 
          }
        }
 

        // 地暖模式
        if (isNumber(deviceData.airFresherMode)) {
          if (this.getVentilatorMode == deviceData.airFresherMode) {
            clearTimeout(this.timer.modeTimer);
          }
          this.setVentilatorMode(deviceData.airFresherMode);
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
    clearTaskData() {
      this.setVentilatorTaskId(0);
      this.setCloseTime(0);
      this.setTaskMinutes(0);
      this.setTaskStartTimeMs(0);
    },
    clickOnLine(value) { 
      this.$refs.DegreeSlideComp._initDegree(value);
      this.handleDegreeChange(value) 
    },
    /**
     *   校准倒计时时间
     **/
    adjustAlarm() {
      const countdown = this.getTaskStartTimeMs + this.getTaskMinutes * 60 * 1000 - Date.now();
      this.setCloseTime(Math.floor(countdown / 1000));
      this.setCountdown();
    },
    /**
     * 获取设备的定时任务，根据返回的定时状态以及任务倒计时，设定界面定时器
     */
    async getScheduleTask() {
      let { data, error } = await getDeviceScheduleTaskListRep({
        endpointId: this.globalDataId
      });
      if (data && !error) {
        if (data.data.length > 0) {
          const { ifEnableEnum, taskId, startTimeMs, minutes, taskTypeEnum } = data.data[0];
          let isSetCloseTime = false;
          const countdown = startTimeMs + minutes * 60 * 1000 - Date.now(); 
          // 倒计时关机
          if (taskTypeEnum == "off") {
            if (ifEnableEnum == "yes" && countdown > 0) {
              this.setVentilatorTaskId(taskId);
              this.setCloseTime(Math.floor(countdown / 1000));
              this.setCountdown();
              this.setTaskMinutes(minutes);
              this.setTaskStartTimeMs(startTimeMs);
              isSetCloseTime = true;
            } else {
              if (!isSetCloseTime) {
                this.clearTaskData();
              }
              clearTimeout(this.AlarmTimer);
              this.AlarmTimer = null;
            }
          }
        }
      }
    },
    limitTemperature(degree = 26) {
      if (degree < 5) {
        return 5;
      } else if (degree > 37) {
        return 37;
      } else {
        return degree;
      }
    },
    /**
     * 获取设备数据
     */
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType
      });
      if (data && !error) {
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        const deviceStateEnum = new Map([
          ["offNetwork", 4],
          ["binding", 7],
          ["online", 1],
          ["default", 0]
        ]);
        let num = deviceStateEnum.get(data.data.deviceStateEnum) || deviceStateEnum.get("default");
        this.setGlobalDeviceStatus(num);
        this.$refs.nsem.checkNetStatus();
        this.$refs.upgradeModal.checkUpgrade();
        this.$nextTick(() => {
          this._initData(data.data);
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    /**
     * 设备开关切换，4秒内设备接收不到MQTT信息，则恢复原来状态
     */
    async handleToggle() {
      let params = {
        endpointId: this.globalDataId,
        cmdKey: this.isLightOn ? CMD_KEY.CLOSE : CMD_KEY.OPEN
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.timer.toggleTimer = setTimeout(() => {
          clearTimeout(this.timer.toggleTimer);
          this.timer.toggleTimer = 0;
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
      return MODELIST.find(s => s.id == id);
    }
  },
  watch: {
    globalMattData(newV, oldV) {
      const attrs = newV
        .map(item => item.attrs)
        .reduce((acc, i) => {
          acc.push(...i);
          return acc;
        }, []);
      const res = newV.reduce((acc, item) => {
        return Object.assign(acc, item);
      });
      
      res.attrs = attrs;
      // console.log(JSON.stringify(res))
      this._initData(res, true);
    },
    globalDeviceStatus(newV) {
      this.isLightOn = Number(newV) === 1 || Number(newV) === 5;
      if (!this.isLightOn) {
        clearTimeout(this.AlarmTimer);
        this.clearTaskData();
      }
    }
  },
  computed: {
    ...mapGetters([
      "getVentilatorTaskId",
      "getVentilatorMode", 
      "getVentilatorTemperature",
      "deviceDataModify",
      "globalDeviceType",
      "globalData",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "getTaskStartTimeMs",
      "getTaskMinutes",
      "getCloseTime"
    ]),
    alarmClock() {
      return {
        hour: Math.floor(this.getCloseTime / 60 / 60)
          .toString()
          .padStart(2, "0"),
        minute: Math.floor(this.getCloseTime / 60 % 60)
          .toString()
          .padStart(2, "0")
      };
    },
    modeList() {
      return MODELIST.filter(s => s.isOption);
    },
    modeObject() {
      return this.getModeById(this.isLightOn ? this.getVentilatorMode : 0);
    },
      // 节能模式不能调节温度
    canHandleDegree() { 
      return this.modeObject.canHandleDegree;
    }, 
  },
  created() {
    this.getData();
  },
  mounted() {
    window.WINGTO_H5.onPageChange = data => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if (result.type == 2) {
              clearTimeout(this.AlarmTimer);
              this.changeTemperatureList = [];
              this.AlarmTimer = 0;
            }
            //  app回到前台
            if (result.type == 3) {
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
#floorHeating {
  font-family: "PingFangSC-Regular, PingFang SC";
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  color: rgba(0, 0, 0, 0.6);
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;

  .environment-wrap {
    margin-top: 48px;
    .environment-box {
      color: #979797;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .temperature-text {
        font-weight: 500;
        font-size: 28px;
        line-height: 28px;
      }
      .desc-text {
        margin-top: 10px;
        font-weight: 300;
        font-size: 24px;
        line-height: 24px;
      }
    }
  }

  .temperature-wrap {
    margin-top: 103px;
    color: #979797;

    .temperature-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      .temperature-icon {
        font-size: 66px;
      }
      .active {
        color: #2f2f4a;
      }
      .temperature {
        display: flex;
        align-items: flex-start;
        font-weight: 500;
        margin-top: 48px;
        .temperature-text {
          padding-left: 48px;
          font-size: 196px;
          line-height: 144px;
        }
        .unit-text {
          font-size: 48px;
          line-height: 48px;
        }
      }
    }
  }
  .degree-wrap {
    position: absolute;
    bottom: 358px;
    right: 0;
    left: 0;
    color: #979797; 
    .degree-bg {
      position: relative;
      height: 307px;
      background-image: url("../../../assets/svgs/heating-bg.svg");
      background-size: cover;
      .degree-comp {
        height: 150px;
        overflow: hidden;
        position: absolute;
        bottom: 8px;
        width: inherit;
      }
      .degree-triangle {
        position: absolute;
        left: 50%;
        bottom: 140px;
        font-size: 12px;
        transform: translateX(-50%);
      }
      .degree-ctrl {
        background-size: cover;
        position: absolute;
        width: 58px;
        font-size: 58px;

        height: 58px;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
  .degree-wrap-disabled {
     opacity: 0.5;
  }
  .panel {
    position: absolute;
    bottom: 80px;
    left: 60px;
    right: 60px;
    height: 140px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    color: #979797;
    .active {
      color: #000;
    }
    .item {
      display: flex;
      align-items: center;
      flex-direction: column;
      padding: 16px 16px 0 16px;
      .icon {
        display: inline-block;
        border-radius: 40px;
        font-size: 48px;
        text-align: center;
        line-height: 48px;
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
    .toggle {
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
      &.switch {
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.05);
        line-height: 140px;
        text-align: center;
        font-size: 50px;
      }
    }
  }

  &.active {
    .temperature,
    .temperature-text {
      color: #2f2f4a;
    }

    .temperature-icon {
      color: #d80200;
    }
    .degree-bg {
      background-image: url("../../../assets/svgs/heating-bg-active.svg");
      .degree-ctrl {
        color: #6165c5;
      }
      .degree-triangle {
        color: #7377c4;
      }
    }
    .panel {
      color: #2f2f4a;
      .switch {
        box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16);
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
    transition: bottom 0.15s linear;
    &.active {
      bottom: 0;
    }
    .icon-logo {
      display: inline-block;
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
    .selected {
      color: rgb(216, 2, 0);
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
      color: #2f2f4a;
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
.modal-enter,
.modal-leave-to {
  opacity: 0;
}
</style>
