/*
 * @Author: Dywade
 * @Date: 2022-02-18 11:11:22
 * @LastEditTime: 2022-02-18 11:42:10
 * @LastEditors: Dywade
 * @Description: 
 */
import { createApp } from 'vue'
import App from './App.vue'
import HybridConfig from "../src/utils/bridge";
import "./assets/css/normalize.css";


const app = createApp(App)
app.use(HybridConfig)
app.mount('#app')
