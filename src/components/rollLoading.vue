<template>
  <div class="rollLoading" ref="rollCircle">
    <div class="roll-circle" :style="{ width: len + 'px', height: len + 'px' }">
      <svg :width="len" :height="len" class="center">
        <defs>
          <linearGradient x1="1" y1="0" x2="0" y2="0" id="gradient1">
            <stop offset="0%" :style="{ 'stop-color': startColor }" />
            <stop offset="60%" :style="{ 'stop-color': stopColor }" />
            <stop offset="100%" :style="{ 'stop-color': stopColor }" />
          </linearGradient>
        </defs>
        <g :transform="`matrix(0,-1,1,0,0,${len})`">
          <circle :cx="len / 2" :cy="len / 2" :r="r" :stroke-width="strokeWidth" stroke="url('#gradient1')" fill="none" :stroke-dasharray="`${radiusL} ${radiusL}`"></circle>
        </g>
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  name: "rollLoading",
  props: {
    strokeWidth: {
      type: Number,
      default: 5,
    },
    startColor: {
      type: String,
      default: "rgba(255, 255, 255, 1)",
    },
    stopColor: {
      type: String,
      default: "rgba(255, 255, 255, 0.1)",
    },
    duration: {
      type: Number,
      default: 2000,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      timer: null,
      len: 0,
      radiusL: 0,
      r: 0,
    };
  },
  methods: {
    init() {
      const rect = this.$refs.rollCircle.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;
      let len = 0;
      if (width > 0 && height > 0) {
        len = Math.min(width, height);
      } else {
        len = width > 0 ? width : height;
      }
      this.len = len;
      this.radiusL = (Math.PI * 2 * len) / 2;
      this.r = len / 2 - 10 > 0 ? len / 2 - 10 : len / 2;
      this.timer = setTimeout(() => {
        this.$emit("input", false);
        this.$emit("on-hide");
        this.timer && clearTimeout(this.timer);
      }, this.duration);
    },
  },
  beforeDestroy() {
    this.timer && clearTimeout(this.timer);
  },
  mounted() {
    this.init();
  },
  watch: {
    value(newV) {
      if (newV) {
        this.init();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.rollLoading {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .roll-circle {
    border-radius: 50%;
    animation: rolling infinite 1s linear;
  }
  @keyframes rolling {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
