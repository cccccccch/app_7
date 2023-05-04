import Vue from "vue";
import Router from "vue-router";
import Scenes from "../pages/scenes.vue";
import scenesList from "../pages/scenes-list.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import SignalTest from "../../common/signalTest.vue";
import EffectLightSetting from "@/pages/common/EffectLightSetting.vue";
import DoNotDisturbSetting from "@/pages/common/DoNotDisturbSetting.vue";
import MotorQuakeSetting from "@/pages/common/motorQuakeSetting.vue";

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
  mode: "history",
  routes: [
    { path: "/", component: Scenes, name: "scenes" },
    { path: "/scenes-list", component: scenesList, name: "scenesList" },
    { path: "/device-room", component: DeviceRoom, name: "DeviceRoom" },
    { path: "/signal-test", component: SignalTest, name: "SignalTest" },
    
    {
      path: "/motor-quake-setting",
      component: MotorQuakeSetting,
      name: "MotorQuakeSetting",
      meta: { level: 2 },
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
    { path: "*", component: Scenes, name: "scenes" }
  ]
});
export default router;
