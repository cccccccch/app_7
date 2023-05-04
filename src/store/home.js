import _ from "../libs/lodash_core";
import {
  roomEnvironmentInfoReq,
  weatherRep,
  deviceDetailRep
} from "../api/request";
const store = {
  state: {
    homeDeviceList4Mqtt: {},
    navigateType: 0,
    homeDeviceList: [],
    homeAreaId: 0, // 家庭区域ID
    roomEnvironmentInfo: {
      measureHumidity: null,
      measureTemprature: null,
      vocValue: null,
      inside: false,
      code: 0,
      
    },

  },
  mutations: {

    setNavigateType(state, {
      type
    }) {
      state.navigateType = type;
    },
    setHomeAreaId(state, id) {
      state.homeAreaId = id;
    },
    setDeviceItemDetail(state, data) {
      // 注意，deviceTypeEnum如果是device，是没有endpointIndex,默认加上-1
      let endpointIndex = typeof data.endpointIndex === "number" ? data.endpointIndex : "-1";
      let key = data.deviceMac + "_" + endpointIndex;
      if (state.homeDeviceList4Mqtt[key]) {
        state.homeDeviceList4Mqtt[key] = data;
        state.homeDeviceList4Mqtt = _.clone(state.homeDeviceList4Mqtt); // 触发getter
      }
    },
    setDeviceList(state, {
      list,
      isClear
    }) {
      if (!Array.isArray(list) || !list.length) {
        if (isClear) {
          state.homeDeviceList4Mqtt = {};
          state.homeDeviceList = [];
        }
        return;
      }
      let _list = [];
      let _mqttList = {};
      if (isClear) {
        _list = list;
      } else {
        let homeDeviceList = _.clone(state.homeDeviceList);
        _list = homeDeviceList.concat(list);
        _mqttList = state.homeDeviceList4Mqtt;
      }

      for (let item of _list) {
        // 注意，deviceTypeEnum如果是device，是没有endpointIndex,默认加上-1
        let endpointIndex = typeof item.endpointIndex === "number" ? item.endpointIndex : "-1";
        let key = item.deviceMac + "_" + endpointIndex;
        if (!item.attrs) {
          item.attrs = [{
            attrHex: 15855616,
            attrValue: item.deviceStateEnum === "online" ? 1 : 0
          }]; // 避免设备离线在线无法触发，这里给一个默认值
        }
        _mqttList[key] = item;
      }
      state.homeDeviceList4Mqtt = _mqttList;
      state.homeDeviceList = _list;
    },
    setDeviceItem(state, {
      item,
      key,
      value
    }) {
      // 注意，deviceTypeEnum如果是device，是没有endpointIndex,默认加上-1
      let endpointIndex = typeof item.endpointIndex === "number" ? item.endpointIndex : "-1";
      let k = data.deviceMac + "_" + endpointIndex;
      let data = state.homeDeviceList4Mqtt[k];
      if (data) {
        state.homeDeviceList4Mqtt[k][key] = value;
      }
    },
    setDelDeviceItem(state, item) {
      // 注意，deviceTypeEnum如果是device，是没有endpointIndex,默认加上-1
      let endpointIndex = typeof item.endpointIndex === "number" ? item.endpointIndex : "-1";
      let k = item.deviceMac + "_" + endpointIndex;
      delete state.homeDeviceList4Mqtt[k];
      state.homeDeviceList4Mqtt = _.clone(state.homeDeviceList4Mqtt); // 触发getter
    },
  },
  actions: {
    // TODO 优化，二分法等可以优化一波
    homeMqttAction({
      commit,
      state
    }, payload) {
      console.log("homeMqttAction:", payload);   
      try {
        let list = payload.data.data;
        for (let item of list) {
          if (typeof item.status === "number") {
            // 注意！！！！！ 因为通过mqtt上报或者通过设备详情页拿到的attrs字段的15855616值可能不一致，
            // 因为网关离线后，不会改变attrs里面的15855616值，
            // 所以在这里MQTT上报的在线离线统一处理为枚举值
            item["deviceStateEnum"] = item.status === 1 || item.status === 5 ? "online" : item.status === 4 ? "offNetwork" : item.status === 7 ? "binding" : "offline";
          }
        }
        // wifi门锁的上报是另一套处理
        if (payload && payload.data && payload.data.data && payload.data.data.dataId && payload.data.data.dataTypeEnum === "endpoint" && payload.data.data.doorLock) {
          let wifiLock = null;
          for (let k in state.homeDeviceList4Mqtt) {
            if (state.homeDeviceList4Mqtt[k].dataId == payload.data.data.dataId) {
              wifiLock = state.homeDeviceList4Mqtt[k];
              break;
            }
          }
          if (wifiLock) {
            wifiLock["attrs"] = [{
              attrHex: 15855616,
              attrValue: payload.data.data.deviceStateEnum === "online" ? 1 : 0
            }];
            list = [wifiLock];
          }
        }
        let deviceList = _.clone(state.homeDeviceList4Mqtt);
        for (let item of list) {
          let endpointIndex = typeof item.endpointIndex === "number" ? item.endpointIndex : -1;
          let key = item.deviceMac + "_" + endpointIndex;
          if (Number(endpointIndex) === -1) {
            for (let skey in deviceList) {
              let sItem = deviceList[skey];
              if (sItem.deviceMac !== item.deviceMac) continue;
              if (item.deviceStateEnum && typeof item.deviceStateEnum === "string") {
                // 注意！！！！！ 因为通过mqtt上报或者通过设备详情页拿到的attrs字段的15855616值可能不一致，
                // 因为网关离线后，不会改变attrs里面的15855616值，
                // 所以在这里MQTT上报的在线离线统一处理为枚举值
                sItem.deviceStateEnum = item.deviceStateEnum;
              }
              if (!sItem.attrs || !sItem.attrs.length) {
                sItem.attrs = item.attrs;
                continue;
              }
              for (let iAttr of item.attrs) {
                let targetAttr = null;
                for (let sAttr of sItem.attrs) {
                  if (sAttr.attrHex === iAttr.attrHex) {
                    targetAttr = sAttr;
                    sAttr.attrValue = iAttr.attrValue;
                    break;
                  }
                }
                if (!targetAttr) {
                  sItem.attrs.push(iAttr);
                }
              }
              deviceList[skey] = sItem;
            }
          } else {
            if (deviceList[key]) {
              if (item.deviceStateEnum && typeof item.deviceStateEnum === "string") {
                // 注意！！！！！ 因为通过mqtt上报或者通过设备详情页拿到的attrs字段的15855616值可能不一致，
                // 因为网关离线后，不会改变attrs里面的15855616值，
                // 所以在这里MQTT上报的在线离线统一处理为枚举值
                deviceList[key].deviceStateEnum = item.deviceStateEnum;
              }
              if (!deviceList[key].attrs || !item.attrs) continue;
              for (let iAttrs of item.attrs) {
                let targetAttr = null;
                for (let tAttrs of deviceList[key].attrs) {
                  if (tAttrs.attrHex === iAttrs.attrHex) {
                    targetAttr = tAttrs;
                    tAttrs.attrValue = iAttrs.attrValue;
                    break;
                  }
                }
                if (!targetAttr) {
                  deviceList[key].attrs.push(iAttrs);
                }
              }
            }
          }
        }
        state.homeDeviceList4Mqtt = deviceList;
      } catch (error) {
        console.error(error);
      }
    },
    async getRoomEnvironmentData({
      state,
      dispatch
    }, payload) {
      try {
        let params = {
          inside: payload.roomId > 0,
        };
        if (payload && payload.roomId && payload.roomId > 0) {
          roomEnvironmentInfoReq({
            roomId: payload.roomId
          }).then((result) => {
            if (result && !result.error) {
              let data = result.data.data;
              for (let key in data) {
                switch (Number(key)) {
                  case 67239936: // 温度测量值
                    params.measureTemprature = (Number(data[key]) / 100) | 0;
                    break;
                  case 67436544: // 湿度测量值
                    let h = Number(data[key]);
                    params.measureHumidity = h < 0 ? 0 : h;
                    params.measureHumidity = params.measureHumidity / 100;
                    break;
                    // case 4230021124: // PM2.5
                    //   params.pm25Value = Number(data[key]);
                    //   break;
                    // case 4230021126: // co2测量值
                    //   params.co2Value = Number(data[key]);
                    //   break;
                  case 4230021125: // voc值
                    params.vocValue = Number(data[key]);
                    break;
                }
              }
              if (typeof params.measureHumidity !== "number" && typeof params.measureTemprature !== "number" && typeof params.vocValue !== "number") {
                dispatch("getRoomEnvironmentData", {
                  roomId: 0
                });
              } else {
                state.roomEnvironmentInfo.measureTemprature = params.measureTemprature;
                state.roomEnvironmentInfo.measureHumidity = params.measureHumidity;
                state.roomEnvironmentInfo.vocValue = params.vocValue;
                state.roomEnvironmentInfo.inside = params.inside;
                weatherRep({
                  weatherType: "now"
                }).then((res) => {
                  if (res && !res.error && res.data && res.data.data) {
                    state.roomEnvironmentInfo["code"] = res.data.data.now.icon || "999";
                  }
                });
              }
            } else {
              state.roomEnvironmentInfo.inside = params.inside;
              weatherRep({
                weatherType: "now"
              }).then((res) => {
                if (res && !res.error && res.data && res.data.data) {
                  state.roomEnvironmentInfo["code"] = res.data.data.now.icon || "999";
                }
              });
            }
          });
        } else {
          weatherRep({
            weatherType: "now"
          }).then((result) => {
            if (result && !result.error && result.data && result.data.data) {
              let data = result.data.data;
              params.vocValue = data.airCategory === "优" ? 1 : data.airCategory === "良" ? 2 : data.airCategory === "中" ? 3 : data.airCategory === "差" ? 4 : null;
              params.measureHumidity = Number(data.now.humidity);
              params.measureTemprature = Number(data.now.temp);
              params.code = data.now.icon || "999";
              state.roomEnvironmentInfo = params;
            } else {
              state.roomEnvironmentInfo.inside = params.inside;
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    deviceItemDetailAction({
      commit,
      state
    }, payload) {
      // 注意，这个action是用于更新store中当前设备的数据， 因为dataTypeEnum不同设备是不一样的（2021/5/21）
      // 切勿用于第一次deviceDetail获取数据
      deviceDetailRep({
        dataId: payload.dataId,
        dataTypeEnum: payload.dataTypeEnum || "endpoint"
      }).then((res) => {
        let {
          data,
          error
        } = res;
        if (data && !error) {
          data.data && commit("setDeviceItemDetail", data.data);
        } else {
          // isUsuallyOrAll: 是否是常用列表或者全部设备，如果是，先判断该设备有没有被删除，如果删除了，就从列表里删除该设备
          if (payload.isUsuallyOrAll && error && Number(error.code) === 801) {
            for (let key in state.homeDeviceList4Mqtt) {
              if (Number(state.homeDeviceList4Mqtt[key].dataId) === Number(payload.dataId)) {
                commit("setDelDeviceItem", state.homeDeviceList4Mqtt[key]);
                break;
              }
            }
          }
        }
      });
    },
  },
  getters: {
    homeDeviceList4Mqtt: (state) => state.homeDeviceList4Mqtt,
    navigateType: (state) => state.navigateType,
    homeAreaId: (state) => state.homeAreaId,
    roomEnvironmentInfo: (state) => state.roomEnvironmentInfo,
    roomList: (state) => state.roomList,
  },
};

export default store;