<template>
  <div class="spin-loading" ref="spinLoading" @click.stop.prevent @touchstart.stop.prevent>
    <div class="spin-loading-mask"></div>
    <div class="svg-wrap">
      <svg width="100%" height="100%">
        <circle cx="50%" cy="50%" :r="radius" stroke-width="5" stroke="none" fill="none"></circle>
        <circle cx="50%" cy="50%" class="svg-rotate" :r="radius" stroke-width="4" stroke-linecap="round" stroke="#4089FF" fill="none" :stroke-dashoffset="startC" :stroke-dasharray="totalC"></circle>
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  name: "spin-loading",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: 2000,
    },
  },
  data() {
    return {
      radius: 20,
      totalC: 0,
      loading: false,
      isSetTime: false,
      timer: null,
      startC: 0,
    };
  },
  methods: {
    getRect() {
      if (!this.$refs.spinLoading) return;
      const rect = this.$refs.spinLoading.getBoundingClientRect();
      if (!rect) return;
      // const r = Math.min(rect.height, rect.width) || 0;
      this.radius = 100 / 4; // 固定大小
      this.totalC = 2 * Math.PI * this.radius;
      this.startC = this.totalC;
      this.$nextTick(() => {
        this.isSetTime = true;
        this.loading = true;
        this.setTimer();
      });
    },
    setTimer() {
      let step = (this.startC / this.duration) * 16.7; // 16.7 :屏幕刷新率，默认60Hz
      const roll = () => {
        this.startC = this.startC - step;
        if (this.startC <= 0) {
          this.loading = false;
          this.$emit("input", false);
          window.cancelAnimationFrame(this.timer);
          return;
        }
        this.timer = window.requestAnimationFrame(roll);
      };
      roll();
    },
  },
  beforeDestroy() {
    this.timer && window.cancelAnimationFrame(this.timer);
  },
  watch: {
    value(newV) {
      if (newV) {
        this.$nextTick(() => {
          this.getRect();
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
.spin-loading {
  width: 100%;
  height: 100%;
  .spin-loading-mask {
    position: absolute !important;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    filter: blur(10px);
    z-index: 1;
  }
  .svg-wrap {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
    transform: rotate(-90deg);
  }
  .svg-rotate {
    // transition-property: stroke-dashoffset;
    // transition-timing-function: linear;
  }
}
</style>
