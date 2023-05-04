<template>
  <div class="gear">
    <title-bar :showRight="false" @goBack="goback">
      <template v-slot:title><p class="title title-bar">偏好设置</p></template>
    </title-bar>
    <div class="gear-item">
      <p>档位设置</p>
      <div class="gear-item-wrap flex-ac-jb">
        <span class="iconfont icon-curtain-gera"></span>
        <div class="slide flex-ac-jb" ref="showWrap">
          <div class="wrap" @touchstart="onTouchStart($event)" @touchmove="onTouchMove($event)" @touchend="onTouchEnd($event)">
            <div class="base-line">
              <div class="active-line" :style="{ width: gap * num + 'px' }"></div>
            </div>
            <div class="circle" ref="circle" :style="{ left: gap * num + 'px' }"></div>
          </div>
        </div>
        <span>{{ num + 1 }}档</span>
      </div>
    </div>
    <p class="tips">请选择档位对应调光幅度（档位越大，翻转幅度越大）</p>
  </div>
</template>
<script>
import TitleBar from "../components/titleBar";
import { endpointControlRep } from "../../../api/request";
import { mapGetters } from "vuex";
export default {
  name: "preference",
  data() {
    return {
      gap: 0,
      wrapRect: null,
      circleRect: null,
      num: 0,
      left: 0,
      GEAR_LEVEL: 9 // 最大档位，从0开始
    };
  },
  methods: {
    goback() {
      this.$router.back();
    },
    onTouchStart(e) {
      !this.wrapRect && this.initRect();
      this.handleTouch(e);
    },
    onTouchMove(e) {
      this.handleTouch(e);
    },
    onTouchEnd(e) {
      this.handleTouchEnd(e);
    },
    handleTouch(e) {
      const rect = this.wrapRect;
      const circleRect = this.circleRect;
      const touchX = e.changedTouches[0].clientX;
      let left = circleRect.width / 2;
      let right = rect.width;
      let x = touchX - rect.left;
      x = x < left ? left : x > right ? right : x;
      this.left = x - circleRect.width / 2;
      this._calcNum();
    },
    handleTouchEnd() {
      const { num } = this._calcNum();
      this.num = num;
      this.handleChangeGear();
    },
    _calcNum() {
      const totalLen = this.wrapRect.width - this.circleRect.width / 2;
      const curLen = this.left;
      const step = totalLen / this.GEAR_LEVEL;
      const num = Math.round(curLen / step);
      this.num = num;
      return { step, num };
    },
    initRect() {
      let node = this.$refs.showWrap;
      let circle = this.$refs.circle;
      if (!node || !circle) return;
      this.wrapRect = node.getBoundingClientRect();
      this.circleRect = circle.getBoundingClientRect();
      this.gap = (this.wrapRect.width - this.circleRect.width / 2) / this.GEAR_LEVEL;
    },
    async handleChangeGear() {
      let params = {
        cmdKey: "roll_curtains_set_angle",
        endpointId: this.globalDataId,
        cmdValue1: this.num + 1
      };
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "操作失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    }
  },
  watch: {
    getCurtainAngleGear(newV) {
      this.num = newV - 1;
    }
  },
  mounted() {
    let timer = setTimeout(() => {
      // 因为有动画，设置一个比动画大的延时
      this.initRect();
      timer && clearTimeout(timer);
    }, 400);
    this.num = this.getCurtainAngleGear - 1;
  },
  computed: {
    ...mapGetters(["globalDataId", "getCurtainAngleGear"])
  },
  components: {
    TitleBar
  }
};
</script>
<style lang="less" scoped>
.gear {
  background: #f0f0fd;
  .gear-item {
    background: #fff;
    margin-top: 30px;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
    padding: 0 40px 0 52px;
    > p {
      height: 76px;
      line-height: 76px;
      font-size: 28px;
      color: #5e5e83;
    }
  }
  .gear-item-wrap {
    > span {
      width: 88px;
      flex: 0 0 88px;
      text-align: right;
      font-size: 32px;
      color: #5e5e83;
      &.icon-curtain-gera {
        text-align: left;
        color: #6165c5;
        width: 40px;
        font-size: 50px;
        font-weight: bold;
      }
    }
  }
  .slide {
    height: 134px;
    width: 100%;
    .time {
      width: 88px;
      flex: 0 0 88px;
      text-align: right;
      color: #5e5e83;
    }
    .wrap {
      width: 100%;
      flex: 1;
      position: relative;
      height: 40px;
      padding-top: 17px;
      box-sizing: border-box;
      .base-line {
        height: 6px;
        background: #f0f0fd;
        border-radius: 3px;
        width: 100%;
        display: flex;
      }
      .active-line {
        height: 6px;
        background: #6165c5;
        border-radius: 3px;
      }
      .circle {
        position: absolute;
        width: 40px;
        height: 40px;
        background: #ffffff;
        border-radius: 20px;
        top: 50%;
        transform: translateY(-50%);
        box-shadow: -2px 4px 4px 0px rgba(0, 0, 0, 0.1), 0px 4px 21px 0px rgba(0, 0, 0, 0.08), 0px 0px 4px 0px rgba(0, 0, 0, 0.02);
      }
    }
  }
  .tips {
    font-size: 24px;
    color: #5e5e83;
    margin-top: 30px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 40px;
  }
}
</style>
