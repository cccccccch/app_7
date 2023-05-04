<template>
  <div class="box">
    <div class="icon-size left">
      <span class="icon-liangdu"></span>
    </div>
    <div class="slider-container" @click.stop="setCurrentValue" ref="slider">
      <div class="bg"></div>
      <div class="slider" :style="{ right: `${100 - current}%` }"></div>
      <div class="slider-box" :style="{ right: `${100 - current}%` }" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" @touchcancel="touchcancel">

      </div>
      <div class="slider-pointer-active" :style="{ right: `${100 - current}%`, opacity: isTouching ? 0.5 : 0 }" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" @touchcancel="touchcancel"></div>
      <div class="slider-pointer" :style="{ right: `${100 - current}%` }" ></div>
    </div>
    <div class="icon-size right">
      <span class="icon-liangdu"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: "Slider",
  data() {
    return {
      current: 0, // 当前值 0 ~ 100
      width: 0, // 总长度
      isTouching: false, // 是否在触摸中
      touch: {
        current: 0,
        x: 0
      }
    };
  },
  props: {
    initVal: {
      type: [Number],
      default: 50
    }
  },
  methods: {
    setCurrentValue(e) {
      if (this.$refs.slider) {
        const ratio = e.offsetX / this.width;
        this.current = this.limit(Math.round(ratio * 100));
        this.$emit("on-change", this.current);
      }
    },
    touchstart(e) {
      this.isTouching = true;
      //   console.log(" this.touch.current:", this.touch.current);
      this.touch.x = e.changedTouches[0].clientX;
      this.touch.current = this.current;
    },
    touchmove(e) {
      const x = e.changedTouches[0].clientX;
      this.setCurrent(x);
    },
    touchend(e) {
      this.isTouching = false;
      this.setCurrent(e.changedTouches[0].clientX);
      this.$emit("on-change", this.current);
    },
    touchcancel(e) {
      //   console.log("cancel", e);
    },
    setCurrent(x) {
      const distance = x - this.touch.x;
      const ratio = distance / this.width;
      //   console.log("touchmove", x, distance, ratio);
      this.current = this.limit(this.touch.current + Math.round(ratio * 100));
    },
    limit(val) {
      return val > 100 ? 100 : val < 0 ? 0 : val;
    }
  },
  created() {
    this.current = this.initVal;
  },
  mounted() {
    this.width = this.$refs.slider.clientWidth;
  },
  watch: {}
};
</script>
<style scoped lang="less">
.box {
  width: 100%;
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  .icon-size {
    width: 40px;
    height: 40px;
    font-family: "iconfont";
  }
  .slider-container {
    flex: 1;
    margin: 0 30px;
    position: relative;
    height: 40px;
    .bg {
      position: absolute;
      transform: translateY(-50%);
      top: 50%;
      left: 0;
      right: 0;
      z-index: 1;
      height: 6px;
      background: #f0f0fd;
      border-radius: 3px;
    }
    .slider {
      position: absolute;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      top: 50%;
      z-index: 2;
      height: 6px;
      background: #6165c5;
      border-radius: 3px;
    }

    .slider-box{
        position: absolute;
        transform: translate(50%, -50%);
        top: 50%;
        z-index: 5;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        background: transparent;
        opacity: 0;
    }
    .slider-pointer-active {
      position: absolute;
      transform: translate(50%, -50%);
      top: 50%;
      z-index: 3;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      background: #6165c5;
      opacity: 0;
    }
    .slider-pointer {
      position: absolute;
      transform: translate(50%, -50%);
      top: 50%;
      z-index: 4;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      background: #ffffff;
      box-shadow: -2px 4px 4px 0px rgba(0, 0, 0, 0.1), 0px 4px 21px 0px rgba(0, 0, 0, 0.08), 0px 0px 4px 0px rgba(0, 0, 0, 0.02);
    }
  }
  .left {
    span {
      line-height: 40px;
      font-size: 40px;
      color: #dddddd;
    }
  }
  .right {
    span {
      line-height: 40px;
      font-size: 40px;
      color: #6165c5;
    }
  }
}
</style>
