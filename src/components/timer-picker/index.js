import Vue from "vue";
import TimerPicker from "./index.vue";
export default {
  create: function(options) {
    let TimerPickerComp = Vue.extend(TimerPicker);
    let instance = new TimerPickerComp();
    let element;
    // 可插入到自定义元素中，支持id、class选择器
    if (options.el) { 
      element = document.querySelector(options.el) 
      if (!element) {
        console.warn(`${options.el} does not exist, TimerPicker's Modal will be mounted in document body`);
      }
    }
     // 判断是否自定义元素、否则插入到body中
    const container = element || document.body;
    instance.show = options.show;
    instance.okText = options.okText;
    instance.cancelText = options.cancelText;
    instance.hourText = options.hourText;
    instance.minuteText = options.minuteText;
    instance.initHour = options.initHour;
    instance.initMinute = options.initMinute;

    // 确定回调函数
    instance.onComfirm = function(data) {
      vm.show = false;
      options.onComfirm(data);
    };
    // 取消回调函数
    instance.onCancel = function() {
      vm.show = false;
      options.onCancel();
    };
    // 隐藏
    instance.hideModal = function() {
      vm.show = false;
    };
    // 显示
    instance.showModal = function(option) {
      const { initHour, initMinute } = option || {};
      if (initHour != undefined) {
        vm.initHour = initHour;
      }
      if (initMinute != undefined) {
        vm.initMinute = initMinute;
      }
      //   vm.initData();
      setTimeout(() => {
        vm.show = true;
      }, 1);
    };
    // 销毁
    instance.destroy = function() {
      container.removeChild(el);
    };
    const vm = instance.$mount();
    const el = vm.$el;
    // container
    container.appendChild(el); 
    return vm;
  }
};
