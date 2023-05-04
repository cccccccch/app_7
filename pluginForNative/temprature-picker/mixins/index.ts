import { getUrlQuery } from '../utils/index'
import { WWindow } from './../utils/bridge';
export default {
    created() {
        const win: WWindow = window as any
        const query = getUrlQuery(window.location.href);
        if (query) {
            if (query.token) {
                win.__WINGTO__.token = query.token;
            }
            if (query.platform) {
                // 地址栏可能是 /xxx.com/?token=xxx&platform=yyy#/
                win.__WINGTO__.platform = query.platform.indexOf("android") >= 0 ? "android" : query.platform.indexOf("ios") >= 0 ? "ios" : "";
            }
            if (query.appVersion) {
                // app版本规则， 原生传过来一个字符串'2.9.1'，分割后变成[2,9,1],权重分别乘以10000,100，然后相加，最后得到20901
                let arr = query.appVersion.split(".");
                if (Array.isArray(arr)) {
                    let v = Number(Number(arr[0]) * 10000) + Number(Number(arr[1]) * 100) + Number(arr[2]);
                    win.__WINGTO__.appVersion = v;
                }
            }
            win.__WINGTO__.statusbarheight = (Number(query.statusbarheight)) || 0;
        }
    },
    mounted() {
        (this as any).notifyNativeReady && (this as any).notifyNativeReady();
    },
};
