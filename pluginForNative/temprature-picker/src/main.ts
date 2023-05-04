import { createApp } from 'vue'
import App from './App.vue'
import HybridConfig from "../utils/bridge";
import "./assets/css/normalize.css";


const app = createApp(App)
app.use(HybridConfig)
app.mount('#app')
