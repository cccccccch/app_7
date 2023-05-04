const throttle = (fn, wait) => {
  let prev = Date.now();
  return function() {
    let context = this;
    let args = arguments;
    let now = Date.now();
    if (now - prev > wait) {
      fn.apply(context, args);
      prev = Date.now();
    }
  };
};
const rgb2hex = arr => {
  if (!Array.isArray(arr) || arr.length !== 3) return arr;
  let r = Math.round(arr[0]).toString(16);
  let g = Math.round(arr[1]).toString(16);
  let b = Math.round(arr[2]).toString(16);
  let res = "#" + (r.length < 2 ? "0" + r : r) + (g.length < 2 ? "0" + g : g) + (b.length < 2 ? "0" + b : b);
  return res;
};
// 16进制颜色转rgb
const hex2rgb = hex => {
  if (!hex || typeof hex !== "string" || hex.length !== 7) {
    return hex;
  }
  hex = hex.replace("#", "0x");
  const r = (hex & 0xff0000) >> 16;
  const g = (hex & 0xff00) >> 8;
  const b = hex & 0xff;
  return [r, g, b];
};
// rgb->xy 颜色转换

const rgb2xyz = (r, g, b) => {
  const x = r * 0.49 + g * 0.31 + b * 0.2;
  const y = r * 0.17697 + g * 0.8124 + b * 0.01063;
  const z = r * 0.0 + g * 0.01 + b * 0.99;
  return { x, y, z };
};

const xyz2xy = (x, y, z) => {
  const xx = x / (x + y + z);
  const yy = y / (x + y + z);
  return Math.round(xx * 65536) + " " + Math.round(yy * 65536);
};

const gamma_correction = value => {
  if (value > 0.04045) {
    return Math.pow((value + 0.055) / 1.055, 2.4);
  } else {
    return value / 12.92;
  }
};

const rgb2xy = (r, g, b) => {
  const xyz = rgb2xyz(gamma_correction(r), gamma_correction(g), gamma_correction(b));
  return xyz2xy(xyz.x, xyz.y, xyz.z);
};

// 2700k-6500k 每100K对应一个颜色
const templatureColor = [
  "#BDE0FE",
  "#C2E1FB",
  "#C7E1F8",
  "#CDE1F5",
  "#D2E2F2",
  "#D7E2EF",
  "#DDE3EC",
  "#E2E3E9",
  "#E7E3E7",
  "#ECE4E4",
  "#F2E4E1",
  "#F7E5DE",
  "#FBE5DB",
  "#FBE3D8",
  "#FBE2D4",
  "#FBE1D1",
  "#FCE0CE",
  "#FCDFCA",
  "#FCDDC7",
  "#FCDCC4",
  "#FCDBC0",
  "#FCDABD",
  "#FDD8BA",
  "#FDD7B6",
  "#FDD6B3",
  "#FDD5AF",
  "#FDD3AC",
  "#FDD2A9",
  "#FDD1A5",
  "#FED0A2",
  "#FECE9F",
  "#FECD9B",
  "#FECC98",
  "#FECB95",
  "#FECA91",
  "#FEC88E",
  "#FFC78A",
  "#FFC687",
  "#FFC584"
];
// 榜威灯是 2200k-6500k 每100K对应一个颜色
const templatureColor_BW = [
  "#BAE0FF",
  "#BDE0FE",
  "#C4E1FA",
  "#C9E1F7",
  "#CEE2F4",
  "#D2E2F2",
  "#D7E2EF",
  "#DCE3ED",
  "#E1E3EA",
  "#E6E3E8",
  "#EBE4E5",
  "#EFE4E2",
  "#F4E4E0",
  "#F7E5DE",
  "#FBE4DA",
  "#FBE3D7",
  "#FBE2D4",
  "#FBE1D1",
  "#FCE0CE",
  "#FCDFCB",
  "#FCDEC8",
  "#FCDCC5",
  "#FCDCC2",
  "#FCDBC0",
  "#FCD9BC",
  "#FDD8B9",
  "#FDD7B6",
  "#FDD6B3",
  "#FDD5B0",
  "#FDD4AD",
  "#FDD2A9",
  "#FDD1A7",
  "#FED0A4",
  "#FECFA1",
  "#FECE9E",
  "#FECD9A",
  "#FECC97",
  "#FECB94",
  "#FECA91",
  "#FEC88E",
  "#FFC78B",
  "#FFC688",
  "#FFC584",
  "#FFC478",
  "#FFC480",
  "#FFC482"
];

const getUrlQuery = url => {
  if (!url) return url;
  let result = {};
  const reg = /([^?&=]+)=([^?&=]+)/g;
  url.replace(reg, ($1, $2, $3) => $2 !== null && $2 !== undefined && (result[$2] = $3.split("#/").shift()));
  return result;
};

