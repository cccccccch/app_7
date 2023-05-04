import Vue from "vue";
import App from "./App.vue";
import "../../assets/css/common.less";
import "../../assets/css/normalize.css";
import "../../assets/iconfont/iconfont.css";
import "../../assets/font/iconfont.css";
import HybridConfig from "../../utils/bridge";
import store from "../../store/index";
import Toast from "../../components/modals/toast/index";
import router from "./routes/index";

Vue.config.productionTip = false;
Vue.use(HybridConfig);
Vue.prototype.$Toast = Toast;
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
