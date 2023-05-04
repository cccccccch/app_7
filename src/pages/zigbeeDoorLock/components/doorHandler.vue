<template>
  <div class="door-handler" :class="{ active: isOpen }">
    <svg viewBox="0 0 182 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient x1="77.9779369%" y1="46.5221592%" x2="15.5240604%" y2="50%" id="linearGradient-1">
          <stop :stop-color="handlerColor1" offset="0%"></stop>
          <stop :stop-color="handlerColor2" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="51.0876376%" x2="0%" y2="50%" id="linearGradient-2">
          <stop stop-color="#A9A8AD" offset="0%"></stop>
          <stop stop-color="#CECDD3" offset="100%"></stop>
        </linearGradient>
        <radialGradient cx="50%" cy="0%" fx="50%" fy="0%" r="100%" id="radialGradient-3">
          <stop stop-color="#FFFFFF" offset="0%"></stop>
          <stop stop-color="#FFFFFF" stop-opacity="0.0971372378" offset="68.2939897%"></stop>
          <stop stop-color="#FFFFFF" offset="100%"></stop>
        </radialGradient>
      </defs>
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-576.000000, -425.000000)">
          <g transform="translate(576.000000, 425.000000)">
            <rect stroke="url(#linearGradient-2)" fill="url(#linearGradient-1)" x="0.5" y="0.5" width="181" height="47" rx="22.9392"></rect>
            <circle stroke="url(#radialGradient-3)" stroke-width="1.6" fill-opacity="0" fill="#D8D8D8" cx="29" cy="24" r="14.2"></circle>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
export default {
  props: {
    doorStatus: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  watch: {
    doorStatus(newV, oldV) {
      if (typeof newV === "boolean" && newV !== oldV) {
        this.isOpen = newV;
      }
    },
  },
  computed: {
    handlerColor1() {
      return this.isOpen ? "#A5AAFF" : "#ADADCF";
    },
    handlerColor2() {
      return this.isOpen ? "#6165C5" : "#525895";
    },
  },
};
</script>
<style lang="less" scoped>
.door-handler {
  position: relative;
  transition: all 0.3s ease-in-out;
  transform: rotate(0);
  transform-origin: 30px 50%;
  &.active {
    transform: rotate(25deg);
  }
}
</style>
