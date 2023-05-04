/*
 * @Author: Dywade
 * @Date: 2021-11-04 09:42:15
 * @LastEditTime: 2022-02-15 10:52:25
 * @LastEditors: Dywade
 * @Description:
 */
import Toast from "./Toast.vue";
import Vue from "vue";

let toastTimer = null;
let instance = null;

const toast = Vue.extend(Toast);
let zIndex = 123456789;
let duration = 2000;
export default {
  show(params = {}) {
    const prevNode = document.body.querySelector(".cd-toast-normal");
    if (prevNode) {
      toastTimer && clearTimeout(toastTimer);
    } else {
      instance = new toast({ el: document.createElement("div") });
    }
    instance.zIndex = zIndex;
    instance.title = params.title;
    instance.type = params.type || 1;
    instance.postion = params.postion;
    document.body.appendChild(instance.$el);
    Vue.nextTick(() => {
      instance.isShow = true;
      toastTimer = setTimeout(() => {
        instance.isShow = false;
        instance.$destroy();
        let node = document.body.querySelectorAll(".cd-toast-normal")[0];
        if (!node) return;
        document.body.removeChild(node);
        instance = null;
        toastTimer && clearTimeout(toastTimer);
      }, params.duration || duration);
    });
  }
};
