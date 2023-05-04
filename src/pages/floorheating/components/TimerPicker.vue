<template>
  <div class="countdown-box" :class="{ 'options-box-show': value }">
    <div class="countdown">
      <div class="btn-option">
        <div
          class="option-text cancel-countdown"
          @click="handleCountdown('cancel')"
        >
          取消
        </div>
        <div
          class="option-text confirm-countdown"
          @click="handleCountdown('ok')"
        >
          <slot name="confirm">确认</slot> 
        </div>
      </div>
      <div class="component">
        <div class="" ref="timerPickerWrap">
          <div class="scroller-box">
            <div class="current-time">
              <div class="desc">
                <span class="space"></span>
                <span class="hour">{{ hourDesc }}</span> 
              </div>
            </div>
            <div
              ref="hours"
              class="hours-wrap"
              :style="{
                transform: `translateY(${hourTop}px)`,
                marginTop: `${marginTop}px`,
                transition: touchStart.isTouching
                  ? 'none'
                  : 'all 0.2s ease-out',
              }"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
            >
              <div
                v-for="item in hours"
                :key="item.key"
                class="text normal middle"
                :style="{ height: lineheight.normal + 'px' }"
                :data-index="item.key"
                :class="{
                  'selected-item': currentIndex == item.key,
                  'front-first-wrap': first(currentIndex, item.key),
                  'front-second-wrap': second(currentIndex, item.key),
                }"
              >
                <span class="front">{{ formatt(item.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "timer-picker-ventilator",
  props: {
    maxDegree: {
      type: Number,
      default: 12,
    },
    minDegree: {
      type: Number,
      default: 1,
    },
    step: {
      type: Number,
      default: 1,
    },
    hourDesc: {
      type: String,
      default: "小时后关机",
    }, 
    initHour: {
      type: Number,
      default: 12,
    }, 
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hours: Array.from({ length: 41 }, (v, k) => {
        return { value: (k % ((this.maxDegree - this.minDegree +1) / this.step)) * this.step + 1, key: k };
      }),
      currentIndex: 24,  
      hourTop: 0, 
      marginTop: 0, 
      lineheight: {
        main: 0,
        primary: 0,
        normal: 0,
      },
      touchStart: {
        isTouching: false,
        x: 0,
        y: 0,
        initTop: 0,
        marginTop: 0,
        unit: 0,
        currentIndex: 0,
        startTime: 0,
      }, 
    };
  },
  computed: {
    // 单元格数量
    units() {
      return this.maxDegree - this.minDegree + 1
    }
  },
  watch: {
    value() {
      this._getRect();
    },
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
      this.currentIndex = this.initHour; 
      this._getRect();
    },
    onTouchStart(e) {
      this.touchStart.y = e.changedTouches[0].clientY;
      this.touchStart.initTop = this.hourTop;
      this.touchStart.currentIndex = this.currentIndex;
      this.touchStart.unit = 0;
      this.touchStart.isTouching = true;
      this.touchStart.marginTop = this.marginTop; 
      this.touchStart.startTime = Date.now();
    },

    onTouchMove(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.y - this.touchStart.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.currentIndex = this.touchStart.currentIndex - unit;
      this.touchStart.unit = unit;
      this.hourTop = this.touchStart.initTop + distance;
    },
    onTouchEnd(e) {
      const touchMiles = Date.now() - this.touchStart.startTime;
      if (touchMiles < 90) {
        this.currentIndex -= this.touchStart.unit * 2;
        this.touchStart.unit *= 3;
      } else if (touchMiles < 180) {
        this.currentIndex -= this.touchStart.unit;
        this.touchStart.unit *= 2;
      }
      this.touchStart.currentIndex = this.currentIndex;
      const g = this.touchStart.unit; 
      if (g < 0) {
        this.hours.splice(0, Math.abs(g));
        const item = this.hours[this.hours.length - 1];
        for (let i = 0; i < Math.abs(g); i++) {
          const value = item.value + i + 1
          this.hours.push({
            key: item.key + i + 1,
            value: value > this.units ? value % this.units : value,
          });
        }
      } else if (g > 0) {
        this.hours.splice(-g);
        const item = this.hours[0];
        for (let i = 0; i < Math.abs(g); i++) {
          const k = item.key - i - 1
          const value = item.value - i - 1 
          this.hours.unshift({
            key: k,
            value: value <= 0 ? value + this.units : value
          });
        }
      }
      this.marginTop = this.touchStart.marginTop - g * this.lineheight.normal;
      this.$nextTick(() => {
        setTimeout(() => {
          this.hourTop = this.touchStart.initTop + this.lineheight.normal * g;
          this.touchStart.initTop = this.hourTop;
          this.touchStart.isTouching = false;
        }, 20);
      }); 
    },
 
    _getRect() {
      this.$nextTick(() => {
        this.lineheight.normal = Math.round((74 / 750) * window.screen.width);
        this.lineheight.main = Math.round((112 / 750) * window.screen.width);
        this.lineheight.primary = Math.round((78 / 750) * window.screen.width);
        this.hourTop = (2 - this.currentIndex) * this.lineheight.normal; 
      });
    },
    handleCountdown(name) {
      if ("cancel" == name) {
        this.$emit("input", false);
        this.$emit("on-cancel");
      } else if ("ok" == name) {
        this.$emit("input", false);
        this.$emit("on-confirm", {
          hour: this.hours.find((s) => s.key == this.currentIndex).value
        });
      }
    },
  },
  created() {
    this.currentIndex = this.initHour; 
  },
  mounted() {
    this._getRect();
  },
};
</script>
<style lang="less" scoped>
@level1: 112px;
@level2: 78px;
@level3: 74px;
.countdown-box {
  position: absolute;
  z-index: 99;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
  transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
  .auto-shutdown,
  .countdown {
    height: 528px;
    background: #ffffff;
    width: 100%;
    flex-direction: column;
    align-items: center;
    display: flex;
    justify-content: space-evenly;
    .component {
      height: 416px;
      width: 100%;
    }
    .btn-option {
      width: 100%;
      height: 32px;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
      .option-text {
        width: 64px;
        height: 32px;
        font-size: 32px; 
        font-weight: 400;
        color: #959495;
        line-height: 32px;
      }
      .cancel-countdown {
        margin-left: 40px;
        color: #959495;
      }
      .confirm-countdown {
        margin-right: 40px;
        color: #4289ff;
      }
    }
    .option-text {
      height: 45px;
      font-size: 32px; 
      font-weight: 400;
      color: #4289ff;
      line-height: 45px;
    }
  }
}
.text {
  height: 40px;
  font-size: 40px; 
  font-weight: 400;
  color: #121212;
  line-height: 40px;
  width: 58px;
}
.scroller-box {
  position: relative;
  display: flex;
  justify-content: space-around;
  overflow: hidden;
  height: 416px;
  .current-time {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 750px;
    height: @level1;
    border: 1px solid #e1e1e4;
    .desc {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 48px;
      display: flex;
      width: 100%;
      align-items: flex-end; 
      font-weight: 400;
      color: #121212;
      justify-content: space-between;
      line-height: 48px;
      .space {
        width: 412px;
      }
      .hour {
        font-size: 24px;
        line-height: 32px;
        flex: 1;
      } 
    }
  }
  .scroll {
    display: flex;
    flex-direction: column;
  } 

  .hours-wrap {
    position: absolute; 
    padding: 0 48px;
    top: 0;
    overflow: hidden;
    // transition: all 0.2s ease-in-out;
    user-select: none;
    .normal {
      height: @level3;
    }
    .middle {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .front {
      color: #121212; 
    }
    .selected-item {
      width: 100%;
      height: @level1 !important;
      display: flex;
      align-items: center;
      .front {
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
}
</style>
