import Vue from 'vue'
import Router from 'vue-router'
import AirCon from '../pages/aircondition.vue'
import DeviceRoom from '../../common/deviceRoom.vue'
import ScenePage from '../../common/scenePage.vue'
import SignalTest from "../../common/signalTest.vue";

const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err);
};
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [ 
        { path: '/device-room', component: DeviceRoom, name: 'DeviceRoom' },
        { path: '/scene-page', component: ScenePage, name: 'ScenePage' },
        {
            path: "/signal-Test",
            component: SignalTest,
            name: "SignalTest",
            meta: { level: 2 },
          },
        { path: '*', component: AirCon, name: 'air-condition' }
    ]
})
export default router