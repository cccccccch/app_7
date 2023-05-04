import Vue from "vue";
import Router from "vue-router";
import onOffSwitchGroup from "../pages/onOffSwitchGroup.vue";
import scenesList from "../pages/scenes-list.vue";
import RelayStatusSetting from "../pages/relayStatusSetting.vue";
import SubDeviceCard from "../pages/subDeviceCard.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import ScenePage from "../../common/scenePage.vue";
import SignalTest from "../../common/signalTest.vue";

import MotorQuakeSetting from "@/pages/common/motorQuakeSetting.vue";
import CountDownSetting from "@/pages/common/countDownSetting.vue";
import WeekSetting from "@/pages/common/weekSetting.vue";
import TimingSetting from "@/pages/common/timingSettingList.vue";
import RepeatSetting from "@/pages/common/repeatSetting.vue";

const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
};
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
Vue.use(Router);
const router = new Router({
  mode: "hash",
  routes: [
    {
      path: "/scenes-list",
      component: scenesList,
      name: "scenesList",
      meta: { level: 2 }
    },
    {
      path: "/device-room",
      component: DeviceRoom,
      name: "DeviceRoom",
      meta: { level: 2 }
    },
    {
      path: "/scene-page",
      component: ScenePage,
      name: "ScenePage",
      meta: { level: 2 }
    },
    {
      path: "/motor-quake-setting",
      component: MotorQuakeSetting,
      name: "MotorQuakeSetting",
      meta: { level: 2 }
    },
    {
      path: "/timing-setting",
      component: TimingSetting,
      name: "TimingSetting",
      meta: { level: 2 }
    },
    {
      path: "/ralay-status-setting",
      component: RelayStatusSetting,
      name: "RelayStatusSetting",
      meta: { level: 2 }
    },
    {
      path: "/sub-device-card",
      component: SubDeviceCard,
      name: "SubDeviceCard",
      meta: { level: 2 }
    },
    {
      path: "/signal-Test",
      component: SignalTest,
      name: "SignalTest",
      meta: { level: 2, keepAlive: false }
    },
    {
      path: "/count-down-setting",
      component: CountDownSetting,
      name: "CountDownSetting",
      meta: { level: 3 }
    },
    {
      path: "/week-setting",
      component: WeekSetting,
      name: "WeekSetting",
      meta: { level: 4 }
    },
    { path: "/repeat-setting", component: RepeatSetting, name: "RepeatSetting", meta: { level: 4 } },
    { path: "*", component: onOffSwitchGroup, name: "onOffSwitchGroup" }
  ]
});
export default router;
