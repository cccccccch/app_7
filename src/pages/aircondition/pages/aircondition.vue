<template>
  <div id="aircondition" :class="{ active: isLightOn }">
    <ToolBarAircondition
      :title="deviceDetail.deviceName"
      @goBack="goback"
      :showRight="!!deviceDetail.dataId"
      optionType="light"
    >
      <template v-slot:options="data">
        <DeviceOptionsAircondition
          :isShow="data.active"
          :isTurnOn="isLightOn"
          :isOnline="isOnLine"
          @onAlarmSet="onAlarmSet"
          @onAlarmCancel="onAlarmCancel"
          @onChildModeChange="onChildModeChange"
          @onError="deviceDisabled"
        ></DeviceOptionsAircondition>
      </template>
    </ToolBarAircondition>
    <div class="air-wrap">
      <img :src="svgPic" class="air" alt />
    </div>
    <div class="degrees" :class="[isLightOn ? '' : 'turnoff']">
      <span class="degree-num" :class="[isOnLine ? 'active' : 'offline']">{{
        showDegree ? degree : "--"
      }}</span>
      <span class="degree-text" :class="{ offline: !isOnLine }"
        >空调温度，℃</span
      >
    </div>
    <!-- 刻度模块 -->
    <div
      class="degree-wrap"
      ref="degreeWrap"
      @touchstart="onTouchDegree($event)"
    >
      <degree-slide
        @onSlide="onSlide"
        :disabled="!canHandleDegree"
        :curDegree="degree"
        @onFingerTouch="onFingerTouch($event, 'degree')"
        :isLightOn="isLightOn"
        :maxUnit="maxUnit"
        :startDegree="startDegree"
        :miniDegree="miniDegree"
        :dpr="56"
        :endDegree="endDegree"
        ref="degreeSlideComp"
      />
    </div>
    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="left">
        <div :class="['item', isOnLine ? 'active' : 'offline']">
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
            isOnLine ? 'active' : 'offline',
            !modeObject.canHandleSpeed ? 'disabled' : '',
          ]"
        >
          <span
            :class="['icon', speedObject.icon]"
            @click="showModal('speed')"
          ></span>
          <span class="name">{{ speedObject.name }}</span>
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
          @touchstart.stop="hideModal($event, 'mode')"
          v-show="ModalShow.mode"
        ></div>
      </transition>
      <div class="content">
        <div class="desc">模式选择</div>
        <div class="mode-list">
          <div
            class="mode-item"
            v-for="item in modeOptions"
            :key="item.id"
            @click.stop="onSelectMode($event, item)"
          >
            <span :class="['icon', item.icon]">
              <div
                class="shadow"
                :class="{ active: modeObject.id == item.id }"
              ></div>
            </span>
            <span class="mode-item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 风速模块 -->
    <div
      class="mode-panel  "
      ref="speedPanel"
      :class="{ active: ModalShow.windSpeed }"
    >
      <transition name="modal">
        <div
          class="mask"
          @touchstart.stop="hideModal($event, 'speed')"
          v-show="ModalShow.windSpeed"
        ></div>
      </transition>

      <div class="content">
        <div class="desc">风速选择</div>
        <div class="mode-list">
          <div
            class="mode-item"
            v-for="item in windSpeedList"
            :key="item.id"
            @click.stop="onSelectSpeed($event, item)"
          >
            <span :class="['icon', item.icon]">
              <div
                class="shadow"
                :class="{ active: speedObject.id == item.id }"
              ></div>
            </span>
            <span class="mode-item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <net-status-error-modal ref="nsem"></net-status-error-modal>
    <device-disabled-modal v-model="deviceDisableModal"></device-disabled-modal>
    <upgrade-modal ref="upgradeModal"></upgrade-modal>
    <Modal
      v-model="childModeMsgModal"
      title="温馨提示"
      type="one"
      :content="'您已开启【儿童模式】,如需调节温度至25℃以下，请前往设置。'"
    />
  </div>
</template>

