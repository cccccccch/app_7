<template>
  <div class="temprature-select">
    <div class="temprature-circle" ref="tempratureCircle" @touchstart.stop="onTouchStart" @touchmove.stop="onTouchMove" @touchend.stop="onTouchEnd">
      <div class="circle-wrap" ref="circleWrap">
        <div
          class="temprature-color"
          v-for="(item, idx) of templatureColor"
          :key="idx"
          :style="{ 'background-color': item, 'background-image': `linear-gradient(${item}, ${idx < templatureColor.length - 1 ? templatureColor[idx + 1] : item})` }"
        ></div>
      </div>
      <div class="temprature-indicator" ref="indicator" :style="{ left: indicator.x + 'px', top: indicator.y + 'px', background: templatureColor[colorNum] }"></div>
    </div>
  </div>
</template>
<script>
import { templatureColor, templatureColor_BW } from "../utils/index";
export default {
  props: {
    curTemprature: {
      type: Number,
      default: 4600,
    },
    lightType: {
      type: Number,
      default() {
        return 0; // 0默认灯，1榜威灯
      },
    },
  },
  data() {
    let _templatureColor = this.lightType === 0 ? templatureColor : templatureColor_BW;
    return {
      templatureColor: _templatureColor,
      wrapRect: {},
      indicator: {
        //指示器大小参数
        width: 0,
        height: 0,
        // 指示器位置参数
        x: 0,
        y: 0,
      },
      colorHeight: 0, // 每个颜色对应的高度
      colorNum: Math.ceil((templatureColor.length - 1) / 2), // 颜色index
    };
  },
  methods: {
    onTouchStart(e) {
      this._initPanel();
      this.onTouchMove(e);
      this.$emit("onFingerTouch", true);
    },
    onTouchEnd(e) {
      this.onTouchMove(e, true);
      this.$emit("onFingerTouch", false);
    },
    onTouchMove(e, isTouchEnd) {
      if (this.chilModeModal) return;
      const cur = e.changedTouches[0];
      let x = cur.clientX - (this.wrapRect.left + this.wrapRect.width / 2);
      let y = cur.clientY - (this.wrapRect.top + this.wrapRect.height / 2);
      let radius = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
      let wrapRadius = this.wrapRect.width / 2;
      let wrapX = this.wrapRect.left;
      let wrapY = this.wrapRect.top;
      if (radius > wrapRadius) {
        // 当手滑出圆盘外的时候
        let len = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
        // 利用相似三角形原理得出指示器中心坐标值
        let _x = (x * wrapRadius) / len + wrapRadius;
        let _y = (y * wrapRadius) / len + wrapRadius;
        this.indicator.x = _x - this.indicator.width / 2;
        this.indicator.y = _y - this.indicator.height / 2;
        let colorNum = Math.round(_y / this.colorHeight);
        this.colorNum = colorNum < 0 ? 0 : colorNum > this.templatureColor.length - 1 ? this.templatureColor.length - 1 : colorNum;
      } else {
        let position = { x: cur.clientX - wrapX, y: cur.clientY - wrapY };
        let colorNum = Math.round(position.y / this.colorHeight);
        this.colorNum = colorNum < 0 ? 0 : colorNum > this.templatureColor.length - 1 ? this.templatureColor.length - 1 : colorNum;
        this.indicator.x = position.x - this.indicator.width / 2;
        this.indicator.y = position.y - this.indicator.height / 2;
      }
      this.$emit("onTempratureChange", { color: this.templatureColor[this.colorNum], templature: 6500 - this.colorNum * 100, isTouchEnd: isTouchEnd });
    },

    _initPanel() {
      const wrapRect = this.$refs.circleWrap.getBoundingClientRect();
      const indicator = this.$refs.indicator.getBoundingClientRect();
      this.wrapRect = wrapRect;
      this.indicator.width = indicator.width;
      this.indicator.height = indicator.height;
      this.colorHeight = wrapRect.height / this.templatureColor.length;
    },
    _setIndicatorByColor(color) {
      if (color) {
        for (let i = 0, len = this.templatureColor.length; i < len; i++) {
          if (this.templatureColor[i] === color) {
            this.indicator.y = i * this.colorHeight - this.indicator.height / 2;
            this.indicator.x = this.wrapRect.width / 2 - this.indicator.height / 2;
            this.colorNum = i;
            break;
          }
        }
      }
    },
    _setIndicatorByTemprature(templature, type) {
      let idx = (6500 - templature) / 100;
      this.indicator.y = idx * this.colorHeight - this.indicator.height / 2;
      this.indicator.x = this.wrapRect.width / 2 - this.indicator.height / 2;
      this.colorNum = idx;
    },
  },
  watch: {
    lightType(newV, oldV) {
      if (newV === 0) {
        this.templatureColor = templatureColor;
      } else if (newV === 1) {
        this.templatureColor = templatureColor_BW;
      }
      this._initPanel();
      this._setIndicatorByTemprature(this.curTemprature);
    },
  },
  mounted() {
    this._initPanel();
    this._setIndicatorByTemprature(this.curTemprature);
  },
};
</script>
<style lang="less" scoped>
.temprature-select {
  width: 100%;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.temprature-circle {
  position: relative;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  .circle-wrap {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .temprature-color {
    width: 100%;
    flex: 1;
  }
  .temprature-indicator {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 4px solid #ffffff;
    box-sizing: border-box;
  }
}
</style>
