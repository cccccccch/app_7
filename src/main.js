import Vue from "vue";
import App from "./App.vue";


// 按需引入vant插件
import { RadioGroup,Radio,Cell,CellGroup,Slider,Icon,Tab, Tabs, Calendar,Popup,Stepper  } from 'vant';
import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false;
Vue.use(Popup);
Vue.use(RadioGroup);
Vue.use(Calendar);
Vue.use(Radio);
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(Slider);
Vue.use(Icon);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Stepper);
new Vue({
  render: h => h(App)
}).$mount("#app");
