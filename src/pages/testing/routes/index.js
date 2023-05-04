/*
 * @Author: Dywade
 * @Date: 2022-01-21 11:40:22
 * @LastEditTime: 2022-02-21 17:45:31
 * @LastEditors: Dywade
 * @Description: 
 */
import Vue from "vue";
import Router from "vue-router";
import testing from "../pages/testing.vue";
import calibration from "../pages/calibration.vue";


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

    { path: "*", component: testing, name: "testing" },
    { path: "/calibration", component: calibration, name: "calibration" },
  ]
});
export default router;
