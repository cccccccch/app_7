/*
 * @Author: Dywade
 * @Date: 2022-01-21 11:40:22
 * @LastEditTime: 2022-02-21 17:45:31
 * @LastEditors: Dywade
 * @Description: 
 */
import Vue from "vue";
import Router from "vue-router";
import Curtain from "../pages/curtain.vue";
import CurtainCorrect from "../pages/curtainCorrect.vue";
import Preference from "../pages/preference.vue";
import CurtainType from "../pages/curtainType.vue";
import CurtainClock from "../pages/curtainClock.vue";
import CurtainGear from "../pages/curtainGear.vue";
import TimerSetting from "../pages/timerSetting.vue";
import TimerWeek from "../pages/timerWeek.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import SignalTest from "../../common/signalTest.vue";
import ScenePage from "../../common/scenePage.vue";
import GroupDeviceList from "../pages/groupDeviceList.vue";

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
    { path: "/correct", component: CurtainCorrect, name: "CurtainCorrect" },
    { path: "/preference", component: Preference, name: "Preference" },
    { path: "/type", component: CurtainType, name: "CurtainType" },
    { path: "/clock", component: CurtainClock, name: "CurtainClock" },
    { path: "/timer-setting", component: TimerSetting, name: "TimerSetting" },
    { path: "/timer-week", component: TimerWeek, name: "TimerWeek" },
    { path: "/group-device-list", component: GroupDeviceList, name: "GroupDeviceList" },
    { path: "/signal-test", component: SignalTest, name: "SignalTest" },
    { path: "/gear", component: CurtainGear, name: "CurtainGear" },
    { path: "/device-room", component: DeviceRoom, name: "DeviceRoom" },
    { path: "/scene-page", component: ScenePage, name: "ScenePage" },
    { path: "*", component: Curtain, name: "Curtain" }
  ]
});
export default router;
