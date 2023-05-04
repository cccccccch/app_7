import Vue from 'vue'
import Router from 'vue-router' 
import shadowKtv from '../pages/shadow-ktv.vue'
import DeviceRoom from '../../common/deviceRoom.vue' 
import ScenePage from '../../common/scenePage.vue'
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
        { path: '/scene-page', component: ScenePage, name: 'ScenePage' },
        { path: '/device-room', component: DeviceRoom, name: 'DeviceRoom' },
        { path: '*', component: shadowKtv, name: 'shadowKtv' },
    ]
})
export default router