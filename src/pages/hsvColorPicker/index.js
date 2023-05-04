import Vue from "vue";
import App from "./App.vue";
import HybridConfig from "../../utils/bridge";
import "../../assets/css/normalize.css";

Vue.config.productionTip = false;
Vue.use(HybridConfig);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
