<template>
  <div class="cd-color-picker-wrap" ref="cdColorPickerWrap">
    <div class="cd-color-picker" ref="cdColorPicker" @touchstart.stop="onTouchStart" @touchmove.stop="onTouchMove" @touchend.stop="onTouchEnd">
      <img src="../assets/images/color_panel.png" alt="" />
      <div
        class="indicator"
        ref="indicator"
        :style="{ left: indicatorPosition.x + 'px', top: indicatorPosition.y + 'px', background: `rgb(${curColor[0] | 0},${curColor[1] | 0},${curColor[2] | 0})` }"
      ></div>
    </div>
  </div>
</template>
<script>
import { rgb2xy, hex2rgb } from "../utils/index";
export default {
  name: "color-picker",
  props: {
    xyColor: {
      type: String,
      default: "",
    },
  },
  data() {
    // 注意： 指示器.indicator虽然跟图片在同一个div .cd-color-picker里面， 但是定位的参考系是最外层.cd-color-picker-wrap
    return {
      initColors: ["#FF0000", "#FF8000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"],
      indicatorPosition: { x: 0, y: 0 },
      centerPosition: { x: 0, y: 0 },
      colorParams: {
        idx: 0,
        radius: 0,
        colors: [],
      },
      curColor: "",
      curXY: "",
      xyColors: {},
      panelRadius: 0,
    };
  },
  methods: {
    onTouchStart(e) {
      this._getRect();
      this.onTouchMove(e);
      this.$emit("onFingerTouch", true);
    },
    onTouchMove(e, isTouchEnd = false) {
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
        x: curPosition.x - this.indicatorRect.width / 2 - this.wrapRect.left,
        y: curPosition.y - this.indicatorRect.height / 2 - this.wrapRect.top,
      };
      const perIdx = pickerRadius / 50;
      const curIdx = 50 - Math.ceil(curRadius / perIdx);
      this.colorParams.idx = curIdx;
      this.colorParams.angle = angle;
      this.curColor = window.colorParams[angle][curIdx];
      this.curXY = rgb2xy(...this.curColor);
      this._emitChange(isTouchEnd);
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
    _getRect() {
      this.wrapRect = this.$refs.cdColorPickerWrap.getBoundingClientRect();
      this.pickerRect = this.$refs.cdColorPicker.getBoundingClientRect();
      this.indicatorRect = this.$refs.indicator.getBoundingClientRect();
      this.centerPosition = {
        x: this.pickerRect.left + this.pickerRect.width / 2,
        y: this.pickerRect.top + this.pickerRect.height / 2,
      };
    },
    // 初始化颜色参数
    _initColors() {
      let rgbs = [];
      this.initColors.map((v) => rgbs.push(hex2rgb(v)));
      let colors = []; // 圆周上的颜色点
      for (let s = 0; s < 7; s++) {
        let step = s === 6 ? 48 : 52; // 最后一个扇形只有48度
        let idx = s === 0 || s === 1 || s === 4 ? 1 : s === 2 || s === 5 ? 0 : 2; // 改变的rgb, r:0, g:1,b:2
        for (let i = 0; i < step; i++) {
          if (s === 6) {
            colors.push([rgbs[s][0], rgbs[s][1], rgbs[s][2] - (rgbs[s][2] / step) * i]);
          } else {
            let item = [rgbs[s][0], rgbs[s][1], rgbs[s][2]];
            item[idx] = rgbs[s][idx] + ((rgbs[s + 1][idx] - rgbs[s][idx]) / step) * i;
            colors.push(item);
          }
        }
      }
      const centerColor = [255, 255, 255];
      let allColors = [];
      let xyColors = {};
      for (let s = 0, len = colors.length; s < len; s++) {
        let rStep = colors[s][0] === centerColor[0] ? 0 : (centerColor[0] - colors[s][0]) / 50;
        let gStep = colors[s][1] === centerColor[1] ? 0 : (centerColor[1] - colors[s][1]) / 50;
        let bStep = colors[s][2] === centerColor[2] ? 0 : (centerColor[2] - colors[s][2]) / 50;
        allColors[s] = [colors[s]];
        let key = rgb2xy(colors[s][0], colors[s][1], colors[s][2]);
        // 边缘第一个颜色
        // c: rgb, a:angle角度，i:angle上第几个，从边缘数起
        xyColors[key] = { c: colors[s], a: s, i: 0 };
        for (let i = 49; i > 0; i--) {
          let _color = [centerColor[0] - rStep * i, centerColor[1] - gStep * i, centerColor[2] - bStep * i];
          let _key = rgb2xy(_color[0], _color[1], _color[2]);
          xyColors[_key] = { c: _color, a: s, i: 50 - i };
          allColors[s].push(_color);
        }
      }
      // 这里直接挂在window上，不要问为什么，如果不这么做，iphone7 IOS13.6版本webview会崩溃
      window.colorParams = allColors;
      window.xyColors = xyColors;
    },
    _initIndicatorPosition(xyValue, disableEmit) {
      if (!xyValue) return;
      if (!window.colorParams || !window.colorParams.length) {
        this._initColors();
      }
      this.$nextTick(() => {
        let xy = window.xyColors[xyValue];
        if (!xy) {
          xy = window.xyColors["22056 22256"];
        }
        let angle = xy.a + 90; // 这里的左边从y轴正方向开始，xyColors坐标轴是从x轴正方向开始，所以需要加90度
        let x = Math.sin((angle * Math.PI) / 180) * (this.pickerRect.width / 2) * ((50 - xy.i) / 50);
        let y = Math.cos((angle * Math.PI) / 180) * (this.pickerRect.height / 2) * ((50 - xy.i) / 50);
        this.curColor = xy.c;
        this.indicatorPosition.x = this.centerPosition.x - this.wrapRect.left - this.indicatorRect.width / 2 + x;
        this.indicatorPosition.y = this.centerPosition.y - this.wrapRect.top - this.indicatorRect.height / 2 - y;
        !disableEmit && this._emitChange(false, xyValue);
      });
    },
    _emitChange(isTouchEnd = false, xyValue) {
      this.$emit("onColorChange", { color: this.curColor, curXY: xyValue || this.curXY, isTouchEnd: isTouchEnd });
    },
  },
  created() {
    this._initColors();
  },
  mounted() {
    this._getRect();
    if (!this.xyColor) {
      // 兼容颜色模式是2且没有上报颜色色值的情况，默认将指示器放在中心位置
      this._initIndicatorPosition("22056 22256", true);
    } else {
      this._initIndicatorPosition(this.xyColor, true);
    }
  },
};
</script>
<style lang="less" scoped>
.cd-color-picker-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .cd-color-picker {
    width: 480px;
    height: 480px;
    border-radius: 50%;
    > img {
      width: 480px;
      height: 480px;
    }
  }
  .indicator {
    position: absolute;
    left: 0;
    right: 0;
    width: 60px;
    height: 60px;
    border: 4px solid #ffffff;
    border-radius: 50%;
    box-sizing: border-box;
  }
}
</style>
