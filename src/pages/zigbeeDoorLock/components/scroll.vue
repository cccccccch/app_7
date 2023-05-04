<template>
  <div class="scroll" ref="scroll" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchEnd">
    <div class="num-wrap" :style="transitionStyle" @transitionend="onTransitionend">
      <div class="num" :class="{ active: index === selectedValue && !isMoving }" v-for="(item, index) in list" :key="index">
        <span>{{ item }}</span>
      </div>
    </div>
    <div class="line" :class="{ style1: showType === 1 }" ref="line" :style="{ 'padding-right': isSecond2 ? '35%' : isYear ? '15%' : isSecond ? '40%' : showType === 1 ? '20%' : '20%' }">{{ dateText }}</div>
  </div>
</template>
<script>
export default {
  props: {
    range: {
      type: Array,
      required: true
    },
    selectedValue: {
      type: Number,
      default: 0
    },
    dateText: {
      type: String,
      default: ""
    },
    isYear: {
      type: Boolean,
      default: false
    },
    isSecond: {
      type: Boolean,
      default: false
    },
    isSecond2: {
      type: Boolean,
      default: false
    },
    showType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      list: [],
      itemRect: {},
      scrollTop: 0,
      lineRect: {},
      centerY: 0, // 中心元素位置的top值，方便定位
      startY: 0,
      endY: 0,
      startTime: 0,
      lastMove: {
        time: 0,
        y: 0
      },
      transitionStyle: {
        "-webkit-transform": "",
        transform: "",
        transition: "",
        "-webkit-transition": ""
      },
      isMoving: false,
      curIdx: 0
    };
  },
  methods: {
    onTouchStart(e) {
      this.transitionStyle["-webkit-transition"] = `all 0s ease-in-out`;
      this.transitionStyle["transition"] = `all 0s ease-in-out`;
      this.startY = e.changedTouches[0].clientY;
      this.startTime = new Date().getTime();
      this.isMoving = true;
    },
    onTouchMove(e) {
      let now = new Date().getTime();
      let y = e.changedTouches[0].clientY;
      let distance = y - this.startY;
      let top = this.endY + distance;
      if (top > this.maxY || top < this.minY) {
        top = this.endY + (y - this.startY) * 0.2;
      }
      this.setTransition(top, 0);
      this.lastMove = { time: now, y: top };
    },
    onTouchEnd(e) {
      const now = new Date().getTime();
      let y = e.changedTouches[0].clientY;
      let distance = y - this.startY;
      this.endY += distance;
      const time = now - this.startTime;
      const lTime = now - this.lastMove.time;
      const num = Math.round((this.centerY - this.endY) / this.itemRect.height);
      let targetY = this.centerY - num * this.itemRect.height;
      const diffY = targetY - this.endY;

      if (lTime > 100 || time > 300) {
        // 距离松手前最后一次滑动的时间大于100ms或者总时间大于300， 没有惯性滑动
        if (targetY > this.maxY) {
          targetY = this.maxY;
          this.setTransition(this.maxY, 0.2);
        } else if (targetY < this.minY) {
          targetY = this.minY;
          this.setTransition(this.minY, 0.2);
        } else {
          this.setTransition(targetY, 0.2);
        }
      } else {
        const speed = (distance * 2) / time;
        let tTime = Math.abs(distance) > 2 * this.itemRect.height && time < 60 ? 2.5 : 1.5;
        targetY += Math.round(speed / 0.3) * this.itemRect.height;
        if (targetY > this.maxY) {
          targetY = this.maxY;
          tTime = 0.3;
        } else if (targetY < this.minY) {
          targetY = this.minY;
          tTime = 0.3;
        }
        this.setTransition(targetY, tTime);
      }
      this.isMoving = false;
      this.endY = targetY;
    },
    setTransition(targetY, duration) {
      this.transitionStyle["-webkit-transition"] = `all ${duration}s`;
      this.transitionStyle["transition"] = `all ${duration}s`;
      this.transitionStyle["transition-timing-function"] = duration > 0.5 ? "cubic-bezier(.25, .46, .45, .94)" : "cubic-bezier(.17, .89, .45, 1)";
      this.transitionStyle["-webkit-transition-timing-function"] = duration > 0.5 ? "cubic-bezier(.25, .46, .45, .94)" : "cubic-bezier(0.17, 0.89, 0.45, 1)";
      this.$nextTick(() => {
        // 浮点数会影响渲染速度
        this.transitionStyle["-webkit-transform"] = `translate3d(0, ${targetY | 0}px, 0)`;
        this.transitionStyle["transform"] = `translate3d(0, ${targetY | 0}px,0)`;
      });
    },
    onTransitionend() {
      this.isMoving = false;
      if (this.endY > this.maxY) {
        this.endY = this.maxY;
      } else if (this.endY < this.minY) {
        this.endY = this.minY;
      }
      this.setTransition(this.endY, 0.3);
      let selecteIdx = Math.round((this.centerY - this.endY) / this.itemRect.height);
      this.$emit("onChange", selecteIdx);
    },
    getList() {
      let list = [];
      let len = this.range[1] - this.range[0] + 1;
      for (let i = 0; i < len; i++) {
        let cur = this.range[0] + i;
        list.push(cur);
      }
      this.list = list;
    },
    init() {
      const scroll = this.$refs.scroll;
      const rect = scroll.children[1].getBoundingClientRect();
      const line = this.$refs.line;
      const lineRect = line.getBoundingClientRect();
      this.itemRect = rect;
      this.lineRect = lineRect;
      const scrollRect = scroll.getBoundingClientRect();
      this.centerY = scrollRect.height / 2 - rect.height / 2;
      let top = scrollRect.height / 2 - rect.height * (this.selectedValue + 0.5);
      this.maxY = scrollRect.height / 2 - rect.height / 2;
      this.minY = scrollRect.height / 2 - rect.height * (this.list.length - 1 + 0.5);
      this.setTransition(top, 0);
      this.endY = top;
    }
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  watch: {
    range(newV, oldV) {
      if (newV && (!oldV || newV[0] !== oldV[0] || newV[1] !== oldV[2])) {
        this.getList();
        this.$nextTick(() => {
          this.init();
        });
      }
    },
    selectedValue(newV, oldV) {
      if (typeof newV === "number" && newV !== oldV) {
        this.getList();
        this.$nextTick(() => {
          this.init();
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
.scroll {
  width: 100%;
  text-align: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  .num-wrap {
    position: absolute;
    left: 0;
    right: 0;
  }
  .num {
    height: 100px;
    line-height: 100px;
    opacity: 0.5;
    font-size: 48px;
    &.active {
      opacity: 1;
    }
  }
  .line {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 100px;
    transform: translate(0, -50%);
    text-align: right;
    line-height: 112px;
    font-size: 24px;
    box-sizing: border-box;
    padding-right: 15%;
    &::before {
      position: absolute;
      top: -100vh;
      left: 0;
      right: 0;
      bottom: 100%;
      content: "";
      border-bottom: 1px solid #e1e1e4;
    }
    &::after {
      position: absolute;
      bottom: -100vh;
      left: 0;
      right: 0;
      top: 100%;
      content: "";
      border-top: 1px solid #e1e1e4;
    }
    &.style1 {
      &::before,
      &::after {
        left: -1000px;
        right: -100px;
      }
    }
  }
  @media screen and (-webkit-min-device-pixel-ratio: 2) {
    .line {
      &::before {
        border-bottom: 0.8px solid #e1e1e4;
      }
      &::after {
        border-top: 0.8px solid #e1e1e4;
      }
    }
  }
  @media screen and (-webkit-min-device-pixel-ratio: 3) {
    .line {
      &::before {
        border-bottom: 0.5px solid #e1e1e4;
      }
      &::after {
        border-top: 0.5px solid #e1e1e4;
      }
    }
  }
}
</style>
