import Vue from "vue";
import App from "./App.vue";
import router from './routes/index';
import '../../assets/css/normalize.css';
import '../../assets/iconfont/iconfont.css';
import HybridConfig from '../../utils/bridge';
import store from '../../store/index';
import Toast from '../../components/modals/toast/index';

Vue.config.productionTip = false;
Vue.use(HybridConfig)
Vue.prototype.$Toast = Toast
new Vue({
  store,
  render: (h) => h(App),
  router
}).$mount("#app");