const deviceZigbeeType = {
  // 客厅 灯
  OnOffSwitch: "ZIGBEE_TYPE_SWITCHER",
  // 玄关 情景开关
  SceneSelector: "ZIGBEE_TYPE_SCENE_BOARD",
  // 网关
  HomeGateway: "ZIGBEE_TYPE_HOME_GATEWAY",
  // 插头
  Plug: "ZIGBEE_TYPE_HOME_PLUG",
  // 门锁
  DoorLock: "ZIGBEE_TYPE_HOME_DOORLOCK",
  // 调光灯
  ColorTempLight: "ZIGBEE_TYPE_HOME_COLORTEMPLIGHT",
  // RGB调光灯
  RgbCw: "ZIGBEE_TYPE_HOME_RGBCW",
  // 窗帘
  WindowCover: "ZIGBEE_TYPE_HOME_WINDOWCOVER",
  // 屏类
  Screen: "ZIGBEE_TYPE_HOME_SCREEN",
  // P2门铃机-WinBell
  P2: "ZIGBEE_TYPE_HOME_SCREEN_P2",
  // 空调
  AirConditioning: "ZIGBEE_TYPE_HOME_AIRCONDITIONING",
  // 空调(new)
  VRV2: "ZIGBEE_TYPE_HOME_AIRCONDITIONING_VRV2",
  // 温控器-风机盘管
  TemperatureController: "ZIGBEE_TYPE_HOME_TEMPERATURECONTROLLER",
  // 地暖
  FloorHeater: "ZIGBEE_TYPE_HOME_FLOORHEATER",
  // 新风机
  AirFresher: "ZIGBEE_TYPE_HOME_NEW_WIND",
  // P1S
  P1S: "ZIGBEE_TYPE_HOME_P1S",
  // 多功能控制器
  MFC: "ZIGBEE_TYPE_HOME_MULTIFUNCTION",
  // p3
  P3: "ZIGBEE_TYPE_HOME_SCREEN_P3",
  // 入墙式插座
  WallSocket: "ZIGBEE_TYPE_HOME_OUTLET",
  // P1
  P1: "ZIGBEE_TYPE_HOME_P1",
  // P1Mini p6
  P1Mini: "ZIGBEE_TYPE_HOME_P1MINI",
  p6: "ZIGBEE_TYPE_HOME_P1MINI",
  // LS11
  PortableSocket1: "ZIGBEE_TYPE_HOME_LS11",
  // LS12
  PortableSocket2: "ZIGBEE_TYPE_HOME_LS12",
  //P1S继电器开关
  RelayOnOff: "ZIGBEE_TYPE_HOME_RELAY_ON_OFF",
  //人体传感器
  LivingSensor: "ZIGBEE_TYPE_HOME_LIVING_SENSOR",
  //门磁传感器
  DoorSensor: "ZIGBEE_TYPE_HOME_DOOR_SENSOR",
  //水浸传感器
  WaterSensor: "ZIGBEE_TYPE_HOME_WATERSENSOR",
  //人体存在传感器
  HumanSensor: "ZIGBEE_TYPE_HOME_HUMANSENSOR",
  //温湿度传感器
  THSensor: "ZIGBEE_TYPE_HOME_THSENSOR",
  //烟雾传感器
  SmokeSensor: "ZIGBEE_TYPE_HOME_SMOKESENSOR",
  //可燃气体传感器
  CGasSensor: "ZIGBEE_TYPE_HOME_CGASSENSOR",
  //按键报警器
  KeyFob: "ZIGBEE_TYPE_HOME_KEYFOB",
  //声光报警器
  AVAlarm: "ZIGBEE_TYPE_HOME_AVALARM",
  //全彩灯 全彩调光灯
  RGBCW2: "ZIGBEE_TYPE_HOME_ALL_LIGHT",
  //颜色灯
  RGB: "ZIGBEE_TYPE_HOME_COLOR_LIGHT",
  //色温灯
  CW: "ZIGBEE_TYPE_HOME_TEMPERATURE_LIGHT",
  //单色调光灯 (亮度灯)
  DimmingLamp: "ZIGBEE_TYPE_HOME_BRIGHTNESS_LIGHT",
  RGBCW3: "ZIGBEE_TYPE_HOME_ALL_LIGHT_HSV",
  RGB3: "ZIGBEE_TYPE_HOME_COLOR_LIGHT_HSV",
  CW3: "ZIGBEE_TYPE_HOME_TEMPERATURE_LIGHT_HSV",
  DimmingLamp3: "ZIGBEE_TYPE_HOME_BRIGHTNESS_LIGHT_HSV",
  RGBCW_BW: "ZIGBEE_TYPE_HOME_ALL_LIGHT_HSV",
  CW_BW: "ZIGBEE_TYPE_HOME_TEMPERATURE_LIGHT_HSV"
};
const deviceMacShowInApp = [
  "OnOffSwitch",
  "SceneSelector",
  "HomeGateway",
  "ColorTempLight",
  "WindowCover",
  "RgbCw",
  "AirConditioning",
  "Screen",
  "TemperatureController",
  "P2",
  "P1S",
  "MFC",
  "P3",
  "PortableSocket1",
  "DoorLock",
  "PortableSocket2",
  "WallSocket",
  "P1",
  "P1Mini",
  "P6",
  'P6Pro',
  'P6S',
  'P6Box',
  'P7',
  "RelayOnOff",
  "LivingSensor",
  "DoorSensor",
  "FloorHeater",
  "AirFresher",
  "WaterSensor",
  "HumanSensor",
  "THSensor",
  "SmokeSensor",
  "CGasSensor",
  "KeyFob",
  "AVAlarm",
  "RGBCW2",
  "RGB",
  "CW",
  "DimmingLamp",
  "RC03",
  "AC",
  "STB",
  "AF",
  "TV",
  "InfraredRemote",
  "VRV2",
  "RGBCW3",
  "RGB3",
  "CW3",
  "DimmingLamp3",
  "ZigbeeDoorLock",
  "RGBCW_BW",
  "CW_BW",
  // todo 影K暂时放开， 硬件型号为V02
  "V02",
  // todo 开发环境暂时放开RC01
  "RC01",
  "RollCurtains",
  // todo 暂时放开威动播放器
  "VDMPlayer"
];

export { throttle, templatureColor, rgb2xy, hex2rgb, rgb2hex, getUrlQuery, deviceZigbeeType, deviceMacShowInApp, templatureColor_BW };
