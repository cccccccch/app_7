/*
 * @Author: Dywade
 * @Date: 2021-11-04 09:42:15
 * @LastEditTime: 2022-01-10 15:37:01
 * @LastEditors: Dywade
 * @Description: 
 */
import Vue from "vue";
import Router from "vue-router";
import Light from "../pages/light.vue";
import childMode from "../pages/childMode.vue";
import lightStatus from "../pages/lightStatus.vue";
import GroupDeviceList from "../pages/groupDeviceList.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import ScenePage from "../../common/scenePage.vue";
import LightSpeed from "../pages/lightSpeed.vue";
import BrightnessOprate from "../pages/brightnessOprate.vue";
import SignalTest from "../../common/signalTest.vue";

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
  mode: "history",
  routes: [
    { path: "/", component: Light, name: "light" },
    { path: "/child-mode", component: childMode, name: "childMode" },
    { path: "/light-status", component: lightStatus, name: "lightStatus" },
    { path: "/device-room", component: DeviceRoom, name: "DeviceRoom" },
    { path: "/light-speed", component: LightSpeed, name: "LightSpeed" },
    { path: "/signal-test", component: SignalTest, name: "SignalTest" },
    { path: "/group-device-list", component: GroupDeviceList, name: "GroupDeviceList" },
    { path: "/scene-page", component: ScenePage, name: "ScenePage" },
    { path: "/brightness-oprate", component: BrightnessOprate, name: "BrightnessOprate" },
    { path: "*", component: Light, name: "light" },
  ],
});
export default router;
