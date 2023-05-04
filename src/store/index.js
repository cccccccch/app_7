import Vue from "vue";
import Vuex from "vuex";
import powerStrip from "./powerStrip";
import light from "./light";
import home from "./home";
import aircondition from "./aircondition";
import ventilator from "./ventilator";
import onOffSwitch from "./onOffSwitch";
import doorLock from "./doorLock";
import curtain from "./curtain";
import schedule from './schedule'
import group from './group' 
import { execNativeFunc } from "../utils/bridge";
import { deviceDetailRep } from "../api/request";
Vue.use(Vuex);
const store = {
  state: {
    switchMAC:'',
    appVersion: 1, // app版本规则， 原生传过来一个字符串'2.9.1'，分割后变成[2,9,1],权重分别乘以10000,100，然后相加，最后得到20901,已在mixins处理，这里保存结果20901
    globalData: {},
    deviceDetail: {},
    globalDeviceStatus: "", // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
    globalDataId: "",
    globalFamilyId: "",
    globalMattData: [],
    globalDeviceMac: "",
    globalUserId: "",
    globalDeviceType: "endpoint",
    childMode: false,
    defaultTempratureColors: ["#FFC584", "#FDD2A9", "#FCDBC0", "#F7E5DE", "#D7E2EF", "#BDE0FE"],
    defaultColorPickerColors: [
      { c: "#FF0000", xy: "48146 17390" },
      { c: "#FF8000", xy: "41253 24151" },
      { c: "#FFFF00", xy: "28483 36677" },
      { c: "#00FF00", xy: "17914 46838" },
      { c: "#00FFFF", xy: "14408 23660" },
      { c: "#0000FF", xy: "10917 580" }
    ],
    hsvColorPickerColors: [
      { h: 0, s: 254, rgba: [255, 0, 0, 1] },
      { h: 30, s: 254, rgba: [255, 128, 0, 1] },
      { h: 60, s: 254, rgba: [255, 255, 0, 1] },
      { h: 120, s: 254, rgba: [0, 255, 0, 1] },
      { h: 180, s: 254, rgba: [0, 255, 255, 1] },
      { h: 240, s: 254, rgba: [0, 0, 255, 1] }
    ],
    curtainTypeCodes: {
      EXTERNAL_ROLLER_BLIND: 0, // 卷帘
      EXTERNAL_23: 7, // 卷帘 非ce02卷帘 目前为多功能控制器的卷帘
      EXTERNAL_CURTAIN: 1, // 幕布
      EXTERNAL05: 8, // 幕布 非ce02幕布，目前为多功能控制器的幕布
      EXTERNAL_SHANGRI_LA_CURTAIN: 2, // 香格里拉帘
      // EXTERNAL_SHANGRI_LA_CURTAIN: 9, // 香格里拉帘
      EXTERNAL_VENETAIN_BLIND: 3, // 百叶帘
      EXTERNAL_ROMAN_SHADE: 4, // 罗马帘
      EXTERNAL_ZEBRA_CURTAIN: 5, // 斑马帘
      EXTERNAL_ZONEYCOMD_BLINDS: 6, // 蜂巢帘
      CE06:9
      
    },
    deviceDataModify: false, // 设备数据是否发生变化，如果发生变化，需要在退出H5之前通知APP刷新
    optionPageScrollPosition: 0, // 设备设置页滚动条位置
    deviceDelFromCurHomeList: false, // 如果退出当前页面的时候,设备被删除或转移房间了,退出前将onDataChannel.type = 2
  },
  mutations: {
    setSwitchMAC(state,data){
      state.switchMAC = data
      localStorage.setItem('_SwitchMAC',data)
    },
    setDeviceDataModify(state, flag = true) {
      state.deviceDataModify = flag;
    },
    setGlobalDeviceType(state, type) {
      state.globalDeviceType = type;
    },
    setGlobalFamilyId(state, id) {
      state.globalFamilyId = id;
    },
    setGlobalUserId(state, id) {
      state.globalUserId = id;
    },
    setGlobalDeviceStatus(state, data) {
      state.globalDeviceStatus = data;
    },
    setDeviceDetail(state, data) {
      state.deviceDetail = data;
    },
    setDataFromNative(state, { data } = payload) {
      state.globalData = data;
    },
    setHsvColorFromCache(state, payload) {
      state.hsvColorPickerColors = payload;
    },
    changeTempratureColors(state, { idx, color, colorList } = payload) {
      if (colorList && colorList.length) {
        state.defaultTempratureColors = colorList;
      } else {
        if (!color) return;
        state.defaultTempratureColors[idx] = color;
      }
    },
    changeColorPickerColors(state, { idx, color, xy, colorList } = payload) {
      if (colorList && colorList.length) {
        state.defaultColorPickerColors = colorList;
      } else {
        if (!color || !xy) return;
        state.defaultColorPickerColors[idx] = { c: color, xy };
      }
    },
    changeHsvPickerColors(state, payload) {
      if (!payload || !payload.rgba) return;
      state.hsvColorPickerColors.splice(payload.idx, 1, { h: payload.h, s: payload.s, rgba: payload.rgba });
    },
    setDataToNative(state, { key, data } = payload) {
      state[key] = data;
      state.globalData[key] = data;
      execNativeFunc("dataSave", state.globalData);
    },
    // mqtt消息通知
    setMqttMessage(state, payload) {
      let data = payload.data;
      if (!data.zmac) return;
      if (data.zmac === state.globalDeviceMac) {
        for (let item of data.data) {
          // 任何device或者endpoint类型的设备都有deviceMac字段的mac地址
          // endpointIndex=-1是必须存在的字段，一个device设备可能有多个endpoint，同device下的每个endpoint的deviceMac都相同
          // endpointIndex=-1是单个device或者device下所有endpoint的共同的 在线/离线/入网等统一状态
          // 通过status字段可以判断当前设备的在线/离线/入网
          // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
          // 0: "offline",
          // 1: "online",
          // 4: "offNetwork",
          // 5: "online",
          // 7: "binding",

          // 注意！！！！！ 因为通过mqtt上报或者通过设备详情页拿到的attrs字段的15855616值可能不一致，
          // 因为网关离线后，不会改变attrs里面的15855616值，
          // 所以在这里MQTT上报的在线离线统一处理为枚举值
          if (typeof item.status === "number") {
            item["deviceStateEnum"] = item.status === 1 || item.status === 5 ? "online" : item.status === 4 ? "offNetwork" : item.status === 7 ? "binding" : "offline";
          }
          if (item.deviceMac === state.globalDeviceMac && item.endpointIndex === -1) {
            state.globalDeviceStatus = Number(item.status);
            break;
          }
        }
        state.globalMattData = data.data;
      }
    },
    setChildMode(state, value) {
      state.childMode = value;
    },
    // 设置当前设备id
    setGlobalDataId(state, payload) {
      if (!payload || !payload.deviceId) return;
      state.globalDataId = payload.deviceId;
    },
    // 设置当前设备id
    setGlobalMac(state, mac) {
      if (!mac) return;
      state.globalDeviceMac = mac;
    },
    // 设置原生APP版本号
    setGlobalAppVersion(state, v) {
      state.appVersion = v;
    },
    setOptionPageScrollPosition(state, v) {
      state.optionPageScrollPosition = v;
    },
    setDeviceDelFromCurHomeList(state, value) {
      state.deviceDelFromCurHomeList = value
    }
  },
  getters: {
    globalData: state => state.globalData,
    defaultTempratureColors: state => state.defaultTempratureColors,
    defaultColorPickerColors: state => state.defaultColorPickerColors,
    globalDataId: state => state.globalDataId,
    globalUserId: state => state.globalUserId,
    globalMattData: state => state.globalMattData,
    globalDeviceStatus: state => state.globalDeviceStatus,
    deviceDetail: state => state.deviceDetail,
    childMode: state => state.childMode,
    globalFamilyId: state => state.globalFamilyId,
    deviceDataModify: state => state.deviceDataModify,
    globalDeviceType: state => state.globalDeviceType,
    hsvColorPickerColors: state => state.hsvColorPickerColors,
    globalAppVersion: state => state.appVersion,
    getCurtainTypeCodes: state => state.curtainTypeCodes,
    getOptionPageScrollPosition: state => state.optionPageScrollPosition,
    getDeviceDelFromCurHomeList: state => state.deviceDelFromCurHomeList,
    globalDeviceMac: state => state.globalDeviceMac,
  },
  actions: {
    deviceDetailAction({ commit, state }) {
      // 注意，这个action是用于更新store中当前设备的数据， 因为dataTypeEnum不同设备是不一样的（2021/5/21）
      // 切勿用于第一次deviceDetail获取数据
      deviceDetailRep({ dataId: state.globalDataId, dataTypeEnum: state.deviceDetail.dataTypeEnum || "endpoint" }).then(res => {
        let { data, error } = res;
        if (data && !error) {
         
          data.data && commit("setDeviceDetail", data.data);
        }
      });
    }
  },
  modules: {
    powerStrip,
    light,
    home,
    aircondition,
    ventilator,
    onOffSwitch,
    doorLock,
    curtain,
    group,
    schedule
  }
};

export default new Vuex.Store(store);
