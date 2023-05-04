import Vue from "vue";

/**
 * 使用方式： v-CDUnTouch
 */

const stopListener = function(e) {
  e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
};

const CDUnTouch = Vue.directive("CDUnTouch", {
  bind(el, binding) {
    if (!el || !binding) return;
    el.addEventListener(
      "touchstart",
      (e) =>
        document.body.addEventListener("touchmove", stopListener, {
          passive: false,
        }),
      { passive: false }
    );
    el.addEventListener("touchend", (e) => document.body.removeEventListener("touchmove", stopListener), { passive: false });
  },
});

const CDTAP = Vue.directive("CDTAP", {
  bind(node, binding) {
    if (!node) return;
    const el = node;
    let touchType = 0; // 0 短按， 1：长按， -1：不执行或者长按事件已经执行过
    let timer = null;
    let rect = {};
    el.addEventListener(
      "touchstart",
      function(e) {
        rect = el.getBoundingClientRect();
        touchType = 0;
        timer = setTimeout(() => {
          touchType = -1;
          binding.value(true);
          timer && clearTimeout(timer);
        }, 500);
      },
      false
    );
    el.addEventListener(
      "touchend",
      function(e) {
        const evt = e.changedTouches[0];
        const x = evt.clientX;
        const y = evt.clientY;
        if (x < rect.left || y < rect.top || x > rect.right || y > rect.bottom) {
          // 不在元素内松手，认为是取消事件
          touchType = -1;
          timer && clearTimeout(timer);
          return;
        }
        if (touchType === 1) {
          binding.value(true);
        } else if (touchType === 0) {
          binding.value(false);
        }
        touchType = 0;
        timer && clearTimeout(timer);
      },
      false
    );
    el.addEventListener(
      "touchcancel",
      function(e) {
        touchType = 0;
        timer && clearTimeout(timer);
      },
      false
    );
  },
});

function getTarget (node = document.body) {
  if (node === true) return document.body
  return node instanceof window.Node ? node : document.querySelector(node)
}

 
const transclude = Vue.directive('transclude', { 
  inserted (el, { value }, vnode) { 
    const { parentNode } = el
    const home = document.createComment('') 
    if (value !== false) {
      parentNode.replaceChild(home, el) // moving out, el is no longer in the document
      getTarget(value).appendChild(el) // moving into new place 
    } 
  }, 
  unbind (el, binding) { 
    const { parentNode } = el
    parentNode.removeChild(el)  
  } 
})

export { CDUnTouch, CDTAP, transclude };
