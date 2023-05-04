import axios from "axios";
import { host } from "./config";
import { execNativeFunc } from "../utils/bridge";   
axios.defaults.retry = 2; // 请求次数
axios.defaults.timeout = 60000;
axios.defaults.withCredentials = true;
window.__WINGTO__isOut = 0; // 是否是登录态失效
// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    console.log(config,'configconfigconfigconfigconfigconfig')
    config.headers.common["accessToken"] = window.__WINGTO__ && window.__WINGTO__.token;
    if(config.url === '/openapi/deviceJson/deviceList'){

      config.headers.common["cliType"] = 'APP_WAP';
      config.headers.common["cliV"] = '1.0.0';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器

axios.interceptors.response.use(
  (response) => {
    //0:操作成功;10:系统异常;401012:登录超时;4:校验异常;5:业务处理异常;11:通讯异常
    let { errorCode, errorMsg } = response.data;
    if (errorCode === "401012" || errorCode === "010001") {
      if (window.__WINGTO__isOut >= 2) return;
      execNativeFunc("onAuthModify", errorCode);
      window.__WINGTO__isOut++;
      return { data: null, error: { code: errorCode, msg: errorMsg } };
    }
    if (errorCode === "801") {
      let timer = setTimeout(() => {
        execNativeFunc("onNavigateTo", { type: 0 });
        timer && clearTimeout(timer);
      }, 1000);
    }
    window.__WINGTO__isOut = 0;
    if (errorCode === "0") {
      return { data: response.data, error: null };
    } else {
      return { data: null, error: { code: errorCode, msg: errorMsg } };
    }
  },
  (error) => {
    if (error.message && error.message.includes("Network Error")) {
      return { error: { code: -1 }, data: null };
    }
    if (error instanceof axios.Cancel) {
      return true;
    }
    if (error.message && error.message.includes("500")) {
      let errorData = { error: { code: 500, error }, data: null };
      return errorData;
    }
    if (!error.response) {
      // 请求超时处理
      if (error.message.includes("timeout")) {
        let config = error.config;
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= config.retry) {
          return { error: { code: -1 }, data: error };
        }
        // 累计已重试次数
        config.__retryCount += 1;
        let backoff = new Promise(function(resolve) {
          setTimeout(function() {
            resolve();
          }, config.retryDelay || 1);
        });
        // 重新发起请求
        return backoff.then(function() {
          return axios(config);
        });
      }
    } else {
      return {
        error: { code: error.response.status, error: error },
        data: null,
      };
    }
  }
);

export default axios;
