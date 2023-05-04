import Vue from 'vue'
import Router from 'vue-router'
import Socket from '../pages/Socket.vue'
import DeviceRoom from '../../common/deviceRoom.vue'
import ScenePage from '../../common/scenePage.vue'
import PreOffSetting from '../pages/PreOffSetting.vue'
import EffectLightSetting from '../pages/EffectLightSetting.vue'
import DoNotDisturbSetting from '../pages/DoNotDisturbSetting.vue' 
import SignalTest from "../../common/signalTest.vue"; 
import TimingSettingList from "@/pages/common/timingSettingList.vue";
import CountDownSetting from "@/pages/common/countDownSetting.vue";
import CDSetting from "../pages/CountDownSetting.vue";

import WeekSetting from "@/pages/common/weekSetting.vue";
import RepeatSetting from "@/pages/common/repeatSetting.vue";

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
    mode: 'hash',
    routes: [ 
        { path: '/device-room', component: DeviceRoom, name: 'DeviceRoom',meta: { level: 2 }},
        { path: '/scene-page', component: ScenePage, name: 'ScenePage',meta: { level: 2 } },
        { path: '/timing-setting', component: TimingSettingList, name: 'TimingSettingList',meta: { level: 2 } }, 
        { path: '/preoff-setting', component: PreOffSetting, name: 'PreOffSetting',meta: { level: 2 } }, 
        { path: '/self-cd-setting', component: CDSetting, name: 'CDSetting',meta: { level: 2 } },  
        { path: '/effect-setting', component: EffectLightSetting, name: 'EffectLightSetting',meta: { level: 2 } }, 
        { path: '/donot-disturb-setting', component: DoNotDisturbSetting, name: 'DoNotDisturbSetting',meta: { level: 3 } }, 
        { path: '/countdown-setting', component: CountDownSetting, name: 'CountDownSetting',meta: { level: 3 } }, 
        { path: '/repeat-setting', component: RepeatSetting, name: 'RepeatSetting',meta: { level: 4 } }, 
        { path: '/week-setting', component: WeekSetting, name: 'WeekSetting',meta: { level: 5 } }, 
        {
            path: "/signal-Test",
            component: SignalTest,
            name: "SignalTest",
            meta: { level: 2, keepAlive: false },
          }, 
        { path: '*', component: Socket, name: 'Socket',meta: { level: 1 } }
    ]
})
export default router