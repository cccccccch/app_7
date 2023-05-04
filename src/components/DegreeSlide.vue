<template>
  <div class="degree" ref="lineWrap" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" :style="{ height: boxHeight + 'px' }">
    <div class="px-line-wrap" :style="{ top: moveY + 'px' }">
      <div class="px-line line-position" :style="{ height: (devicePixelRatio * 1.5) / 3 + 'px', marginBottom: lineMargin + 'px' }" :class="{ long: item % 2 === 0 }" v-for="item of this.maxUnit" :key="item"></div>
    </div>
    <div class="px-indecator line-indicator" :style="{ 'background-color': isLightOn && !disabled ? '#D80200' : '', height: (devicePixelRatio * 2) / 2 + 'px', top: indicatorY + 'px' }"></div>
  </div>
</template>
<script>
import { throttle } from "../utils/index";
export default {
  name: "DegreeSlide",
  props: {
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
    dpr: {
      type: Number,
      default() {
        return 28;
      },
    },
    // 可滚动刻度 [0,99] 100个单位
    maxUnit: {
      type: Number,
      default() {
        return 100;
      },
    },
    // 开始刻度，默认0
    startDegree: {
      type: Number,
      default() {
        return 0;
      },
    },
    // 结束刻度，默认99
    endDegree: {
      type: Number,
      default() {
        return 99;
      },
    },
    isLightOn: {
      type: Boolean,
      default() {
        return false;
      },
    },
    miniDegree: {
      type: Boolean,
      default() {
        return false;
      },
    },
    curDegree: {
      type: Number,
      default() {
        return 0;
      },
    },
  },
  data() {
    return {
      moveY: 0,
      EndY: 0,
      devicePixelRatio: 1,
      moveNum: 0,
      targetDegree: 0, // 滚动下一帧的刻度值
      currentDegree: 0, // 当前刻度的最终值
      UpTop: 0,
      BottomTop: 0,
      slideDirection: "",
      slideDistance: 0,
      slideMode: "normal",
      lineHeight: 0,
      lineGap: 0,
      lineMargin: 0,
      indicatorY: 0,
      initLineMargin: 28,
      boxHeight: 0,
      initBoxHeight: 0,
      boxTop: 0,
    };
  },
  methods: {
    setDPR(height = 28) {
      this.devicePixelRatio = window.devicePixelRatio;
      this.lineMargin = height / this.devicePixelRatio;
    },
    setLinesOffset() {
      this.$nextTick(() => {
        let scale = this.miniDegree ? 1 : 1.2;
        this.boxHeight = this.initBoxHeight * scale;
        this.indicatorY = this.boxHeight / 2;
        this.lines = document.querySelectorAll(".px-line");
        if (!this.lines || !this.lines.length) return;
        const lines1 = this.lines[0].getBoundingClientRect().top;
        const lines2 = this.lines[1].getBoundingClientRect().top;
        this.lineHeight = this.lines[0].getBoundingClientRect().height;
        this.lineGap = Math.abs(lines1 - lines2);
        this.offsetObj = {};
        for (let i = 0; i < this.maxUnit; i++) {
          this.offsetObj[i] = this.lineGap * i + this.indicatorY;
        }
        this.UpTop = this.offsetObj[0];
        this.BottomTop = this.indicatorY - (this.offsetObj[this.DValue] - this.offsetObj[0]);
        let y = this.currentDegree > this.maxUnit - 1 ? this.maxUnit - 1 : this.currentDegree;
        this.moveY = this.indicatorY - (this.offsetObj[y] - this.offsetObj[0]);
        this.EndY = this.moveY;
      });
    },
    onTouchStart(e) {
      if (this.disabled) return;
      if (!this.isLightOn) return;
      let that = this;
      cancelAnimationFrame(that.requestAnimationFrameHandler);
      this.startY = e.touches[0].clientY;
      this.startTime = new Date().getTime();
      this.$emit("onFingerTouch", true);
    },
    onTouchMove(e) {
      if (this.disabled) return;
      if (!this.isLightOn) return;
      let currentY = e.touches[0].clientY;
      let moveY = this.EndY + currentY - this.startY;
      moveY = moveY >= this.UpTop ? this.UpTop : moveY <= this.BottomTop ? this.BottomTop : moveY;
      this.moveY = moveY;
      this._emitSlide();
    },
    onTouchEnd(e) {
      if (this.disabled) return;
      if (!this.isLightOn) return;
      this.$emit("onFingerTouch", false);
      let endTouch = e.changedTouches[0];
      let touchDistance = endTouch.clientY - this.startY;
      this.EndY = this.moveY;
      let moveDegree = touchDistance / this.lineGap;
      let num = Math.round(Math.abs(touchDistance / this.lineGap));
      this._setDegree(touchDistance, moveDegree); // 保存当期的刻度值和移动方向
      this.moveNum = num;
      if (num === 0) {
        this.targetY = this.indicatorY - (this.offsetObj[this.currentDegree] - this.offsetObj[0]);
        this.slideMode = "slow";
      } else {
        const endTime = new Date().getTime();
        const duration = endTime - this.startTime;
        if (duration < 200 && num > 2) {
          let diffY = touchDistance > 0 ? -num : num;
          let deNum = this.currentDegree + diffY;
          let len = this.lines.length - 1;
          deNum = deNum <= len ? (deNum >= 0 ? deNum : 0) : len;
          this.currentDegree = deNum;
          this.targetY = this.indicatorY - (this.offsetObj[deNum] - this.offsetObj[0]);
          this.slideMode = "fast";
        } else {
          this.slideMode = "normal";
          this.targetY = this.indicatorY - (this.offsetObj[this.currentDegree] - this.offsetObj[0]);
        }
      }
      this.slideDistance = Math.abs(this.targetY - this.moveY);
      this.handleSlide(null, true);
    },
    _setDegree(touchDistance, moveDegree) {
      this.slideDirection = touchDistance > 0 ? "up" : "down";
      let degrees = this.currentDegree - Math.round(moveDegree);
      this.currentDegree = degrees < 0 ? 0 : degrees > this.DValue ? this.DValue : degrees;
    },
    _setSpeed() {
      let step = (this.moveNum + 1) / 2;
      let percent = Math.abs(this.targetY - this.moveY) / this.slideDistance;
      if (percent > 0.5) {
        step = step * 3;
      } else if (percent < 0.2) {
        if (this.slideMode === "fast" && percent < 0.1) {
          step = step / 4;
        } else {
          step = step / 2;
        }
      }
      return step;
    },
    _emitSlide(isTouchEnd) {
      let moveY = isTouchEnd ? this.targetY : this.moveY;
      this.targetDegree = ((this.indicatorY - moveY) / this.lineGap) | 0;
      if (this.targetDegree + this.startDegree < 0 || this.targetDegree + this.startDegree > 99) return;
      this.$emit("onSlide", this.targetDegree + this.startDegree, isTouchEnd);
    },
    handleSlide(e, isTouchEnd) {
      let that = this;
      let moveY = this.moveY;
      let step = this._setSpeed();
      this._emitSlide(isTouchEnd);
      if (this.slideDirection) {
        if (this.targetY > this.moveY) {
          moveY += step;
          this.moveY = moveY > this.targetY ? this.targetY : moveY;
          this.EndY = this.moveY;
          this.requestAnimationFrameHandler = requestAnimationFrame(that.handleSlide);
        } else if (this.targetY < this.moveY) {
          moveY -= step;
          this.moveY = moveY < this.targetY ? this.targetY : moveY;
          this.EndY = this.moveY;
          this.requestAnimationFrameHandler = requestAnimationFrame(that.handleSlide);
        } else {
          this.moveY = this.targetY;
          this.requestAnimationFrameHandler && cancelAnimationFrame(that.requestAnimationFrameHandler);
        }
      } else {
        this.moveY = this.targetY;
        this.requestAnimationFrameHandler && cancelAnimationFrame(that.requestAnimationFrameHandler);
      }
    },
    _initDegree(degree = this.curDegree) {
      this.currentDegree = degree - 1 > 0 ? degree - 1 : 0;
      this.targetDegree = degree - 1 > 0 ? degree - 1 : 0;
    },
    _getOffset() {
      let lineWrap = this.$refs.lineWrap.getBoundingClientRect();
      this.boxTop = lineWrap.top;
      let h = document.body.offsetHeight || 400;
      this.initBoxHeight = h / 2.4;
      this.setLinesOffset();
      this.$emit("onSlide", this.currentDegree);
    },
  },
  created() {
    this._initDegree();
    this.setDPR(this.dpr);
  },
  activated() {
    // 如果keep-alive页面使用这个组件，需要在activated阶段重新计算，避免因为数据丢失造成计算错误
    this._getOffset();
  },
  mounted() {
    this._getOffset();
  },
  computed: {
    DValue() {
      return this.endDegree - this.startDegree;
    },
  },
};
</script>
<style lang="less" scoped>
.degree {
  width: 100%;
  height: 100%;
  user-select: none;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  height: 800px;
  .line-position {
    margin-left: 166px;
    &.long {
      margin-left: 140px;
    }
  }
  .line-indicator {
    width: 88px;
  }
  .px-line-wrap {
    position: relative;
    left: 0;
    width: 200%;
    display: flex;
    flex-direction: column;
    user-select: none;
    .px-line {
      width: 100%;
      height: 2px;
      flex: 0 0 2px;
      background: #d2d2d2;
      border-radius: 2px;
      font-size: 10px;
      user-select: none;
    }
  }
  .px-indecator {
    user-select: none;
    position: absolute;
    right: 0;
    height: 2px;
    background: #979797;
    border-radius: 3px;
  }
}
</style>