<script>
import DegreeSlide from "./DegreeSlide";
import {
  getModeList,
  getSpeedList,
  getModeOptions,
  getSpeedOptions,
  getTemperatureRange,
} from "../const";
import { CDUnTouch } from "../../../directive/index";
import { CMD_KEY, CMD_KEY_VRV2 } from "../cmdkey";
import { deviceDetailRep, endpointControlRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { deviceZigbeeType } from "../../../utils/index";
import ToolBarAircondition from "../../../components/ToolBar";
import DeviceDisabledModal from "../../../components/modals/modal/DeviceDisabledModal";
import Modal from "../../../components/modals/modal/Modal";
import UpgradeModal from "../../../components/modals/modal/UpgradeModal";
import NetStatusErrorModal from "../../../components/modals/modal/NetStatusErrorModal";
import DeviceOptionsAircondition from "./DeviceOptions";
import { execNativeFunc } from "../../../utils/bridge";
import pageMixins from "../mixins/index";
import { formatMQTTData, isNumber, isBoolean } from "../../../utils/socketUtil";

import closedPic from "../../../assets/svgs/closed.svg";

export default {
  name: "AirCondition",
  mixins: [pageMixins],
  directives: {
    CDUnTouch,
  },
  components: {
    DegreeSlide,
    ToolBarAircondition,
    DeviceDisabledModal,
    UpgradeModal,
    NetStatusErrorModal,
    DeviceOptionsAircondition,
    Modal,
  },
  data() {
    return {
      deviceZigbeeType: deviceZigbeeType,
      windowHeight: 1,
      isLoading: false,
      childModeMsgModal: false,
      isOnLine: false, // 设备在线/离线
      isLightOn: false, // 设备开启/关闭
      degree: 26, // 当前页面默认刻度
      miniDegree: 16, // 是否需要缩小刻度条
      maxUnit: 17, // 可滚动刻度 [16,32] 17个单位
      endDegree: 32, // DegreeSlide 实际最大刻度，空调最大31，风机盘管最大29
      startDegree: 16, // DegreeSlide 实际最大刻度
      changeTemperatureList: [],
      changeTemperatureTimeoutList: [],
      childModeTimer: 0,
      onFingerTouching: false,
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
        DegreeChangeTimer: 0,
      }, // 定时器，4秒钟后若MQTT设备状态不匹配，恢复原来配置
      touchTimers: {
        // 定时器， 手指操作松开时，在指定时间内如果mqtt返回的数据与手指操作产生的数据一致，则不更新对应指示器的位置
        degreeTimer: {
          timer: null,
          data: {},
        },
      },
      deviceDisableModal: false,
      isInit: false,
    };
  },
  methods: {
    ...mapMutations([
      "setAirDuration",
      "setOldTemperature",
      "setAirConditionMode",
      "setWindSpeed",
      "setAirConditionStatus",
      "setLightStatus",
      "setGlobalDeviceStatus",
      "setDataToNative",
      "setGlobalMac",
      "setDeviceDetail",
      "setLightOnStatus",
      "setElectriDefaultLightStatus",
      "setChildMode",
      "setAirTimer",
    ]),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    deviceDisabled() {
      this.deviceDisableModal = true;
    },
    // 离线状态下触摸刻度尺
    onTouchDegree(event) {
      if (!this.isOnLine) {
        this.deviceDisableModal = true;
        event.preventDefault();
        return;
      }
      if (!this.isLightOn) {
        this.deviceDisableModal = true;
        event.preventDefault();
        return;
      }
    },
    hideModal(event, type) {
      if (type === "speed") {
        this.ModalShow.windSpeed = false;
      } else if (type === "mode") {
        this.ModalShow.mode = false;
      }
    },
    stopEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    // 手指是否正在触摸某个组件
    onFingerTouch(flag, type) {
      this.onFingerTouching = flag;
    }, // 模式选择
    async onSelectMode($event, item) {
      const params = {
        cmdKey: this.getModeById(item.id).cmdKey,
        cmdValue1: "",
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        const oldMode = this.getAirConditionMode;
        this.timer.modeTimer = setTimeout(() => {
          // console.log("执行了定时器modeTimer，oldMode：", oldMode);
          this.setAirConditionMode(oldMode);
        }, 4000);
        this.setAirConditionMode(item.id);
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
        const oldSpeed = this.getWindSpeed;
        this.timer.speedTimer = setTimeout(() => {
          // console.log("执行了定时器speedTimer，oldSpeed：", oldSpeed);
          this.setWindSpeed(oldSpeed);
        }, 4000);
        this.setWindSpeed(item.id);
      }
      this.hideModal($event, "speed");
    },
    // 模式、风速弹框
    showModal(type) {
      if (!this.isOnLine || !this.isLightOn) {
        this.deviceDisableModal = true;
        return;
      }
      if (type === "speed" && this.modeObject.canHandleSpeed) {
        this.ModalShow.windSpeed = true;
        return;
      }
      if (type === "mode") {
        this.ModalShow.mode = true;
      }
    },
    // 开关切换
    onSwithChange(data) {
      if (!this.isOnLine) {
        this.deviceDisableModal = true;
        return;
      }
      if (this.timer.toggleTimer) return;
      this.handleToggle();
    },
    // 刻度变化
    onSlide(value, isTouchEnd, isHint) {
  
      if (this.childMode && isHint) {
        this.childModeMsgModal = true;
      }

      if (this.startDegree == value && isHint) {
        return;
      }
 
      let _value =
        value >= this.endDegree
          ? this.endDegree
          : value <= this.startDegree
          ? this.startDegree
          : value;
      if(this.onFingerTouching) {
         this.degree = _value;
      }  
      if (isTouchEnd) {
        if (
          this.childMode &&
          this.getOldTemperature == 25 &&
          this.degree == 25
        ) {
          return;
        }
        // console.log("赋值hou温度:",value)
        execNativeFunc("onVibrate", 50);
        this.handleDegreeChange(_value);
      }
    },
    _getWindowHeight(flag) {
      this.$nextTick(() => {
        let node = document.querySelector("#app");
        this.windowHeight = node && node.getBoundingClientRect().height;
      });
    },
    setDegreeSlideValue(value) {
      this.$refs.degreeSlideComp._initDegree(value); // 刻度是从0开始要减去初始的刻度值
      this.$refs.degreeSlideComp.setLinesOffset();
    },
    // 初始化数据
    _initData(data = {}, isFromMQTT = false) {
      const deviceData = formatMQTTData(data);
      // console.log(deviceData);
      if (
        isNumber(deviceData.airConditionTempratureMin) &&
        this.deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] ===
          deviceZigbeeType.AirConditioning
      ) {
        deviceData.isChildMode = deviceData.airConditionTempratureMin == 25; // 旧版VRV空调儿童模式判断
      }
      if (deviceData) {
        if (isBoolean(deviceData.isOnLine)) {
          // 设备在线状态
          this.isOnLine = deviceData.isOnLine;
          // if (!this.isOnLine) {
          //   return;
          // }
        }
        if (isBoolean(deviceData.isChildMode)) {
          this.setChildMode(deviceData.isChildMode);
          clearTimeout(this.childModeTimer);
          this.childModeTimer = 0;
          this.handleChildMode(deviceData.isChildMode);
        }
        if (isBoolean(deviceData.isLightOn) && this.isOnLine) {
          // 设备开关状态
          if (this.isLightOn == deviceData.isLightOn) {
            clearTimeout(this.timer.statusTimer);
          }
          this.isLightOn = Boolean(deviceData.isLightOn);
          if (!this.isLightOn) {
            this.setAirDuration(0);
            clearTimeout(this.getAirTimer);
          }
          this.setDegreeSlideValue(this.degree - this.startDegree);
        }
        // if (this.isLightOn) {
        if (isNumber(deviceData.airConditionTemprature)) {
          // 空调温度
          let _value =
            deviceData.airConditionTemprature > 32
              ? 32
              : deviceData.airConditionTemprature < this.startDegree
              ? this.startDegree
              : deviceData.airConditionTemprature;
          // console.log('_value:', _value, 'this.degree:', this.degree)
          // console.log("接收到的温度：",_value, "；自调温度数组:", JSON.stringify(this.changeTemperatureList), "；自调定时器数组:", JSON.stringify(this.changeTemperatureTimeoutList));
          if (isFromMQTT) {
            let index = this.changeTemperatureList.indexOf(_value);
            // console.log(index)
            if (index >= 0) {
              // clearTimeout(this.changeTemperatureTimeoutList[index]);
              // console.log(
              //   "清除了定时器：",
              //   this.changeTemperatureTimeoutList[index]
              // );
              this.changeTemperatureList.length >= index && this.changeTemperatureList.splice(index, 1);
              if(this.changeTemperatureList.length == 0){
                clearTimeout(this.timer.degreeTimer)
              }
              // this.changeTemperatureTimeoutList.length >= index && this.changeTemperatureTimeoutList.splice(index, 1);
            } else {
              if (this.onFingerTouching) return;
              
              this.degree = Math.round(Number(_value));
              // console.log("变更了");
              this.setOldTemperature(this.degree);
              this.setDegreeSlideValue(this.degree - this.startDegree); // 刻度是从0开始要减去初始的刻度值
            }
          } else {
            console.log("not mqtt");
            this.degree = Math.round(Number(_value));
            this.setOldTemperature(this.degree);
            this.setDegreeSlideValue(this.degree - this.startDegree); // 刻度是从0开始要减去初始的刻度值
          }
        }
        // 空调模式
        if (isNumber(deviceData.airConditionTempratureMode)) {
          if (
            this.getAirConditionMode == deviceData.airConditionTempratureMode
          ) {
            clearTimeout(this.timer.modeTimer);
          }
          this.setAirConditionMode(deviceData.airConditionTempratureMode);
        }
        // 风速模式
        if (isNumber(deviceData.airConditionWindSpeed)) {
          if (this.getWindSpeed == deviceData.airConditionWindSpeed) {
            clearTimeout(this.timer.speedTimer);
          }
          this.setWindSpeed(deviceData.airConditionWindSpeed);
        }
        // }

        // this.setGlobalDeviceStatus(4)
        // this.isOnLine = false
      }
    },
    handleChildMode(isChildMode) {
      const temperatureRange = getTemperatureRange(
        deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum],
        isChildMode
      );

      // if (this.degree < temperatureRange.minTemperature) {
      //   this.degree = temperatureRange.minTemperature;
      // }
      this.startDegree = temperatureRange.minTemperature;
      // 启用儿童模式，手动发送最低温度指令
      if (this.degree < this.startDegree) {
        this.handleDegreeChange(this.startDegree);
      }
      this.maxUnit = this.endDegree - this.miniDegree + 1;
      this.setDegreeSlideValue(this.degree - this.startDegree); // 刻度是从0开始要减去初始的刻度值
    },
    onAlarmSet(data) {
      this.setAlarm(data);
    },
    onAlarmCancel() {
      this.setAirDuration(0);
      clearTimeout(this.getAirTimer);
      this.setAirTimer(0);
      // console.log('this.getAirTimer:',this.getAirTimer,'this.getAirDuration:',this.getAirDuration)
    },
    onChildModeChange(newValue, oldValue) {
      clearTimeout(this.childModeTimer);
      const oldVal = oldValue;
      this.childModeTimer = setTimeout(() => {
        this.handleChildMode(oldVal);
      }, 4000);
      this.handleChildMode(newValue);
      getTemperatureRange;
    },
    setAlarm(data) {
      let { countDownTime, closeTime, cloudTime } = data; 
      if (closeTime) {
        closeTime = closeTime.replace(/-/g, "/");
      }
      if (cloudTime) {
        cloudTime = cloudTime.replace(/-/g, "/");
      }
      // console.log(closeTime,cloudTime)
      const ct_end = new Date(closeTime).getTime();
      const ct_start = new Date(cloudTime).getTime();
      if (isNumber(ct_end) && isNumber(ct_start)) {
        let duration = ct_end - ct_start;
        if (Math.floor(duration / 1000 / 60) > countDownTime) {
          duration -= 100;
        }
        this.setAirDuration(duration);
        const next = duration % 60000;
        // console.log(next)
        this.setAirTimer(
          setTimeout(() => {
            this.setAirDuration(duration - next);
            clearTimeout(this.getAirTimer);
            this.setAirTimer(0);
            this.alarmChange();
          }, next)
        );
      } else {
        this.setAirDuration(0);
         clearTimeout(this.getAirTimer);
      }
    },
    alarmChange() {
      this.setAirTimer(
        setTimeout(() => {
          this.setAirDuration(this.getAirDuration - 60 * 1000);
          // console.log(this.getAirDuration);
          if (this.getAirDuration > 0) {
            this.alarmChange();
          } else {
            this.setAirDuration(0);
            clearTimeout(this.getAirTimer);
            this.setAirTimer(0);
          }
        }, 60 * 1000 - 4)
      );
    },
    // 初始化获取数据
    getData() {
      this.getDeviceData();
    },
    async getDeviceData() {
      if(this.isLoading) {
        return
      }
      this.isLoading = true
      let { data, error } = await deviceDetailRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType,
      });
      this.isLoading = false
      if (data && !error) {
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        if (data.data.airConditioning) {
          this.setAlarm(data.data.airConditioning);
        }
        const deviceData = formatMQTTData(data.data);
        const temperatureRange = getTemperatureRange(
          deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum],
          deviceData.isChildMode
        );
        this.endDegree = temperatureRange.maxTemperature;
        this.startDegree = temperatureRange.minTemperature;
        this.maxUnit = this.endDegree - this.miniDegree + 1;
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
        if (!this.isInit) {
          // 只执行一次
          this.$refs.upgradeModal.checkUpgrade();
        }
        this.isInit = true;
        this.$refs.nsem.checkNetStatus();

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
      };
      params.cmdKey = this.isLightOn ? this.cmdKey.CLOSE : this.cmdKey.OPEN;

      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.timer.toggleTimer = setTimeout(() => {
          clearTimeout(this.timer.toggleTimer);
          this.timer.toggleTimer = 0;
        }, 300);
        this.setAirDuration(0);
        clearTimeout(this.getAirTimer)
        const AirDuration = this.getAirDuration;
        const oldLightOn = this.isLightOn;
        this.timer.statusTimer = setTimeout(() => {
          const oldVal = AirDuration - 4000 > 0 ? AirDuration - 4000 : 0;
          this.setAirDuration(oldVal);
          // console.log("执行了定时器statusTimer，oldLightOn：", oldLightOn);
          this.isLightOn = oldLightOn;
        }, 4000);
        this.isLightOn = !this.isLightOn;
      }
    },
    async handleDegreeChange(value) {
      let params = {
        cmdKey: this.cmdKey.SET_TEMPERATURE,
        cmdValue1:
          deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] ===
          deviceZigbeeType.VRV2
            ? value
            : value * 10,
        endpointId: this.globalDataId,
      };
      
      // ge
       let { data, error } = await endpointControlRep(params);
      // const miles = (Math.random() > 0.4 ? 0.38 : Math.random() ) * 4000

      // setTimeout(() => {
      //   const msg = this.generate(params.cmdValue1)
      //         console.log("from simulate mqtt", msg);
      //   this._initData(msg, true)
      // }, miles)
      
      // let { data, error } = { data: 1, error: null}
      if (data && !error) {
        // 调温度之前设置定时器，4秒之后没收到MQTT消息恢复原来的温度
      this.degree = value;
      this.$forceUpdate();
      // console.log("this.degree:", this.degree, "value:", value);
      const oldDegree = this.getOldTemperature;
      this.changeTemperatureList.push(value);
      if(this.timer.degreeTimer) {
        clearTimeout(this.timer.degreeTimer)
      }
      this.timer.degreeTimer = setTimeout(() => {
        if (this.onFingerTouching) return;
        // console.log(
        //   "执行了定时器degreeTimer，oldDegree：",
        //   oldDegree, 
        // );
        this.getData()
        // this.degree = oldDegree;
        // this.setOldTemperature(oldDegree);
        // this.setDegreeSlideValue(oldDegree - this.startDegree);
      }, 4000);

      // this.changeTemperatureTimeoutList.push(timeout_id);
      // console.log('下发了温度:', value, ";设置了定时器:", timeout_id, "预计"+ miles + "毫秒后接受到消息；","当前时间戳：", Date.now())
      this.setOldTemperature(value);
      } else {
        let timer = setTimeout(() => {
          this._initData(this.deviceDetail);
          timer && clearTimeout(timer);
        }, 1000);
      }
    },
    getModeById(id) {
      const list = getModeList(
        deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]
      );
      const item = list.find((s) => s.id == id);
      if (item) {
        return {
          icon: item.icon,
          shadow: item.shadow,
          cmdKey: item.cmdKey,
          name: item.name,
          id: item.id,
          img: item.img,
          canHandleDegree: item.canHandleDegree,
          showDegree: item.showDegree,
          canHandleSpeed: item.canHandleSpeed,
        };
      } else {
        return getModeList(
          deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]
        )[0];
      }
    },
    getSpeedById(id) { 
      const list = getSpeedList(
        deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]
      ) || []
      const item = list.find((s) => s.id == id);
      if (item) {
        return {
          icon: item.icon,
          name: item.name,
          cmdKey: item.cmdKey,
          cmdValue: item.cmdValue,
          id: item.id,
        };
      } else {
        return list[0];
      }
    },
    generate(temperate) {
      return {
        attrs: [{
        attrHex: 4278190102,
        attrValue: temperate
      },{
        attrHex: 15855616,
        attrValue: "1"
        } 
      ],
      deviceId: this.deviceDetail.dataId,
      deviceMac: this.deviceDetail.deviceMac,
      deviceName: this.deviceDetail.deviceName, 
      id: this.deviceDetail.deviceMac + '_' +  this.deviceDetail.endpointIndex,
      name: this.deviceDetail.deviceName,
      status: 1
      } 
    }
  },
  watch: {
    globalMattData(newV, oldV) {
      // console.log(newV);
      const attrs = newV
        .filter(
          (item) =>
            item.endpointIndex == -1 ||
            item.endpointIndex == this.deviceDetail.endpointIndex
        )
        .map((item) => item.attrs)
        .reduce((acc, i) => {
          acc.push(...i);
          return acc;
        }, []);
      const res = newV.reduce((acc, item) => {
        return Object.assign(acc, item);
      });
      res.attrs = attrs;
      // const c_res = JSON.parse(JSON.stringify(res))
      // Object.keys(c_res).forEach(key => { if(c_res[key] == null) { delete c_res[key] } })
      // console.log("from mqtt", c_res);
      this._initData(res, true);
    },
    globalDeviceStatus(newV) {
      this.isLightOn = Number(newV) === 1 || Number(newV) === 5;
    },
  },
  computed: {
    ...mapGetters([
      "getOldTemperature",
      "getAirConditionMode",
      "getWindSpeed",
      "airConditionStatus",
      "deviceDataModify",
      "globalDeviceType",
      "globalData",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "childMode",
      "getAirTimer",
      "getAirDuration",
    ]),
    showDegree() {
      return this.modeObject.showDegree;
    },
    // 送风模式不能调节温度
    canHandleDegree() {
      return this.modeObject.canHandleDegree;
    },
    // 模式选项（风机盘管没有除湿）
    modeOptions() {
      return getModeOptions(deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]);
    },
    // 风速选项（新空调没有自动选项）
    windSpeedList() {
      return getSpeedOptions(
        deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum]
      );
    },
    // 当前模式
    modeObject() {
      return this.getModeById(this.getAirConditionMode);
    },
    // 当前风速
    speedObject() {
      return this.getSpeedById(this.getWindSpeed);
    },
    // VRV2指令、风机盘管区分开来
    cmdKey() {
      return deviceZigbeeType[this.deviceDetail.zigbeeTypeEnum] ===
        deviceZigbeeType.VRV2
        ? CMD_KEY_VRV2
        : CMD_KEY;
    },
    // 当前空调状态背景图片
    svgPic() {
      if (!this.isLightOn || !this.isOnLine) {
        return closedPic;
      } else {
        return this.modeObject.img;
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
            if (result.type == 2) {
              clearTimeout(this.getAirTimer);
              this.setAirTimer(0);
              this.setAirDuration(0);
              this.changeTemperatureList = [];
              this.changeTemperatureTimeoutList = [];
            }
            //  app回到前台
            if (result.type == 3) {
              clearTimeout(this.getAirTimer);
              this.setAirTimer(0);
              this.setAirDuration(0);
              this.getData();
            }
          }
        } catch (error) {
          console.log("onPageChange Error:", error);
        }
      }
    };
  },
};
</script>
<style lang="less">
#aircondition {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  color: rgba(0, 0, 0, 0.6);
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;
  &.active {
    color: #000;
  }
  .offline {
    color: #c0c0cd;
  }
  .turnoff{
    opacity: 0.6;
  }
  .disabled {
    color: rgba(0, 0, 0, 0.6);
  }
  .air-wrap {
    font-size: 0;
    position: relative;
    .air {
      position: relative;
      width: 530px;
      height: 440px;
      margin-top: 140px;
      z-index: 5;
    }
  }
  .degree-wrap {
    position: absolute;
    right: 0;
    height: 800px;
    top: 168px;
    width: 200px;
    overflow: hidden;
  }
  .degrees {
    margin-left: 80px;
    display: flex;
    flex-direction: column;
    .degree-num {
      line-height: 160px;
      font-size: 160px;
      font-weight: bold;
      color: #2f2f4a;
    }
    .degree-text {
      line-height: 32px;
      font-size: 32px;
      font-weight: bold;
      color: #767676;
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
    justify-content: space-between;
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
    bottom: -360px;
    right: 0;
    left: 0;
    height: 360px;
    background-color: #d1d1d1;
    box-shadow: 0px -4px 40px 0px rgba(0, 0, 0, 0.06);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    display: flex;
    flex-direction: column;
    z-index: 9;
    transition: bottom 0.15s linear;
    &.active {
      bottom: 0;
    }
    .icon {
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
        box-shadow: #ebeff5 0px 8px 5px 0px;
      }
      .active {
        box-shadow: #f8f1f1 0px 8px 5px 0px;
      }
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
      background-color: rgba(0, 0, 0, 0.2);
    }
    .content {
      position: relative;
      width: 100%;
      height: 100%;
      background: #f9f9f9;
      z-index: 2;
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}
</style>
