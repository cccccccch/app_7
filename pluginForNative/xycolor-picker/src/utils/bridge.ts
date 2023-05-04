export interface WWindow extends Window {
  __WINGTO__: {
    noticeJsReadyStatus?: boolean;
    platform?: string;
    statusbarheight?: string | number;
    [k: string]: any
  }
  webkit?: any;
  WINGTO_NATIVE?: any;
  WINGTO_H5?: {
    getCacheData: Function,
    mqttMessage: Function,
    dataSaveResult: Function,
    onDataRefresh: Function,
    onPageChange: Function,
    onH5DataChannel: Function,
    onSetHsvColor: Function,
    onSetTempColor: Function,
    onSetXyColor: Function,
  };
  [k: string]: any
}
export default {
  install(Vue: any) {
    const win: WWindow = window as any
    if (!win.__WINGTO__) {
      win.__WINGTO__ = {
        noticeJsReadyStatus: false
      };
    }
    let globalProperties = Vue.config.globalProperties
    globalProperties.notifyNativeReady = function () {
      let timer = setTimeout(() => {
        if (win.__WINGTO__.platform === "ios") {
          win.webkit.messageHandlers.WINGTO_NATIVE.postMessage(JSON.stringify({
            method: "onJsReady",
            data: ""
          }));
          win.__WINGTO__.noticeJsReadyStatus = !0;
        } else if (win.__WINGTO__.platform === "android") {
          if (win.WINGTO_NATIVE && win.WINGTO_NATIVE.onJsReady) {
            win.WINGTO_NATIVE.onJsReady();
            win.__WINGTO__.noticeJsReadyStatus = !0;
          }
        }
        timer && clearTimeout(timer)
      }, 50);
    };
    globalProperties.getCacheData = function (obj?: any) { };
    globalProperties.mqttMessage = function (obj?: any) { };
    globalProperties.dataSaveResult = function (obj?: any) { };
    globalProperties.onSetHsvColor = function (obj?: any) { };
    globalProperties.onPageChange = function (obj?: any) { };
    globalProperties.onH5DataChannel = function (obj?: any) { };
    globalProperties.onDataRefresh = function (obj?: any) { };
    globalProperties.onSetTempColor = function (obj?: any) { };
    globalProperties.onSetXyColor = function (obj?: any) { };
    if (!win.WINGTO_H5) {
      win.WINGTO_H5 = {
        getCacheData: globalProperties.getCacheData,
        mqttMessage: globalProperties.mqttMessage,
        dataSaveResult: globalProperties.dataSaveResult,
        onDataRefresh: globalProperties.onDataRefresh,
        onPageChange: globalProperties.onPageChange,
        onH5DataChannel: globalProperties.onH5DataChannel,
        onSetHsvColor: globalProperties.onSetHsvColor,
        onSetTempColor: globalProperties.onSetTempColor,
        onSetXyColor: globalProperties.onSetXyColor,
      };
    }
    if (!win.WINGTO_NATIVE) {
      win.WINGTO_NATIVE = {};
    }
  },
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
export const funcList = ["dataSave", "deviceHadModify", "onJsReady", "onNavigateTo", "onVibrate", "onAuthModify", "onDataChannel", "onHsvColorPicker", "sendMsgToWechat", "sendMsgToSMS", "onTempColorPicker", "onXyColorPicker","onDataRefresh"];
export const execNativeFunc = (name: string, data: object) => {
  console.log(">>> 执行native:", name, JSON.stringify(data), "<<<");
  const win: WWindow = window as any
  if (!name) {
    console.error("function name is required");
    return;
  }
  if (!funcList.includes(name)) {
    console.error(`native funcList do not contain method: ${name}`);
    return;
  }
  if (win.__WINGTO__.platform === "ios") {
    win.webkit.messageHandlers.WINGTO_NATIVE.postMessage(JSON.stringify({
      method: name,
      data: data
    }));
    console.log("onHsvColorPicker2:", JSON.stringify({
      method: name,
      data: data
    }));
  } else if (win.__WINGTO__.platform === "android") {
    if (win.WINGTO_NATIVE && win.WINGTO_NATIVE[name]) {
      win.WINGTO_NATIVE[name](JSON.stringify(data));
    }
  }
};