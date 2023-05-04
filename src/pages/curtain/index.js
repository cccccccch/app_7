import Vue from "vue";
import App from "./App.vue";
import HybridConfig from "../../utils/bridge";
import "../../assets/css/normalize.css";
import "../../assets/iconfont/iconfont.css";
import store from "../../store/index";
import router from "./routes/index";
import Toast from "../../components/modals/toast/index";
import "../../assets/css/common.less";

Vue.config.productionTip = false;
Vue.prototype.$Toast = Toast;
Vue.use(HybridConfig);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
