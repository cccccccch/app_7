import store from "../store/index";
import { version } from "../api/config";
export default {
  install(Vue) {
    console.log("wingto H5 version: ", version);
    if (!window.__WINGTO__) {
      window.__WINGTO__ = { noticeJsReadyStatus: false };
    }
    Vue.prototype.notifyNativeReady = function() {
      console.log("onJsReady");
      if (window.__WINGTO__.platform === "ios") {
        window.webkit.messageHandlers.WINGTO_NATIVE.postMessage(JSON.stringify({ method: "onJsReady", data: "" }));
        window.__WINGTO__.noticeJsReadyStatus = !0;
      } else if (window.__WINGTO__.platform === "android") {
        if (window.WINGTO_NATIVE && window.WINGTO_NATIVE.onJsReady) {
          window.WINGTO_NATIVE.onJsReady();
          window.__WINGTO__.noticeJsReadyStatus = !0;
        }
      }
    };
    Vue.getCacheData = function(obj) {
      console.log("getCacheData:................", obj);
      if (!obj) return;
      try {
        let data = JSON.parse(obj);
        if (data) {
          store.commit("setDataFromNative", { data: data });
        }
        if (data.tempratureColors && data.tempratureColors.length) {
          store.commit("changeTempratureColors", { colorList: data.tempratureColors });
        }
        if (data.pickerColors && data.pickerColors.length) {
          store.commit("changeColorPickerColors", { colorList: data.pickerColors });
        }
        if (data.hsvPickerColors && data.hsvPickerColors.length) {
          store.commit("setHsvColorFromCache", data.hsvPickerColors);
        }
        if (data.curtainPreferencePoint && data.curtainPreferencePoint.length) {


          store.commit("setCurtainPreferencePoint", data.curtainPreferencePoint);
        }
        if (data.curtaindegreearr && data.curtaindegreearr.length) {
          console.log(data,'进来')
          store.commit("setcurtaindegree", data.curtaindegreearr);
        }
      } catch (error) {}
    };
    //挂在在vue上
    Vue.mqttMessage = function(strings) {
      // console.log()
      console.log("onReceivedMqttData strings========>", strings);
      if (!strings) return;
      try {
        strings = decodeURIComponent(strings);
        console.log('转译后的mqtt',strings)
        let data = JSON.parse(strings);
        // console.log("onReceivedMqttData========>", data);
        if (Array.isArray(data)) {
          //ios直接传的mqtt数组
          data = { data: data };
        }
        store.commit("setMqttMessage", { data });
        store.dispatch("homeMqttAction", { data });
      } catch (error) {
        console.error(error);
      }
    };
    Vue.dataSaveResult = function(data) {};
    Vue.onSetHsvColor = function(data) {
      console.log("onSetHsvColor111");
    };
    Vue.onPageChange = function(data) {};
    Vue.onH5DataChannel = function(data) {};
    Vue.onDataRefresh = function(data) {};
    if (!window.WINGTO_H5) {
      window.WINGTO_H5 = {
        getCacheData: Vue.getCacheData,
        mqttMessage: Vue.mqttMessage,
        dataSaveResult: Vue.dataSaveResult,
        onDataRefresh: Vue.onDataRefresh,
        onPageChange: Vue.onPageChange,
        onH5DataChannel: Vue.onH5DataChannel,
        onSetHsvColor: Vue.onSetHsvColor
      };
    }
    if (!window.WINGTO_NATIVE) {
      window.WINGTO_NATIVE = {};
    }
  }
};
// onAuthModify(code: string) 登录态失效
// dataSave(json: String)    数据持久化
// deviceHadModify()   设备数据发生变化
// onJsReady()  h5 js代码初始化完成，此时可以通过getCacheData传入数据
// onVibrate(long) h5调用系统震动
// onNavigateTo()  h5调用切换native页面  // parmas: {type: int, data: {}}
// 返回上一页   type==0
// 软件固件页   type==1
// 问题反馈页   type==2
// 灯光编组页   type==3
// sendMsgToWechat()  分享文本到微信 //  data: { "content": xxx }
// sendMsgToSMS()  分享文本到短信 //  data: { "content": xxx }
// 注意：使用dataSave的时候需要自己管理好数据的更替，dataSave方法是覆盖式，在不同的地方使用时候注意不要忘记合并该合并的数据
export const funcList = ["dataSave", "deviceHadModify", "onJsReady", "onNavigateTo", "onVibrate", "onAuthModify", "onDataChannel", "onHsvColorPicker", "sendMsgToWechat", "sendMsgToSMS"];
export const execNativeFunc = (name, data) => {
  console.log(">>> 执行native:", name, JSON.stringify(data), "<<<");
  if (!name) {
    console.error("function name is required");
    return;
  }
  if (!funcList.includes(name)) {
    console.error(`native funcList do not contain method: ${name}`);
    return;
  }
  if (window.__WINGTO__.platform === "ios") {
    window.webkit.messageHandlers.WINGTO_NATIVE.postMessage(JSON.stringify({ method: name, data: data }));
    console.log("onHsvColorPicker2:", JSON.stringify({ method: name, data: data }));
  } else if (window.__WINGTO__.platform === "android") {
    if (window.WINGTO_NATIVE && window.WINGTO_NATIVE[name]) {
      window.WINGTO_NATIVE[name](JSON.stringify(data));
    }
  }
};
