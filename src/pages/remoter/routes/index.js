import Vue from "vue";
import Router from "vue-router";
import remoter from "../pages/remoter.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import SignalTest from "../../common/signalTest.vue";
import ScenePage from "../../common/scenePage.vue";
import DoNotDisturbSetting from "@/pages/common/DoNotDisturbSetting.vue";
import MotorQuakeSetting from "@/pages/common/motorQuakeSetting.vue";
import CountDownSetting from "@/pages/common/countDownSetting.vue";
import RepeatSetting from "@/pages/common/repeatSetting.vue";
import msgStatus from "@/pages/common/msgStatus.vue";
import scenesList from "../pages/scenes-list.vue";
import ambientLighting from"../components/ambientLighting.vue"
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
      path: "/device-room",
      component: DeviceRoom,
      name: "DeviceRoom",
      meta: { level: 2 }
    },
    {
      path: "/scenes-list",
      component: scenesList,
      name: "scenesList",
      meta: { level: 2 },
    },
    {
      path: "/msgStatus",
      component: msgStatus,
      name: "msgStatus",
      meta: { level: 2 }
    },
    {
      path: "/motor-quake-setting",
      component: MotorQuakeSetting,
      name: "MotorQuakeSetting",
      meta: { level: 2 }
    },
    {
      path: "/signal-Test",
      component: SignalTest,
      name: "SignalTest",
      meta: { level: 2, keepAlive: false }
    },
    {
      path: "/Scene-Page",
      component: ScenePage,
      name: "ScenePage",
      meta: { level: 2, keepAlive: false }
    },
    {
      path: "/donot-disturb-setting",
      component: DoNotDisturbSetting,
      name: "DoNotDisturbSetting",
      meta: { level: 3 }
    },
    {
      path: "/count-down-setting",
      component: CountDownSetting,
      name: "CountDownSetting",
      meta: { level: 3 }
    },
    {
      path: "/ambient-lighting",
      component: ambientLighting,
      name: "ambientLighting",
    },
    // {
    //   path: "/main-tebleItem",
    //   component: mainTebleItem,
    //   name: "mainTebleItem",
    // },
    { path: "/repeat-setting", component: RepeatSetting, name: "RepeatSetting", meta: { level: 4 } },
    { path: "*", component: remoter, name: "remoter" }
  ]
});
export default router;
