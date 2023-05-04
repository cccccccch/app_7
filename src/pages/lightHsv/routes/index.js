import Vue from "vue";
import Router from "vue-router";
import LightHsv from "../pages/lightHsv.vue";
import ChildMode from "../pages/childMode.vue";
import LightSpeed from "../pages/lightSpeed";
import LightStatus from "../pages/lightStatus.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import ScenePage from "../../common/scenePage.vue";
import SignalTest from "../../common/signalTest.vue";
import GroupDeviceList from "../pages/groupDeviceList.vue";

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
    { path: "/child-mode", component: ChildMode, name: "childMode" },
    { path: "/light-status", component: LightStatus, name: "lightStatus" },
    { path: "/device-room", component: DeviceRoom, name: "DeviceRoom" },
    { path: "/light-speed", component: LightSpeed, name: "LightSpeed" },
    { path: "/signal-test", component: SignalTest, name: "SignalTest" },
    { path: "/group-device-list", component: GroupDeviceList, name: "GroupDeviceList" },
    { path: "/scene-page", component: ScenePage, name: "ScenePage" },
    { path: "/", component: LightHsv, name: "LightHsv" },
    { path: "*", component: LightHsv, name: "LightHsv" },
  ],
});
export default router;
