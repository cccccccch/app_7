<template>
  <div class="color-picker">
    <div class="picker" ref="picker" @touchstart.stop="onTouchStart" @touchmove.stop="onTouchMove" @touchend.stop="onTouchEnd">
      <img src="../../../static/images/device/hsv_color_panel.png" alt="" />
      <div class="dot" ref="indicator" :style="{ left: indicatorPosition.x + 'px', top: indicatorPosition.y + 'px' }">
        <div :style="{ background: color }"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { hex2rgb, rgb2hex } from "../../../utils/index";
export default {
  name: "HSVColorPicker",
  data() {
    return {
      pickerRect: {},
      indicatorRect: {},
      centerPosition: {},
      indicatorPosition: {
        x: 0,
        y: 0,
      },
      hsvAndleColor: [
        { degree: 0, rgb: [255, 0, 0] },
        { degree: 60, rgb: [255, 255, 0] },
        { degree: 120, rgb: [0, 255, 0] },
        { degree: 180, rgb: [0, 255, 255] },
        { degree: 240, rgb: [0, 0, 255] },
        { degree: 300, rgb: [255, 0, 255] },
      ],
      color: "",
    };
  },
  methods: {
    onTouchStart(e) {
      this.$emit("onFingerTouch", true);
      this._getRect();
      this.onTouchMove(e, false);
    },
    onTouchMove(e, isTouchEnd) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      let angle = this.angle(this.centerPosition, curPosition);
      angle = Math.floor(angle);
      let pickerRadius = this.pickerRect.width / 2; // 半径
      let curRadius = Math.sqrt(Math.pow(Math.abs(this.centerPosition.x - curPosition.x), 2) + Math.pow(Math.abs(this.centerPosition.y - curPosition.y), 2));
      if (curRadius > pickerRadius) {
        let x = curPosition.x - this.centerPosition.x;
        let y = curPosition.y - this.centerPosition.y;
        // 当手滑出圆盘外的时候
        let len = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
        // 利用相似三角形原理得出指示器中心坐标值
        let _x = (x * (this.pickerRect.width / 2)) / len + this.pickerRect.width / 2;
        let _y = (y * (this.pickerRect.height / 2)) / len + this.pickerRect.height / 2;
        curPosition.x = _x + this.pickerRect.left;
        curPosition.y = _y + this.pickerRect.top;
        curRadius = pickerRadius;
      }

      this.indicatorPosition = {
        x: curPosition.x - this.pickerRect.left,
        y: curPosition.y - this.pickerRect.top,
      };
      let rgba = this.getColor(angle, curRadius, pickerRadius);
      this.$emit("colorChange", { hue: angle, saturation: ((curRadius * 254) / pickerRadius) | 0, isTouchEnd: !!isTouchEnd, rgba: rgba });
    },
    onTouchEnd(e) {
      this.onTouchMove(e, true);
      this.$emit("onFingerTouch", false);
    },
    angle(start, end) {
      let diffX = end.x - start.x;
      let diffY = end.y - start.y;
      //返回角度,不是弧度
      let angle = (360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
      if (diffX > 0) {
        angle = angle > 0 ? angle : 360 + angle;
      } else if (diffX < 0) {
        angle = 180 + angle;
      }
      return angle;
    },
    getColor(hue, saturation, radius) {
      const curSat = saturation * (radius / 255);
      let curIdx = 0;
      let preIdx = 0;
      for (let i = 0, len = this.hsvAndleColor.length; i < len; i++) {
        if (hue >= this.hsvAndleColor[i].degree) {
          curIdx = i + 1;
          preIdx = i;
        }
      }
      curIdx = curIdx >= 6 ? 0 : curIdx;
      let cur = this.hsvAndleColor[curIdx];
      let pre = this.hsvAndleColor[preIdx];
      let r = ((pre.rgb[0] - cur.rgb[0]) / 60) * (pre.degree - hue) + pre.rgb[0];
      let g = ((pre.rgb[1] - cur.rgb[1]) / 60) * (pre.degree - hue) + pre.rgb[1];
      let b = ((pre.rgb[2] - cur.rgb[2]) / 60) * (pre.degree - hue) + pre.rgb[2];
      let opacity = 1 - (radius - saturation) / radius;
      opacity = opacity < 0 ? 0 : opacity;
      let color = `rgba(${r},${g},${b},${opacity})`;
      this.color = color;
      return [r, g, b, 1 - (radius - saturation) / radius];
    },
    _getRect() {
      this.pickerRect = this.$refs.picker.getBoundingClientRect();
      this.indicatorRect = this.$refs.indicator.getBoundingClientRect();
      this.centerPosition = {
        x: this.pickerRect.left + this.pickerRect.width / 2,
        y: this.pickerRect.top + this.pickerRect.height / 2,
      };
    },
    _getPositionByHue(hue, saturation) {
      let _saturation = saturation / 2; // 因为在计算的时候，是按照半径计算，所以这里传入getColor的saturation需要除以2
      !this.pickerRect.width && this._getRect();
      let radius = this.pickerRect.width / 2;
      let curRadius = saturation * (radius / 254);
      let y = this.pickerRect.width / 2 + curRadius * Math.sin((hue * Math.PI) / 180);
      let x = this.pickerRect.height / 2 + curRadius * Math.cos((hue * Math.PI) / 180);
      this.indicatorPosition.x = x;
      this.indicatorPosition.y = y;
      return this.getColor(hue, _saturation, radius);
    },
  },
};
</script>
<style lang="less" scoped>
.color-picker {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  .picker {
    width: 480px;
    height: 480px;
    border-radius: 50%;
    position: relative;
    > img {
      width: 480px;
      height: 480px;
    }
    .dot {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #fff;
      overflow: hidden;
      > div {
        width: 60px;
        height: 60px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 4px solid #ffffff;
      }
    }
  }
}
</style>
