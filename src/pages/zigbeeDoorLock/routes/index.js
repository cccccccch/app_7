import Vue from "vue";
import Router from "vue-router";
import DoorLock from "../pages/doorLock.vue";
import PasswordKeyboard from "../pages/passwordKeyboard.vue";
import CreatePassword from "../pages/createPassword";
import TempPassword from "../pages/tempPassword";
import AuthManagement from "../pages/authManagement";
import UserPassword from "../pages/userPassword";
import LinkUser from "../pages/linkUser";
import DoorLog from "../pages/doorLog.vue";
import SharePassword from "../pages/shareTempPassword.vue";
import DeviceRoom from "../../common/deviceRoom.vue";
import ScenePage from "../../common/scenePage.vue";
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
    { path: "/password-keyboard", component: PasswordKeyboard, name: "PasswordKeyboard" },
    { path: "/temp-keyboard", component: TempPassword, name: "TempPassword" },
    { path: "/door-log", component: DoorLog, name: "DoorLog" },
    { path: "/auth", component: AuthManagement, name: "AuthManagement" },
    { path: "/link-user", component: LinkUser, name: "LinkUser" },
    { path: "/user-password", component: UserPassword, name: "UserPassword" },
    { path: "/share-password", component: SharePassword, name: "SharePassword" },
    { path: "/create-password", component: CreatePassword, name: "CreatePassword" },
    { path: "/device-room", component: DeviceRoom, name: "DeviceRoom" },
    { path: "/signal-test", component: SignalTest, name: "SignalTest" },
    { path: "/scene-page", component: ScenePage, name: "ScenePage" },
    { path: "*", component: DoorLock, name: "DoorLock" },
  ],
});
export default router;
