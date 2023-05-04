<template>
  <div class="light-speed">
    <title-bar @goBack="goBack" :showRight="false">
      <template v-slot:title>
        <p class="title">缓亮缓灭设置</p>
      </template>
    </title-bar>
    <div class="section">
      <p>缓亮时间</p>
      <div class="slide">
        <div class="wrap" ref="showWrap" @touchstart="onTouchStart($event, 'show')" @touchmove="onTouchMove($event, 'show')" @touchend="onTouchEnd($event, 'show')">
          <div class="base-line">
            <div class="active-line" :style="{ width: show.gap * getLightOnStep + 'px' }"></div>
          </div>
          <div class="circle" ref="circle" :style="{ left: show.gap * getLightOnStep + 'px' }"></div>
        </div>
        <span class="time">{{ getLightOnStep }}s</span>
      </div>
    </div>
    <div class="section">
      <p>缓灭时间</p>
      <div class="slide">
        <div class="wrap" ref="showWrap1" @touchstart="onTouchStart($event, 'hide')" @touchmove="onTouchMove($event, 'hide')" @touchend="onTouchEnd($event, 'hide')">
          <div class="base-line">
            <div class="active-line">
              <div class="active-line" :style="{ width: show.gap * getLightOffStep + 'px' }"></div>
            </div>
          </div>
          <div class="circle" ref="circle1" :style="{ left: hide.gap * getLightOffStep + 'px' }"></div>
        </div>
        <span class="time">{{ getLightOffStep }}s</span>
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../../../components/titleBar";
import { mapGetters, mapMutations } from "vuex";
import { endpointControlRep } from "../../../api/request";
export default {
  name: "light-speed",
  data() {
    return {
      show: {
        gap: 0,
        wrapRect: null,
        circleRect: null,
        num: 1,
        left: 0,
      },
      hide: {
        gap: 0,
        wrapRect: null,
        circleRect: null,
        num: 1,
        left: 0,
      },
      isTouch: false,
    };
  },
  methods: {
    ...mapMutations(["setLightOnOffStep"]),
    goBack() {
      this.$router.back();
    },
    onTouchStart(e, type) {
      !this.isTouch && this.initRect();
      if (type === "show") {
        this.handleTouch(e, this.show, "show");
      } else if (type === "hide") {
        this.handleTouch(e, this.hide, "hide");
      }
    },
    onTouchMove(e, type) {
      if (type === "show") {
        this.handleTouch(e, this.show, "show");
      } else if (type === "hide") {
        this.handleTouch(e, this.hide, "hide");
      }
    },
    onTouchEnd(e, type) {
      if (type === "show") {
        this.handleTouchEnd(e, this.show, "show");
      } else if (type === "hide") {
        this.handleTouchEnd(e, this.hide, "hide");
      }
    },
    handleTouch(e, data, type) {
      const rect = data.wrapRect;
      const circleRect = data.circleRect;
      const touchX = e.changedTouches[0].clientX;
      let left = circleRect.width / 2;
      let right = rect.width;
      let x = touchX - rect.left;
      x = x < left ? left : x > right ? right : x;
      data.left = x - circleRect.width / 2;
      this._calcNum(data, type);
    },
    handleTouchEnd(e, data, type) {
      const { step, num } = this._calcNum(data, type);
      data.num = num;
      this.handleControll(data, type);
    },
    _calcNum(data, type) {
      const totalLen = data.wrapRect.width - data.circleRect.width / 2;
      const curLen = data.left;
      const step = totalLen / 10;
      const num = Math.round(curLen / step);
      data.num = num;
      this.setLightOnOffStep({ key: type === "show" ? "lightOnStep" : "lightOffStep", value: data.num });
      return { step, num };
    },
    initRect() {
      let node = this.$refs.showWrap;
      let circle = this.$refs.circle;
      if (!node || !circle) return;
      this.show.wrapRect = node.getBoundingClientRect();
      this.show.circleRect = circle.getBoundingClientRect();
      this.show.gap = (this.show.wrapRect.width - this.show.circleRect.width / 2) / 10;
      let node1 = this.$refs.showWrap1;
      let circle1 = this.$refs.circle1;
      if (!node1 || !circle1) return;
      this.hide.wrapRect = node.getBoundingClientRect();
      this.hide.circleRect = circle.getBoundingClientRect();
      this.hide.gap = (this.hide.wrapRect.width - this.hide.circleRect.width / 2) / 10;
    },
    async handleControll(data, type) {
      let params = {
        cmdValue1: "set_off_transition_time",
        endpointId: this.globalDataId,
      };
      params.cmdKey = type === "show" ? "set_on_transition_time" : "set_off_transition_time";
      params.cmdValue1 = (data.num * 10) | 0;
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        this.$Toast.show({ title: "设置失败", postion: "middle" });
      }
    },
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "getLightOnStep", "getLightOffStep"]),
  },
  components: {
    TitleBar,
  },
  mounted() {
    this.initRect();
  },
};
</script>
<style lang="less" scoped>
.light-speed {
  background: #f0f0fd;
  .title {
    font-size: 36px !important;
    font-weight: 600;
    color: #000000;
    text-align: center;
    flex: 1;
    padding-right: 40px;
  }
  .section {
    background: #fff;
    margin-top: 30px;
    box-sizing: border-box;
    padding: 0 52px;
    > p {
      height: 60px;
      line-height: 60px;
      color: #5e5e83;
      font-size: 28px;
    }
    .slide {
      height: 128px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .time {
        width: 88px;
        flex: 0 0 88px;
        text-align: right;
        color: #5e5e83;
      }
      .wrap {
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
  }
}
</style>
