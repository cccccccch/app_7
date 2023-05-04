<template>
  <div class="box">
    <div
      class="scroll-list"
      :style="{
        transform: `translate3d(0,${top}px,0)`,
        marginTop: `${marginTop}px`,
        transition: transition
      }"
      @transitionend="ontransitionend"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        v-for="item in list"
        :key="item.key"
        class="text normal middle"
        :style="{ height: lineheight.normal + 'px' }"
        :data-index="item.key"
        :class="{
          'selected-item': currentIndex == item.key,
          'front-first-wrap': first(currentIndex, item.key),
          'front-second-wrap': second(currentIndex, item.key)
        }"
      >
        <span class="front">{{ formatt(item.value) }}</span>
      </div>
    </div>
  </div>
</template>
<script>
const PRE_DEGREE = 10;
export default {
  name: "infinite-scroll",
  props: {
    showButton: {
      type: Boolean,
      default: true
    },
    maxDegree: {
      type: Number,
      default: 23
    },
    minDegree: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: "时"
    },
    initVal: {
      type: Number,
      default: 24
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: Array.from({ length: Math.floor((this.maxDegree - this.minDegree + 1) * 2.5) }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + (this.maxDegree - this.minDegree + 1) : k;
        return { value: (value % (this.maxDegree - this.minDegree + 1)) + this.minDegree, key: k };
      }),
      currentIndex: 24,
      top: 0,
      marginTop: 0,
      transition: "",
      lineheight: {
        main: 0,
        primary: 0,
        normal: 0
      },
      touchStart: {
        isTouching: false,
        x: 0,
        y: 0,
        initTop: 0,
        marginTop: 0,
        unit: 0,
        currentIndex: 0,
        startTime: 0
      }
    };
  },
  watch: {
    value(val) {
      this.setInitData();
    }
  },
  methods: {
    first(curentIdx, index) {
      return curentIdx == index - 1 || curentIdx == index + 1;
    },
    second(curentIdx, index) {
      return curentIdx == index - 2 || curentIdx == index + 2;
    },
    formatt(s) {
      if (!s) return "00";
      return (s + "").padStart(2, "0");
    },
    setInitData() {
      this.currentIndex = this.initVal;
      (this.list = Array.from({ length: Math.floor((this.maxDegree - this.minDegree + 1) * 2.5) }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + (this.maxDegree - this.minDegree + 1) : k;
        return { value: value % (this.maxDegree - this.minDegree + 1), key: k };
      })),
       this.$emit("onChange", {
        value: this.initVal
      });
        this._getRect();
    },
    onTouchStart(e) {
      this.touchStart.y = e.changedTouches[0].clientY;
      this.touchStart.initTop = this.top;
      this.touchStart.currentIndex = this.currentIndex;
      this.touchStart.unit = 0;
      this.touchStart.isTouching = true;
      this.touchStart.marginTop = this.marginTop;
      this.$emit("onFingerTouch", true);
      this.touchStart.startTime = Date.now();
      this.transition = "";
    },

    onTouchMove(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      const distance = curPosition.y - this.touchStart.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.currentIndex = this.touchStart.currentIndex - unit;
      this.touchStart.unit = unit;
      this.top = this.touchStart.initTop + distance;
    },
    onTouchEnd(e) {
      const touchMiles = Date.now() - this.touchStart.startTime;

      const curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      const distance = curPosition.y - this.touchStart.y;
      const rate = Math.abs(distance) / touchMiles;
      const unit = this.touchStart.unit // 移动的格子
      const isAdd = this.touchStart.unit > 0
      let multi = 0;
      let extra_multi = 1;
      let extra = 0
      let duration = 0.75;
      // 速率极慢
      if (rate > 0 && rate <= 0.2) {
        multi = 0;
        extra_multi = 0
        duration *= 2;
        console.log("速率极慢")
        // 速率较慢
      } else if (rate > 0.2 && rate <= 0.5) {
          console.log("速率较慢")
        multi = 1 
        if(Math.abs(this.touchStart.unit) >= 3) {
            multi = 0
            // extra = isAdd ? 1 : -1
        }
        duration *= 2;
        // 速率适中
      } else if (rate > 0.5 && rate <= 1) {
        //   console.log("速率适中")
        multi = 2; 
        if(Math.abs(this.touchStart.unit) >= 3) {
            multi = 1
        }
        duration *= 1.5;
        // 速率较快
      } else if (rate > 1 && rate <= 1.5) {
        //    console.log("速率较快")
        multi = 3;
        // 速率极快
      } else {
            // console.log("速率极快")
        multi = 4;
      }
      
      const currentIndex = this.currentIndex - this.touchStart.unit * multi;
      //   const times = Math.abs(this.touchStart.unit * multi)

      this.currentIndex -= this.touchStart.unit * multi + extra;
      this.touchStart.unit = this.touchStart.unit *(multi + extra_multi>0?multi + extra_multi: 1) + extra;

      //   this.useFrame(() => {
      //       this.touchStart.unit > 0 ? this.currentIndex -= 1:  this.currentIndex += 1

      //     console.log(this.currentIndex , currentIndex)
      //   }, duration, times)
        console.log({ multi, duration, rate, unit, actu: this.touchStart.unit });

      this.transition = `transform ${duration}s ${duration >= 0.75 * 1.5 ? "cubic-bezier(.25, .46, .45, .94)" : "cubic-bezier(.25, .46, .45, .94)"}`;
      this.touchStart.currentIndex = currentIndex;
      const g = this.touchStart.unit;
      if (g < 0) {
        this.list.splice(0, Math.abs(g));
        const item = this.list[this.list.length - 1];
        for (let i = 0; i < Math.abs(g); i++) {
          this.list.push({
            key: item.key + i + 1,
            value: (item.value + i + 1) % (this.maxDegree - this.minDegree + 1)
          });
        }
      } else if (g > 0) {
        this.list.splice(-g);
        const item = this.list[0];
        for (let i = 0; i < Math.abs(g); i++) {
          this.list.unshift({
            key: item.key - i - 1,
            value: item.value - i - 1 < 0 ? item.value - i + (this.maxDegree - this.minDegree) : item.value - i - 1
          });
        }
      }
      this.marginTop = this.touchStart.marginTop - g * this.lineheight.normal;

      this.$nextTick(() => {
        setTimeout(() => {
          this.top = this.touchStart.initTop + this.lineheight.normal * g;
          this.touchStart.initTop = this.top;
          this.touchStart.isTouching = false;
        }, 20);
      });
      this.$emit("onFingerTouch", false);
      this.$emit("onChange", {
        value: this.list.find(s => s.key == this.currentIndex).value
      });
      if (!this.showButton) {
        this.$emit("onTimeChange", {
          hour: this.list.find(s => s.key == this.currentIndex).value
        });
      }
    },

    useFrame(fn, n, m) {
      let start;
      let miles = n / m;
      let startMiles;
      const step = timestamp => {
        if (start === undefined) {
          startMiles = timestamp;
          start = timestamp;
        }
        const elapsed = timestamp - start;

        if (n + startMiles > start) {
          if (elapsed < miles) {
            // 在两秒后停止动画

            window.requestAnimationFrame(step);
          } else {
            start += miles;
            console.log(start);
            fn();
            window.requestAnimationFrame(step);
          }
        }
      };
      window.requestAnimationFrame(step);
    },
    _getRect() {
      this.$nextTick(() => {
        this.lineheight.normal = Math.round((74 / 750) * window.screen.width);
        this.lineheight.main = Math.round((112 / 750) * window.screen.width);
        this.lineheight.primary = Math.round((78 / 750) * window.screen.width);
        this.top = (2 - PRE_DEGREE - this.currentIndex) * this.lineheight.normal;
        this.marginTop = 0;
      });
    },
    handleCountdown(name) {
      if ("cancel" == name) {
        this.$emit("input", false);
        this.$emit("on-cancel");
      } else if ("ok" == name) {
        this.$emit("input", false);
        this.$emit("on-confirm", {
          hour: this.list.find(s => s.key == this.currentIndex).value
        });
      }
    },
    ontransitionend() {
      this.transition = "";
      this.touchStart.isTouching = true;
    //   console.log("ontransitionend");
    }
  },
  created() {
    this.currentIndex = this.initVal;
  },
  mounted() {
    this._getRect();
  }
};
</script>
<style lang="less" scoped>
@level1: 112px;
@level2: 78px;
@level3: 74px;
.box {
    position: relative;
    display: flex;
    justify-content: space-around; 
    height: 55.46667vw;  
    overflow: hidden; 
}

.scroll-list {     
  user-select: none;
  .normal {
    height: @level3;
    padding: 0 56px;  
  }
  .middle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .text {
  height: 40px;
  font-size: 40px;
  font-weight: 400;
  color: #121212;
  line-height: 40px;
  // width: 58px;
}
  .front {
    opacity: 0.35;
    color: #121212;
  }
  .selected-item {
    // width: 100%;
    height: @level1 !important;
    display: flex;
    align-items: center;
    .front {
      opacity: 1;
      height: 48px;
      font-size: 48px;
      font-weight: 500;
      line-height: 48px;
    }
  }
  .front-first-wrap {
    height: @level2 !important;
    .front {
      height: 44px;
      font-size: 44px;
      font-weight: 400;
      line-height: 44px;
      opacity: 0.35;
    }
  }

  .front-second-wrap {
    height: @level3;
    .front {
      height: 40px;
      font-size: 40px;
      font-weight: 400;
      line-height: 40px;
      opacity: 0.35;
    }
  }
}
</style>
