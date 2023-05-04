<template>
  <div class="countdown-box" @click.stop="() => {}">
    <div class="countdown" :class="{ 'hide-option-countdown': !showButton }">
      <div class="btn-option" v-if="showButton">
        <div
          class="option-text cancel-countdown"
          @click="handleCountdown('cancel')"
        >
          
          {{cancelText}}
        </div>
        <div
          class="option-text confirm-countdown"
          @click="handleCountdown('ok')"
        >
          {{okText}}
        </div>
      </div>
      <div class="component">
        <div class="" ref="timerPickerWrap">
          <div class="scroller-box">
            <div class="current-time">
              <div class="desc">
                <span class="space"></span>
                <span class="hour">{{ hourDesc }}</span>
                <span class="minute">{{ minuteDesc }}</span>
              </div>
            </div>
            <div
              ref="hours"
              class="hours-wrap"
              :style="{
                transform: `translate3d(0,${hourTop}px,0)`,
                marginTop: `${marginTop}px`,
                transition: touchStart.isTouching
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(.25, .46, .45, .94)',
              }" 
              @transitionend="ontransitionend"
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

            <div
              ref="minutes"
              class="minutes-wrap"
              @transitionend="ontransitionend"
              :style="{
                transform: `translate3d(0,${minuteTop}px,0)`,
                marginTop: `${minuteMarginTop}px`,
                transition: touchStartMinute.isTouching
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(.25, .46, .45, .94)',
              }"
              @touchstart="onTouchStartMinute"
              @touchmove="onTouchMoveMinute"
              @touchend="onTouchEndMinute"
            >
              <div
                v-for="item in minutes"
                :key="item.key"
                class="text normal middle"
                :data-index="item.key"
                :style="{ height: lineheight.normal + 'px' }"
                :class="{
                  'selected-item': currentMinuteIndex == item.key,
                  'front-first-wrap': first(currentMinuteIndex, item.key),
                  'front-second-wrap': second(currentMinuteIndex, item.key),
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
const PRE_DEGREE = 10;
export default {
  name: "timer-picker",
  props: {
    showButton: {
      type: Boolean,
      default: true,
    },
    maxDegree: {
      type: Number,
      default: 23,
    },
    minDegree: {
      type: Number,
      default: 0,
    },
    hourDesc: {
      type: String,
      default: "时",
    },
    minuteDesc: {
      type: String,
      default: "分",
    },
    initHour: {
      type: Number,
      default: 24,
    },
    initMinute: {
      type: Number,
      default: 15,
    },
    value: {
      type: Boolean,
      default: false,
    },
    okText: {
      type: String,
      default: '确定',
    },
    cancelText: {
      type: String,
      default: '取消',
    }, 
  },
  data() {
    return {
      hours: Array.from({ length: 81 }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + (this.maxDegree - this.minDegree + 1) : k;
        return { value: value % (this.maxDegree - this.minDegree + 1), key: k };
      }),
      minutes: Array.from({ length: 81 }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + 60 : k;
        return { value: value % 60, key: k };
      }),
      currentIndex: 24,
      currentMinuteIndex: 15,
      hourTop: 0,
      minuteTop: 0,
      marginTop: 0,
      minuteMarginTop: 0,
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
      touchStartMinute: {
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
  watch: {
    value(val) {
      this.setInitData();
      
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
      this.currentMinuteIndex = this.initMinute;
      this.hours = Array.from({ length: 81 }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + (this.maxDegree - this.minDegree + 1) : k;
        return { value: value % (this.maxDegree - this.minDegree + 1), key: k };
      });
      this.minutes = Array.from({ length: 81 }, (v, k) => {
        k = k - PRE_DEGREE;
        const value = k < 0 ? k + 60 : k;
        return { value: value % 60, key: k };
      });
      this._getRect();
    },
    onTouchStart(e) {
      this.touchStart.y = e.changedTouches[0].clientY;
      this.touchStart.initTop = this.hourTop;
      this.touchStart.currentIndex = this.currentIndex;
      this.touchStart.unit = 0;
      this.touchStart.isTouching = true;
      this.touchStart.marginTop = this.marginTop;
      this.$emit("onFingerTouch", true);
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
       const current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
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
          this.hours.push({
            key: item.key + i + 1,
            value: (item.value + i + 1) % (this.maxDegree - this.minDegree + 1),
          });
        }
      } else if (g > 0) {
        this.hours.splice(-g);
        const item = this.hours[0];
        for (let i = 0; i < Math.abs(g); i++) {
          this.hours.unshift({
            key: item.key - i - 1,
            value:
              item.value - i - 1 < 0 ? item.value - i + (this.maxDegree - this.minDegree) : item.value - i - 1,
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
      this.$emit("onFingerTouch", false);
      if (!this.showButton) {
        this.$emit("onTimeChange", {
          hour: this.hours.find((s) => s.key == this.currentIndex).value,
          minute: this.minutes.find((s) => s.key == this.currentMinuteIndex)
            .value,
        });
      }
    },

    onTouchStartMinute(e) {
      this.touchStartMinute.y = e.changedTouches[0].clientY;
      this.touchStartMinute.initTop = this.minuteTop;
      this.touchStartMinute.currentIndex = this.currentMinuteIndex;
      this.touchStartMinute.unit = 0;
      this.touchStartMinute.isTouching = true;
      this.touchStartMinute.marginTop = this.minuteMarginTop;
      this.touchStartMinute.startTime = Date.now();
      this.$emit("onFingerTouch", true);
    },

    onTouchMoveMinute(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.y - this.touchStartMinute.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.currentMinuteIndex = this.touchStartMinute.currentIndex - unit;
      this.touchStartMinute.unit = unit;
      this.minuteTop = this.touchStartMinute.initTop + distance;
    },
    onTouchEndMinute(e) {
      const touchMiles = Date.now() - this.touchStartMinute.startTime;
      if (touchMiles < 90) {
        this.currentMinuteIndex -= this.touchStartMinute.unit * 2;
        this.touchStartMinute.unit *= 3;
      } else if (touchMiles < 180) {
        this.currentMinuteIndex -= this.touchStartMinute.unit;
        this.touchStartMinute.unit *= 2;
      }
      this.touchStartMinute.currentIndex = this.currentMinuteIndex;
      const g = this.touchStartMinute.unit;
      if (g < 0) {
        this.minutes.splice(0, Math.abs(g));
        const item = this.minutes[this.minutes.length - 1];
        for (let i = 0; i < Math.abs(g); i++) {
          this.minutes.push({
            key: item.key + i + 1,
            value: (item.value + i + 1) % 60,
          });
        }
      } else if (g > 0) {
        this.minutes.splice(-g);
        const item = this.minutes[0];
        for (let i = 0; i < Math.abs(g); i++) {
          this.minutes.unshift({
            key: item.key - i - 1,
            value:
              item.value - i - 1 < 0 ? item.value - i + 59 : item.value - i - 1,
          });
        }
      }
      this.minuteMarginTop =
        this.touchStartMinute.marginTop - g * this.lineheight.normal;
      this.$nextTick(() => {
        setTimeout(() => {
          this.minuteTop =
            this.touchStartMinute.initTop + this.lineheight.normal * g;
          this.touchStartMinute.initTop = this.hourTop;
          this.touchStartMinute.isTouching = false;
        }, 20);
      });
      this.$emit("onFingerTouch", false);
      if (!this.showButton) {
        this.$emit("onTimeChange", {
          hour: this.hours.find((s) => s.key == this.currentIndex).value,
          minute: this.minutes.find((s) => s.key == this.currentMinuteIndex)
            .value,
        });
      }
    },
    _getRect() {
      this.$nextTick(() => {
        this.lineheight.normal = Math.round((74 / 750) * window.screen.width);
        this.lineheight.main = Math.round((112 / 750) * window.screen.width);
        this.lineheight.primary = Math.round((78 / 750) * window.screen.width);
        this.hourTop =
          (2 - PRE_DEGREE - this.currentIndex) * this.lineheight.normal;
        this.minuteTop =
          (2 - PRE_DEGREE - this.currentMinuteIndex) * this.lineheight.normal;
        this.minuteMarginTop = 0;
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
          hour: this.hours.find((s) => s.key == this.currentIndex).value,
          minute: this.minutes.find((s) => s.key == this.currentMinuteIndex)
            .value,
        }); 
      }
    } ,
    ontransitionend() {
      this.touchStart.isTouching = true
      this.touchStartMinute.isTouching = true
      // console.log('ontransitionend')
    }
  },
  created() { 
    this.currentIndex = this.initHour;
    this.currentMinuteIndex = this.initMinute;
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
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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
      width: max-content;
      white-space: nowrap;
      height: 45px;
      font-size: 32px; 
      font-weight: 400;
      color: #4289ff;
      line-height: 45px;
    }
  }
  .hide-option-countdown {
    height: 416px;
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
    // border: 1px solid #e1e1e4;
    &::after { 
      display: block;
      content: ''; 
      width: 750px;
      border-bottom: 1px solid #e1e1e4; 
      transform:   scaleY(1);
      position: absolute;
    }
    &::before {
      display: block;
      content: ''; 
      width: 750px; 
      border-top: 1px solid #e1e1e4;
      transform:   scaleY(1);
      position: absolute;
      bottom: 0;
    }
    @media screen and (-webkit-min-device-pixel-ratio:3) {
        &::after,
        &::before { 
          transform:   scaleY(0.5); 
        }
    }
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
        width: 300px;
      }
      .hour {
        font-size: 24px;
        line-height: 32px;
        flex: 1;
      }
      .minute {
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
  .minutes-wrap {
    position: absolute;
    right: 184px;
    padding: 0 48px;
    top: 0;
    overflow: hidden;
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
      opacity: 0.35;
    }
    .selected-item {
      width: 100%;
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

  .hours-wrap {
    position: absolute;
    left: 180px;
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
      opacity: 0.35;
      color: #121212; 
    }
    .selected-item {
      width: 100%;
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
}
</style>
