import Vue from 'vue'
import Router from 'vue-router'
import Home from '../pages/home.vue'


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
    routes: [{
            path: '/',
            component: Home,
            name: 'Home'
        },
        {
            path: '/home',
            component: Home,
            name: 'Home'
        },
        {
            path: '*',
            component: Home,
            name: 'Home'
        },

    ]
})
export default router