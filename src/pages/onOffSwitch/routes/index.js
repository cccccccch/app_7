import Vue from "vue";
import Router from "vue-router";
import onOffSwitch from "../pages/onOffSwitch.vue";
import scenesList from "../pages/scenes-list.vue";
import bindSetting from "../pages/bindSetting.vue"; 
import bingEq from "../pages/bingEq.vue"; 
import RelayStatusSetting from "../pages/relayStatusSetting.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import ScenePage from "../../common/scenePage.vue";
import SignalTest from "../../common/signalTest.vue";
import EffectLightSetting from "@/pages/common/EffectLightSetting.vue";
import DoNotDisturbSetting from "@/pages/common/DoNotDisturbSetting.vue";
import MotorQuakeSetting from "@/pages/common/motorQuakeSetting.vue";
import CountDownSetting from "@/pages/common/countDownSetting.vue";
import WeekSetting from "@/pages/common/weekSetting.vue";
import TimingSetting from "@/pages/common/timingSettingList.vue";
import RepeatSetting from "@/pages/common/repeatSetting.vue";
import SwitchingSystem from "../components/SwitchingSystem.vue";
import IconSetting from "../components/IconSetting.vue";
const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch((err) => err);
};
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
Vue.use(Router);
const router = new Router({
  mode: "hash",
  routes: [
    {
      path: "/icon-setting",
      component: IconSetting,
      name: "IconSetting",
      meta: { level: 2 },
    },
    {
      path: "/scenes-list",
      component: scenesList,
      name: "scenesList",
      meta: { level: 2 },
    },
    {
      path: "/device-room",
      component: DeviceRoom,
      name: "DeviceRoom",
      meta: { level: 2 },
    },
    {
      path: "/bind-setting",
      component: bindSetting,
      name: "bindSetting",
      meta: { level: 2 },
    },
    {
      path: "/switching-system",
      component: SwitchingSystem,
      name: "SwitchingSystem",
      meta: { level: 2 },
    },
    {
      path: "/bing-eq",
      component: bingEq,
      name: "bingEq",
      meta: { level: 2 },
    },
    {
      path: "/scene-page",
      component: ScenePage,
      name: "ScenePage",
      meta: { level: 2 },
    },
    {
      path: "/motor-quake-setting",
      component: MotorQuakeSetting,
      name: "MotorQuakeSetting",
      meta: { level: 2 },
    },
    {
      path: "/timing-setting",
      component: TimingSetting,
      name: "TimingSetting",
      meta: { level: 2 },
    }, 
    {
      path: "/ralay-status-setting",
      component: RelayStatusSetting,
      name: "RelayStatusSetting",
      meta: { level: 2 },
    },
    {
      path: "/signal-Test",
      component: SignalTest,
      name: "SignalTest",
      meta: { level: 2, keepAlive: false },
    },
    {
      path: "/effect-setting",
      component: EffectLightSetting,
      name: "EffectLightSetting",
      meta: { level: 2 },
    },
    {
      path: "/donot-disturb-setting",
      component: DoNotDisturbSetting,
      name: "DoNotDisturbSetting",
      meta: { level: 3 },
    },
    {
      path: "/count-down-setting",
      component: CountDownSetting,
      name: "CountDownSetting",
      meta: { level: 3 },
    }, 
    { path: '/repeat-setting', component: RepeatSetting, name: 'RepeatSetting',meta: { level: 4 } }, 
    {
      path: "/week-setting",
      component: WeekSetting,
      name: "WeekSetting",
      meta: { level: 5 },
    },  
    { path: "*", component: onOffSwitch, name: "onOffSwitch" },
  ],
});
export default router;
