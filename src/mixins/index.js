import { getUrlQuery } from "../utils/index";
import store from "../store/index";
export default {
    created() {
        const query = getUrlQuery(window.location.href);
        if (query) {
            if (query.token) {
                window.__WINGTO__.token = query.token;
            }
            if (query.platform) {
                // 地址栏可能是 /xxx.com/?token=xxx&platform=yyy#/
                window.__WINGTO__.platform = query.platform.indexOf("android") >= 0 ? "android" : query.platform.indexOf("ios") >= 0 ? "ios" : "";
            }
            if (query.deviceId) {
                store.commit("setGlobalDataId", { deviceId: query.deviceId });
            }
            if (query.familyId) {
                store.commit("setGlobalFamilyId", query.familyId);
            }
            if (query.dataTypeEnum) {
                store.commit("setGlobalDeviceType", query.dataTypeEnum);
            }
            if (query.userId) {
                store.commit("setGlobalUserId", query.userId);
            }
            if (query.appVersion) {
                // app版本规则， 原生传过来一个字符串'2.9.1'，分割后变成[2,9,1],权重分别乘以10000,100，然后相加，最后得到20901
                let arr = query.appVersion.split(".");
                if (Array.isArray(arr)) {
                  let v = Number(arr[0] * 10000) + Number(arr[1] * 100) + Number(arr[2]);
                  window.__WINGTO__.appVersion = v;
                  store.commit("setGlobalAppVersion", v);
                }
            }
            window.__WINGTO__.statusbarheight = parseFloat(query.statusbarheight) || 0;
        }
    },
    mounted() {
        this.notifyNativeReady && this.notifyNativeReady();
    },
};
