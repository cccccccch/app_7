<template>
  <!-- MFCMode 有些开关也会有161的值 -->
  <div
    class="device-item"
    :class="{
      active:
        deviceResult.isOnLine &&
        (deviceResult.isLightOn ||
          deviceStyleType === 4 ||
          deviceStyleType === 5 ||
          deviceStyleType === 6 ||
          deviceStyleType === 8 ||
          deviceStyleType === 10 ||
          (deviceResult.MFCMode && detail.zigbeeTypeEnum === 'MFC') ||
          MFCType ||
          deviceStyleType === 9),
      'type-one': deviceStyleType === 1 || deviceStyleType === 6,
      'type-two': deviceStyleType === 2,
      'type-three': deviceStyleType === 3 || deviceStyleType === 4 || deviceStyleType === 5 || deviceStyleType === 7 || deviceStyleType === 8 || deviceStyleType === 9 || deviceStyleType === 10,
    }"
  >
    <div class="head" @click="onChangeStatus" v-if="deviceStyleType !== 4 && deviceStyleType !== 5 && deviceStyleType !== 10">
      <span
        class="txt"
        v-if="deviceStyleType !== 3 && deviceStyleType !== 8 && detail.zigbeeTypeEnum !== 'SceneSelector' && detail.ifSceneConvertedEnum !== 'yes' && deviceStyleType !== 9"
        :class="{ show: deviceResult.isOnLine && deviceResult.isLightOn }"
        >ON</span
      >
      <span
        class="icon"
        :class="{ right: deviceResult.isOnLine && (deviceResult.isLightOn || deviceStyleType === 6 || (deviceResult.MFCMode && detail.zigbeeTypeEnum === 'MFC') || deviceStyleType === 9) }"
      >
      <!-- //绑定了正常的时候 -->
        <img class="icon-device-pic" :src="isImgLoadSuc ? (detail.typeIconUrlAbs ? detail.typeIconUrlAbs : detail.statecIconUrlAbs) : curDeviceBg" alt="" />
      </span>
      <span
        class="txt"
        v-if="
          detail.ifSceneConvertedEnum !== 'yes' && detail.zigbeeTypeEnum !== 'SceneSelector' && (!deviceResult.isLightOn || !deviceResult.isOnLine) && deviceStyleType !== 3 && deviceStyleType !== 8
        "
        :class="{
          show:
            (deviceResult.isOnLine && !deviceResult.isLightOn && deviceStyleType !== 9) ||
            (detail.ifSceneConvertedEnum !== 'yes' && deviceStyleType !== 3 && deviceStyleType !== 8 && deviceStyleType !== 9),
        }"
      >
        OFF
      </span>
      <div
        class="circle-loading"
        :class="{
          active1: loadingDeviceData.active && (deviceStyleType === 1 || deviceStyleType === 6),
          active2: loadingDeviceData.active && deviceStyleType === 2,
          active3: loadingDeviceData.active && (deviceStyleType === 3 || deviceStyleType === 4 || deviceStyleType === 5 || deviceStyleType === 7 || deviceStyleType === 8 || deviceStyleType === 10),
        }"
      ></div>
    </div>
    <div class="head" v-else @click="clickCurtainHead">
      <span class="icon" :class="{ right: deviceResult.isOnLine }">
        <img class="icon-device-pic" :src="isImgLoadSuc ? (detail.typeIconUrlAbs ? detail.typeIconUrlAbs : detail.statecIconUrlAbs) : curDeviceBg" />
      </span>
      <div class="curtain-svg-icon-wrap" :class="{ right: !deviceResult.isOnLine }">
        <img class="curtain-svg-icon close" v-if="deviceStyleType === 4" @click="clickCurtainAll(0)" src="../../../assets/images/device-icon/curtain_all_close.svg" alt="" />
        <img class="curtain-svg-icon open" v-if="deviceStyleType === 4" @click="clickCurtainAll(1)" src="../../../assets/images/device-icon/curtain_all_open.svg" alt="" />
        <!-- 非多功能控制器卷帘电机-->
        <template v-if="deviceStyleType === 10">
          <span
            class="curtain-svg-icon iconfont icon-down mr30"
            @click="clickCurtainAll(0)"
            :style="{ opacity: deviceResult.curtainMaxMinPoints === 3 || detail.ifLogicGroupEnum === 'yes' ? 1 : 0.4 }"
            v-if="!curtainBind || (curtainBind && getCurtainTypeCodes[curtainBind.typeCode] !== 1)"
          ></span>
          <span
            class="curtain-svg-icon iconfont icon-down up"
            :style="{ opacity: deviceResult.curtainMaxMinPoints === 3 || detail.ifLogicGroupEnum === 'yes' ? 1 : 0.4 }"
            @click="clickCurtainAll(1)"
          ></span>
          <span
            class="curtain-svg-icon iconfont icon-down ml30"
            :style="{ opacity: deviceResult.curtainMaxMinPoints === 3 || detail.ifLogicGroupEnum === 'yes' ? 1 : 0.4 }"
            @click="clickCurtainAll(0)"
            v-if="curtainBind && getCurtainTypeCodes[curtainBind.typeCode] === 1"
          ></span>
        </template>
        <!-- 多功能控制器 2.2.0以上 -->
        <template v-if="deviceStyleType === 5 && globalAppVersion >= 20200">
          <span class="curtain-svg-icon iconfont icon-down mr30" @click="clickCurtainAll(1)"></span>
          <span class="curtain-svg-icon iconfont icon-down up" @click="clickCurtainAll(0)" v-if="!curtainBind || (curtainBind && getCurtainTypeCodes[curtainBind.typeCode] === 8)"></span>
          <span class="curtain-svg-icon iconfont icon-down ml30" @click="clickCurtainAll(0)" v-if="curtainBind && getCurtainTypeCodes[curtainBind.typeCode] !== 8"></span>
        </template>
        <!-- 多功能控制器 2.2.0以下 -->
        <template v-if="deviceStyleType === 5 && globalAppVersion < 20200">
          <span class="curtain-svg-icon iconfont icon-down mr30" @click="clickCurtainAll(0)" v-if="curtainBind && getCurtainTypeCodes[curtainBind.typeCode] !== 8"></span>
          <span class="curtain-svg-icon iconfont icon-down up" @click="clickCurtainAll(1)"></span>
          <span class="curtain-svg-icon iconfont icon-down ml30" @click="clickCurtainAll(0)" v-if="!curtainBind || (curtainBind && getCurtainTypeCodes[curtainBind.typeCode] === 8)"></span>
        </template>
      </div>
    </div>
    <div class="info" @click="goToNative(8)">
      <p class="title">{{ detail.deviceName || detail.name }}</p>
      <p class="detail">
        <span class="statusText">{{ statusText }}</span>
        <span class="room-name" v-if="showRoomName && ifRead">{{ detail.goalDeviceRoomName || detail.roomName }}</span>
        <span class="new-device" v-if="!ifRead">NEW</span>
      </p>
    </div>
  </div>
</template>
<script>
import air_condition_icon from "../../../assets/images/device-icon/air_condition.png";
import audio_icon from "../../../assets/images/device-icon/audio.png";
import camera_icon from "../../../assets/images/device-icon/camera.png";
import curtain_100_icon from "../../../assets/images/device-icon/curtain_100.png";
import curtain_open_close_icon from "../../../assets/images/device-icon/curtain_open_close.png";
import curtain_roll_icon from "../../../assets/images/device-icon/curtain_roll.png";
import curtain_rome_icon from "../../../assets/images/device-icon/curtain_rome.png";
import door_icon from "../../../assets/images/device-icon/door.png";
import floor_heating_icon from "../../../assets/images/device-icon/floor_heating.png";
import gas_icon from "../../../assets/images/device-icon/gas.png";
import glass_4_panel_icon from "../../../assets/images/device-icon/glass_4_panel.png";
import glass_5_panel_icon from "../../../assets/images/device-icon/glass_5_panel.png";
import key_sensor_icon from "../../../assets/images/device-icon/key_sensor.png";
import lamp_icon from "../../../assets/images/device-icon/lamp.png";
import led_icon from "../../../assets/images/device-icon/led.png";
import light_icon from "../../../assets/images/device-icon/light.png";
import light_switch_icon from "../../../assets/images/device-icon/light_switch.png";
import lock_icon from "../../../assets/images/device-icon/lock.png";
import man_exist_icon from "../../../assets/images/device-icon/man_exist.png";
import motion_icon from "../../../assets/images/device-icon/motion.png";
import plug_icon from "../../../assets/images/device-icon/plug.png";
import scene_4_panel_icon from "../../../assets/images/device-icon/scene_4_panel.png";
import smoke_sensor_icon from "../../../assets/images/device-icon/smoke_sensor.png";
import sound_light_icon from "../../../assets/images/device-icon/sound_light.png";
import temprature_icon from "../../../assets/images/device-icon/temprature.png";
import water_icon from "../../../assets/images/device-icon/water.png";
import wind_icon from "../../../assets/images/device-icon/wind.png";
import p1_icon from "../../../assets/images/device-icon/p1.png";
import p1s_icon from "../../../assets/images/device-icon/p1s.png";
import p2_icon from "../../../assets/images/device-icon/p2.png";
import p3_icon from "../../../assets/images/device-icon/p3.png";
import p6_icon from "../../../assets/images/device-icon/p6.png";
import rc01_icon from "../../../assets/images/device-icon/rc01.png";
import rc03_icon from "../../../assets/images/device-icon/rc03.png";
import { formatMQTTData } from "../../../utils/socketUtil";
import { endpointControlRep, gatewayDeviceSetReadRep, onDeviceClickRep } from "../../../api/request";
import { execNativeFunc } from "../../../utils/bridge";
import { mapMutations, mapActions, mapGetters } from "vuex";
export default {
  name: "deviceItem",
  props: {
    detail: {
      type: Object,
      default() {
        return {};
      },
    },
    showRoomName: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      deviceBgList: {
        air_condition_icon,
        audio_icon,
        camera_icon,
        curtain_100_icon,
        curtain_open_close_icon,
        curtain_roll_icon,
        curtain_rome_icon,
        door_icon,
        floor_heating_icon,
        gas_icon,
        glass_4_panel_icon,
        glass_5_panel_icon,
        key_sensor_icon,
        lamp_icon,
        led_icon,
        light_icon,
        light_switch_icon,
        lock_icon,
        man_exist_icon,
        motion_icon,
        plug_icon,
        scene_4_panel_icon,
        smoke_sensor_icon,
        sound_light_icon,
        temprature_icon,
        water_icon,
        wind_icon,
        p1_icon,
        p2_icon,
        p3_icon,
        p6_icon,
        rc01_icon,
        rc03_icon,
      },
      deviceZigbee2IconMap: {
        // 客厅 灯
        OnOffSwitch: "light_switch_icon",
        // 网关
        // HomeGateway: "ZIGBEE_TYPE_HOME_GATEWAY",
        // 插头
        Plug: "plug_icon",
        // 门锁
        DoorLock: "lock_icon",
        // 调光灯
        ColorTempLight: "light_icon",
        // RGB调光灯
        RgbCw: "light_icon",
        // 窗帘
        WindowCover: "curtain_open_close_icon",
        // 空调
        AirConditioning: "air_condition_icon",
        // 温控器-风机盘管
        TemperatureController: "air_condition_icon",
        // 地暖
        FloorHeater: "floor_heating_icon",
        // 新风机
        AirFresher: "wind_icon",
        // 入墙式插座
        WallSocket: "plug_icon",
        // LS11
        PortableSocket1: "plug_icon",
        // LS12
        PortableSocket2: "plug_icon",
        //P1S继电器开关
        RelayOnOff: "light_switch_icon",
        //人体传感器
        LivingSensor: "motion_icon",
        //门磁传感器
        DoorSensor: "door_icon",
        //水浸传感器
        WaterSensor: "water_icon",
        //人体存在传感器
        HumanSensor: "man_exist_icon",
        //温湿度传感器
        THSensor: "temprature_icon",
        //烟雾传感器
        SmokeSensor: "smoke_sensor_icon",
        //可燃气体传感器
        CGasSensor: "gas_icon",
        //按键报警器
        KeyFob: "key_sensor_icon",
        //声光报警器
        AVAlarm: "sound_light_icon",
        //全彩灯 全彩调光灯
        RGBCW2: "light_icon",
        //颜色灯
        RGB: "light_icon",
        //色温灯
        CW: "light_icon",
        //单色调光灯 (亮度灯)
        DimmingLamp: "light_icon",

        // 屏类
        Screen: "p3_icon",
        // P2门铃机-WinBell
        P2: "p2_icon",
        // P1S
        P1S: "p1s_icon",
        // p3
        P3: "p3_icon",
        // P1
        P1: "p1_icon",
        // P1Mini
        P1Mini: "p6_icon",
        p6: "p6_icon",
      },
      isActive: false,
      deviceResult: {
        MFCMode: null, // 多功能控制器模式: 161-电机模式， 162-门禁模式，163-485模式
      },
      curDeviceBg: "",
      // 设备卡片默认颜色类别 1灯，2空调类，3默认，4开合窗帘, 5多功能控制器的幕布/窗帘电机,
      // 6开关转情景, 7 插座（有开关功能）, 8 屏系列, 9 zigbee门锁
      // 10 非多功能控制器的卷帘电机
      deviceStyleType: 3,
      statusText: "",
      curtainTimer: null,
      MFCType: null, // 多功能控制器控制的类型， 用于执行时是否转圈显示
      loadingDeviceData: {
        timer: null,
        active: false,
      },
      isImgLoadSuc: false,
      ifRead: false,
      lastOnOffSwithDeviceStatus: null, // 上次onOffSwithDeviceStatus值，用作比较，避免陷入无限循环获取数据
    };
  },
  watch: {
    detail: {
      handler: function (val, oldVal) {
        if (val) {
          this.handleRender(val);
          this.getIconType();
          this.ifRead = !val.ifReadEnum || (val.ifReadEnum && val.ifReadEnum === "yes") || this.ifRead;
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapMutations(["setNavigateType", "setDeviceItem"]),
    ...mapActions(["deviceItemDetailAction"]),
    goToNative(type) {
      this.$emit("onNavigateTo");
      this.setNewDeviceRead();
      this.setNavigateType({ type });
      execNativeFunc("onNavigateTo", { type: type, data: this.detail });
    },
    handleRender(data = this.detail) {
      // console.log(this.detail,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      let result = formatMQTTData(data);
      console.log(result,'resultresultresult')
      if (result) {
        if (this.deviceResult.MFCMode && Number(result.MFCMode) !== this.deviceResult.MFCMode) {
          // 当存在MFCMode且不相等的时候，说明MQTT上报了另一种类型的数据
          this.detail && this.detail.dataId && this.deviceItemDetailAction({ dataId: this.detail.dataId, dataTypeEnum: this.detail.dataTypeEnum });
        }
        for (let key in result) {
          if (key === "isLightOn" && result.isLightOn === null && result.isOnLine) {
            // 有些设备，比如联排只有在线离线等状态，没有开关的属性，所以只要是在线，就属于开
            this.$set(this.deviceResult, key, true);
          } else {
            this.$set(this.deviceResult, key, result[key]);
          }
        }
        // console.log(this.deviceResult,'this.deviceResultqqqqqq')
        this.curtainTimer && clearTimeout(this.curtainTimer);
        this.curtainTimer = null;
      }
    },
    getIconType() {

      let type = this.detail.zigbeeTypeEnum || "light_switch_icon";

      this.curDeviceBg = this.deviceBgList[this.deviceZigbee2IconMap[type]] || light_switch_icon;
      if (
        type === "OnOffSwitch" ||
        type === "ColorTempLight" ||
        type === "RgbCw" ||
        type === "RGBCW2" ||
        type === "RGB" ||
        type === "CW" ||
        type === "DimmingLamp" ||
        type === "RelayOnOff" ||
        type === "RGBCW3" ||
        type === "RGB3" ||
        type === "CW3" ||
        type === "DimmingLamp3" ||
        type === "RGBCW_BW" ||
        type === "CW_BW"
      ) {
        if (
          typeof this.deviceResult.onOffSwithDeviceStatus === "number" &&
          ((this.detail.ifSceneConvertedEnum === "yes" && this.deviceResult.onOffSwithDeviceStatus === 0) ||
            (this.detail.ifSceneConvertedEnum === "no" && this.deviceResult.onOffSwithDeviceStatus !== 0)) &&
          this.lastOnOffSwithDeviceStatus !== this.deviceResult.onOffSwithDeviceStatus
        ) {
          this.lastOnOffSwithDeviceStatus = this.deviceResult.onOffSwithDeviceStatus;
          this.deviceItemDetailAction({ dataId: this.detail.dataId, dataTypeEnum: this.detail.dataTypeEnum });
          return;
        }
        if (this.detail.ifSceneConvertedEnum === "yes") {
          this.deviceStyleType = 6;
        } else {
          this.deviceStyleType = 1;
        }
      } else if (type === "AirConditioning" || type === "TemperatureController" || type === "FloorHeater" || type === "AirFresher" || type === "VRV2") {
        this.deviceStyleType = 2;
      } else if (type === "MFC") {
        this.deviceStyleType = 3;
        // 多功能控制器 目前绑定了四种设备，开合帘，卷帘，幕布，门禁
        // DownUp  幕布反向升降模式
        // Click  门禁触发模式 门
        // UpDown  卷帘升降模式
        // OpenClose  开合帘开合模式
        // OnOff  开关模式 门
        // 先重置控制器绑定的状态
        this.MFCType = false;
        // console.log('进入页面之前',this.detail)
        if (
          this.detail.deviceBindInfoVoList &&
          this.detail.deviceBindInfoVoList.length &&
          this.detail.deviceBindInfoVoList[0] &&
          this.detail.deviceBindInfoVoList[0].bindDataList &&
          this.detail.deviceBindInfoVoList[0].bindDataList.length &&
          this.detail.deviceBindInfoVoList[0].bindDataList[0]
        ) {
          this.detail.typeIconUrlAbs = this.detail.deviceBindInfoVoList[0].bindDataList[0].typeIconOk;
          if (this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "OpenClose") {
            this.curDeviceBg = this.deviceBgList["curtain_open_close_icon"];
            this.deviceStyleType = 4;
          } else if (
            
            this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "Click" ||
            this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "OnOff" ||
            this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "EntranceGuard"
          ) {
            this.curDeviceBg = this.deviceBgList["door_icon"];
            this.MFCType = true;
          } else if (this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "DownUp" || this.detail.deviceBindInfoVoList[0].bindDataList[0].zigbeeTypeEnum === "UpDown") {
            this.curDeviceBg = this.deviceBgList["lamp_icon"];
            this.deviceStyleType = 5;
            this.MFCType = true;
          } else {
            this.curDeviceBg = this.deviceBgList["light_switch_icon"];
          }
        }
      } else if (type === "SceneSelector") {
        this.deviceStyleType = 3;
        if (this.detail.endpointList && this.detail.endpointList.length) {
          let len = this.detail.endpointList.length;
          if (len === 4) {
            this.curDeviceBg = this.deviceBgList["glass_4_panel_icon"];
          } else if (len === 5) {
            this.curDeviceBg = this.deviceBgList["glass_5_panel_icon"];
          } else {
            this.curDeviceBg = this.deviceBgList["light_switch_icon"];
          }
        }
      } else if (type === "WindowCover") {
        this.deviceStyleType = 4;
      } else if (type === "WallSocket" || type === "PortableSocket1" || type === "PortableSocket2") {
        this.deviceStyleType = 7;
      } else if (type === "P1" || type === "P1S" || type === "P2" || type === "P3" || type === "P1Mini" || type === "P6") {
        this.deviceStyleType = 8;
      } else if (type === "ZigbeeDoorLock") {
        this.deviceStyleType = 9;
      } else if (type === "RollCurtains") {
        this.deviceStyleType = 10;
      } else {
        this.deviceStyleType = 3;
      }
      //如果等于 4，5，10就不能控制
      this.setStatus();
      this.loadImg(this.detail.typeIconUrlAbs || this.detail.statecIconUrlAbs);
    },
    loadImg(url) {
      let that = this;
      let img = new Image();
      img.onload = function (e) {
        that.isImgLoadSuc = true;
      };
      img.src = url;
    },
    setStatus() {
        let result ='';
      if (this.deviceResult.isOnLine) {
        if (this.detail.zigbeeTypeEnum === "OnOffSwitch" && this.detail.ifSceneConvertedEnum === "yes") {
          // 开关转情景
          result = this.detail.bindSceneName || "暂未关联场景";
        } else if (this.deviceStyleType === 4 && !this.MFCType) {
          // 窗帘样式不一样，先判断是不是窗帘
          if (this.deviceResult.curtainPercent <= 0) {
            result = "全关";
          } else if (this.deviceResult.curtainPercent >= 100) {
            result = "全开";
          } else {
            result = `打开 ${this.deviceResult.curtainPercent}%`;
          }
        } else if (this.MFCType || this.deviceStyleType === 5 || this.deviceStyleType === 10) {
          result = "在线";
          if (this.deviceStyleType === 10 && !this.MFCType) {
            let p = this.deviceResult.curtainPercent;
            // 窗帘电机
            if (this.detail.ifLogicGroupEnum === "yes") {
              // 卷帘编组
              result = this.deviceResult.curtainPercent <= 0 ? "全关" : this.deviceResult.curtainPercent >= 100 ? "全开" : `打开 ${p}%`;
            } else {
              // 未绑定窗帘类型
              if (this.detail.ifDeviceSlotBind) {
                if (this.deviceResult.curtainPercent <= 0) {
                  result = this.getCurtainTypeCodes[this.curtainBind.typeCode] !== 1 ? "全关" : "全开";
                } else if (this.deviceResult.curtainPercent >= 100) {
                  result = this.getCurtainTypeCodes[this.curtainBind.typeCode] !== 1 ? "全开" : "全关";
                } else {
                  p = this.getCurtainTypeCodes[this.curtainBind.typeCode] !== 1 ? this.deviceResult.curtainPercent : Math.round(100 - this.deviceResult.curtainPercent);
                  result = `打开 ${p}%`;
                }
              }
            }
          }
        } else {
          if (this.deviceResult.isLightOn) {
            if (this.deviceStyleType === 1) {
              // 灯
              if (typeof this.deviceResult.degree === "number" && this.detail.ifLogicGroupEnum !== "yes") {
                result = `打开 ${Number(this.deviceResult.degree)}%`;
              } else {
                result = "打开";
              }
            } else if (this.deviceStyleType === 2) {
              // 空调当前模式 3-制冷，4-制热，7-送风，8-除湿，1-自动 自动不处理
              // VRV2: 2-制冷，1-制热，0-送风，7-除湿，3-自动
              if (this.detail.zigbeeTypeEnum !== "VRV2") {
                if (this.detail.zigbeeTypeEnum === "AirFresher") {
                  result = "打开";
                } else if (this.deviceResult.airConditionTempratureMode === 3) {
                  result = `制冷 ${this.deviceResult.airConditionTemprature}℃`;
                } else if (this.deviceResult.airConditionTempratureMode === 4) {
                  result = `制热 ${this.deviceResult.airConditionTemprature}℃`;
                } else if (this.deviceResult.airConditionTempratureMode === 7) {
                  result = "送风";
                } else if (this.deviceResult.airConditionTempratureMode === 8) {
                  result = "除湿";
                } else {
                  if (typeof this.deviceResult.airConditionTemprature === "number") {
                    result = `打开 ${this.deviceResult.airConditionTemprature}℃`;
                  } else {
                    result = `在线`;
                  }
                }
              } else {
                if (this.deviceResult.airConditionTempratureMode === 2) {
                  result = `制冷 ${this.deviceResult.airConditionTemprature}℃`;
                } else if (this.deviceResult.airConditionTempratureMode === 1) {
                  result = `制热 ${this.deviceResult.airConditionTemprature}℃`;
                } else if (this.deviceResult.airConditionTempratureMode === 0) {
                  result = "送风";
                } else if (this.deviceResult.airConditionTempratureMode === 7) {
                  result = "除湿";
                } else {
                  if (typeof this.deviceResult.measureTemprature === "number") {
                    result = `打开 ${this.deviceResult.measureTemprature}℃`;
                  } else {
                    result = `在线`;
                  }
                }
              }
            } else if (this.deviceStyleType === 7) {
              result = "打开";
            } else {
              result = "在线";
            }
          } else {
            if (this.detail.zigbeeTypeEnum === "MFC" || this.deviceStyleType === 8 || this.deviceStyleType === 9) {
              result = "在线";
            } else {
              result = "关闭";
            }
          }
        }
        // 如果有电量，当电量低于20%的时候，要提示电量低, 这里电量是0-200，也就是小于40的时候显示
        if (typeof this.deviceResult.sensorPowerValue === "number" && this.deviceResult.sensorPowerValue < 40) {
          result = "电量低";
        }
      } else {
        //// 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
        if (this.deviceResult.onLineValue === 0) {
          result = "离线";
        } else if (this.deviceResult.onLineValue === 4) {
          result = "离网";
        } else if (this.deviceResult.onLineValue === 7) {
          result = "配置中";
        } else {
          result = "";
        }
      }
      this.statusText = result;
    },
    // 点击窗帘类型的头部区域
    clickCurtainHead() {
      if (this.deviceResult.onLineValue === 0 || this.deviceResult.onLineValue === 4) {
        this.goToNative(8);
      }
    },
    onChangeStatus() {

      if (this.deviceResult.onLineValue === 0 || this.deviceResult.onLineValue === 4) {
 
        this.goToNative(8);
        return;
      }


      if (this.deviceStyleType === 3 && !this.MFCType) {

        this.goToNative(8);
        return;
      }
      if (this.detail.ifSceneConvertedEnum === "yes" || this.MFCType) {
        if (this.loadingDeviceData.timer || !this.deviceResult.isOnLine) return;
        if (this.detail.bindSceneId == "-1" && !this.MFCType) {
          this.$Toast.show({ title: "未绑定情景，请先绑定情景", postion: "middle" });
          return;
        }
        this.loadingDeviceData.active = true;
        this.loadingDeviceData.timer = setTimeout(() => {
          this.loadingDeviceData.active = false;
          this.loadingDeviceData.timer = null;
        }, 3000);
        !this.MFCType && this.execSceneConverted(this.detail); // 执行开关转情景所绑定的情景
        if (this.MFCType || this.deviceResult.MFCMode === 162) {
          this.onChange();
        }
        this.setNewDeviceRead();
        return;
      }
      if (this.deviceResult.isOnLine) {

        this.onChange();
      }
    },
    onChange() {
      let params = {
        endpointId: this.detail.dataId,
      };
      if (this.deviceStyleType === 1 && this.detail.zigbeeTypeEnum !== "SceneSelector") {
        // 灯组key: open/close, 单个灯: toggle.   value值随意， on/off皆可
        // 通过ifLogicGroupEnum判断是否是分组
        params.cmdKey = "toggle";
        let type = this.detail.ifLogicGroupEnum === "yes" ? "group" : "sigle";
        if (type === "group") {
          let value = this.deviceResult.isLightOn ? "close" : "open";
          params.cmdKey = value;
        }
        this.$set(this.deviceResult, "isLightOn", !this.deviceResult.isLightOn);
        this.handleExecCmd(params);
      } else if (this.deviceStyleType === 2) {
        // 空调类
        let value = "";
        if (this.detail.zigbeeTypeEnum === "VRV2") {
          // VRV指令不一样
          value = this.deviceResult.isLightOn ? "vrv2_close" : "vrv2_open";
        } else {
          value = this.deviceResult.isLightOn ? "close" : "open";
        }
        params.cmdKey = value;
        this.deviceResult.isLightOn = !this.deviceResult.isLightOn;
        this.handleExecCmd(params);
      } else if (
        this.detail.zigbeeTypeEnum === "WallSocket" ||
        this.detail.zigbeeTypeEnum === "PortableSocket1" ||
        this.detail.zigbeeTypeEnum === "PortableSocket2" ||
        this.detail.zigbeeTypeEnum === "MFC" ||
        this.deviceResult.MFCMode === 162
      ) {
        // 插座or门禁
        params.cmdKey = "toggle";
        this.$set(this.deviceResult, "isLightOn", !this.deviceResult.isLightOn);
        this.handleExecCmd(params);
      }
    }, // 发送指令到服务器
    async handleExecCmd(params) {
      execNativeFunc("onVibrate", 50);
      let result = await endpointControlRep(params);
      if (!result.data || result.error) {
        this.deviceResult.isLightOn = !this.deviceResult.isLightOn;
        this.$Toast.show({ title: "执行出错" });
      }
      this.setNewDeviceRead();

      this.setStatus();
    },
    async clickCurtainAll(type) {
      if (!this.deviceResult.isOnLine) return;
      execNativeFunc("onVibrate", 50);
      this.setNewDeviceRead();
      let cmdKey = "";
      let curtainCode = 0;
      // 窗帘和多功能控制器的幕布是反过来的
      if (this.deviceStyleType === 4) {
        cmdKey = type === 1 ? "windowCoveringUp" : "windowCoveringDown";
      } else {
        if (!this.deviceResult || (this.deviceResult.curtainMaxMinPoints !== 3 && !this.MFCType && this.detail.ifLogicGroupEnum !== "yes")) return;
        cmdKey = type === 0 ? "windowCoveringDown" : "windowCoveringUp";
        // 注意，这里的幕布包括多功能控制器的幕布和卷帘电机的幕布
        // 幕布点击up按钮下发的是windowCoveringDown
        if (this.curtainBind) {
          curtainCode = this.getCurtainTypeCodes[this.curtainBind.typeCode];
          if (curtainCode === 1 || curtainCode === 8) {
            cmdKey = type === 1 ? "windowCoveringDown" : "windowCoveringUp";
          }
        }
      }
      let params = {
        cmdKey: cmdKey,
        endpointId: this.detail.dataId,
      };
      // this.statusText = type === 1 ? "正在打开" : "正在关闭";
      let result = await endpointControlRep(params);
      if (!result.data || result.error) {
        this.$Toast.show({ title: "执行出错" });

        this.setStatus();
      } else {
        if (this.MFCType) return;
        this.curtainTimer = setTimeout(() => {
          this.statusText = type === 1 && curtainCode !== 1 ? "全开" : "全关";
          this.curtainTimer && clearTimeout(this.curtainTimer);
          this.curtainTimer = null;
        }, 4000);
      }
    },
    async setNewDeviceRead() {
      if (this.detail.ifRead === "yes") return;
      let result = await gatewayDeviceSetReadRep({ dataTypeEnum: this.detail.dataTypeEnum, gatewayId: this.detail.dataId });
      this.detail.ifRead = "yes";
      this.ifRead = true;
    },
    async execSceneConverted(item) {
      let result = await onDeviceClickRep({ dataId: item.dataId, dataTypeEnum: item.dataTypeEnum });
      if (!result || result.error) {
        this.$Toast.show({ postion: "middle", title: (result && result.error && result.error.msg) || "情景执行失败" });
      } else {
        this.$Toast.show({ postion: "middle", title: "执行成功" });
      }
    },
  },
  mounted() {
    this.handleRender(this.detail);
    this.ifRead = this.detail && this.detail.ifReadEnum && this.detail.ifReadEnum === "yes";
    this.getIconType();
  },
  computed: {
    ...mapGetters(["getCurtainTypeCodes", "globalAppVersion"]),
    curtainBind() {
      let has =
        this.detail &&
        this.detail.deviceBindInfoVoList &&
        this.detail.deviceBindInfoVoList[0] &&
        this.detail.deviceBindInfoVoList[0].bindDataList &&
        this.detail.deviceBindInfoVoList[0].bindDataList[0];
      return has;
    },
    isOnLine() {
      return this.detail._onLine === 1 || this.detail._onLine === 5;
    },
  },
  beforeDestroy() {
    this.curtainTimer && clearTimeout(this.curtainTimer);
    this.curtainTimer = null;
    this.loadingDeviceData.timer && clearTimeout(this.loadingDeviceData.timer);
    this.loadingDeviceData.timer = null;
  },
};
</script>
<style lang="less" scoped>
.device-item {
  width: 320px;
  height: 300px;
  background: #fcfcff;
  border-radius: 40px;
  // display: inline-block;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  &:active {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
  }
  &.active {
    &.type-one {
      .head {
        background: #fc7355;
        background: linear-gradient(140deg, #fc9155 0%, #fc7355 100%);
      }
    }
    &.type-two {
      .head {
        background: #393c84;
        background: linear-gradient(140deg, #7377c4 0%, #393c84 100%);
      }
    }
    &.type-three {
      .head {
        background: #38ad9a;
        background: linear-gradient(138deg, #6fdab7 0%, #38ad9a 100%);
      }
    }
    .info {
      .title {
        color: #2f2f4a;
        line-height: 1.2;
      }
      .detail {
        color: #5e5e83;
      }
      .room-name {
        &::before {
          background-color: #5e5e83 !important;
        }
      }
    }
  }

  .head {
    position: relative;
    width: 100%;
    height: 140px;
    border-radius: 40px;
    display: flex;
    background: #404040;
    background: linear-gradient(140deg, #b2b2b4 0%, #979799 100%);
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 40px;
    overflow: hidden;
    .txt {
      font-size: 26px;
      font-weight: 400;
      color: #ffffff;
      transition: all 0.2s ease-in-out;
      transform: scale(0);
      opacity: 0;
      &.show {
        opacity: 1;
        transform: scale(1);
      }
    }
    .curtain-svg-icon-wrap {
      position: absolute;
      left: 40px;
      top: 40px;
      .curtain-svg-icon {
        width: 40px;
        height: 60px;
        text-align: center;
        line-height: 56px;
        font-size: 42px;
        color: #fff;
        display: inline-block;
        &.up {
          transform: rotate(180deg);
          display: inline-block;
        }
        &.mr30 {
          margin-right: 30px;
        }
        &.ml30 {
          margin-left: 30px;
        }
        &.close,
        &.open {
          margin-right: 16px;
          width: 60px;
          height: 60px;
        }
      }
      &.right {
        left: 160px;
      }
    }
    .icon {
      position: absolute;
      left: 20px;
      top: 20px;
      width: 100px;
      height: 100px;
      border-radius: 30px;
      line-height: 100px;
      text-align: center;
      transition: left 0.2s ease-in-out;
      background-image: url("../../../assets/images/device-icon/device_icon_bg.png");
      background-size: cover;
      z-index: 2;
      &.right {
        left: 200px;
      }
      .icon-device-pic {
        width: 100%;
        height: 100%;
        border-radius: 30px;
      }
    }
    .circle-loading {
      position: absolute;
      left: -110%;
      width: 110%;
      top: -30px;
      height: 200px;
      border-radius: 100px;
      z-index: 1;
      &.active1 {
        background: linear-gradient(90deg, rgba(255, 94, 59, 0) 0%, rgba(255, 94, 59, 0.7) 100%);
        left: 0;
        animation: slide 2s linear;
      }
      &.active2 {
        background: linear-gradient(90deg, rgba(116, 119, 196, 0) 0%, #3e418c 100%);
        left: 0;
        animation: slide 2s linear;
      }
      &.active3 {
        background: linear-gradient(90deg, rgba(111, 218, 183, 0) 0%, #37ae98 100%);
        left: 0;
        animation: slide 2s linear;
      }
      @keyframes slide {
        0% {
          left: -110%;
        }
        100% {
          left: 0;
        }
      }
    }
  }
  .info {
    width: 100%;
    box-sizing: border-box;
    padding: 40px 30px 36px;
    transition: all 0.2s ease-in-out;
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #c0c0cd;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .detail {
      font-size: 26px;
      font-weight: 400;
      color: #c0c0cd;
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .statusText,
      .room-name {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 3em;
        font-size: 28px;
      }
      .statusText {
        flex: 1;
      }
      .room-name {
        width: 38%;
        position: relative;
        box-sizing: border-box;
        padding-left: 10px;
        &::before {
          position: absolute;
          left: 0;
          top: 10%;
          bottom: 10%;
          width: 2px;
          background-color: #c0c0cd;
          content: " ";
        }
      }
      .new-device {
        font-size: 28px;
        color: #ff453a;
      }
    }
  }
}
</style>
