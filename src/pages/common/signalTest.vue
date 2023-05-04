<template>
  <div class="signalTest">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">信号强度</span></template>
    </title-bar>
    <div class="main">
      <div class="control">
        <div class="circle-ring circle-outer" :style="circleOuter"></div>
        <div class="circle-ring circle-middle" :style="circleMiddle"></div>
        <div class="circle-ring circle-inner" :style="circleInner"></div>
        <div class="circle-ring circle-dashboard"></div>
        <div class="circle-ring circle-swivel" :style="circle4"></div>
      </div>

      <div class="pointers">
        <div
          class="point"
          :key="index"
          v-for="(value, index) of colors"
          :style="{
            background: value,
            opacity: currentColorIndex === index ? 1 : 0.2
          }"
        ></div>
      </div>

      <div class="message-wrap">
        <div class="signal-level">{{ "--" }}</div>
        <!-- 暂时隐藏 -->
        <!-- <div class="signal-level">{{ signal || "--" }}</div> -->
        <div class="signal-desc">当前信号强度</div>
      </div>
      <div class="btn-wrap">
        <button class="btn" @click="getData" :disabled="!isFinish || isLoading">
          {{ !isFinish || isLoading ? "正在检测" : "重新检测" }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
const INCREMENT_OUTER = 2;
const INCREMENT_MIDDLE = 4;
const INCREMENT_INNER = 6;
const SWIVEL_ANGLE = 130;

import titleBar from "../../components/titleBar";
import { endpointControlRep } from "../../api/request";
import { mapGetters } from "vuex";
import { getUrlQuery } from '@/utils'
export default {
  name: "signalTest",
  data() {
    return {
      isFetching: false,
      isLoading: false,
      isFinish: false,
      obj: {
        inner: 0,
        middle: 0,
        outer: 0,
        transition: "",
        x: 0
      },
      colors: ["#6588FF", "#FF8D3A", "#FFC742", "#FF4343"],
      currentColorIndex: 0,
      signal: "",
      tempSignal: "",
      signalArr: "优良中差",
      signalNum: 0,
      timer: 0,
      raf: 0,
      colorTimer: 0,
      circleTimer: 0
    };
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    rotate() {
      this.raf = requestAnimationFrame(() => {
        this.obj.inner += INCREMENT_INNER;
        this.obj.middle += INCREMENT_MIDDLE;
        this.obj.outer += INCREMENT_OUTER;
        if (this.isLoading) {
          this.rotate();
        }
      });
    },
    // result : 1 2 3 4 对应 优良中差
    finish(result, isTimeout = false) {
      this.isLoading = false;
      this.tempSignal = this.signalArr[result];
      this.obj.transition = `transform 1.5s ease-out `;
      this.circleTimer = setTimeout(() => {
        this.obj.x = this.tempSignal == "优" ? (-SWIVEL_ANGLE / 4) * 3 : this.tempSignal == "良" ? (-SWIVEL_ANGLE / 4) * 1 : this.tempSignal == "中" ? (SWIVEL_ANGLE / 4) * 1 : (SWIVEL_ANGLE / 4) * 3;
        this.obj.x_transition = `transform 0.75s ease-out `;
        setTimeout(() => {
          this.isFinish = true;
          if (isTimeout) {
            this.$Toast.show({
              title: "设备超时，请重新检测",
              postion: "middle"
            });
          }
        }, 1000);
      }, 750);
      this.obj.inner = this.obj.inner + INCREMENT_MIDDLE * 30;
      this.obj.middle = this.obj.middle + INCREMENT_MIDDLE * 30;
      this.obj.outer = this.obj.outer + INCREMENT_MIDDLE * 30;
    },
    startColorAnimation(remainMiles, miles) {
      this.colorTimer = setTimeout(() => {
        this.currentColorIndex = (this.currentColorIndex + 1) % 4;
        if (this.isLoading) {
          this.startColorAnimation(1500);
        } else {
          if (remainMiles > 0) {
            remainMiles -= 200;
            this.startColorAnimation(remainMiles);
          } else {
            this.currentColorIndex = this.signalNum;
            this.signal = this.tempSignal;
          }
        }
      }, miles || 200);
    },
    /**
     * 转盘转动方法
     * 由左往右数 1 2 3 4，1 2 为上半区，3 4 为下半区，增加震荡幅度，采取以下规则：
     * 当‘前值’为上半区， 下一个值必须为下半区，反之亦然。
     * 当‘前值’为2， 下一个值必须为4；当‘前值’为3时，下一个值必须为1。
     *
     */

    startDashboardAnimation(last) {
      if (this.obj.x > 0) {
        this.obj.x < SWIVEL_ANGLE / 2 ? (this.obj.x = -SWIVEL_ANGLE + (Math.random() * SWIVEL_ANGLE) / 2) : (this.obj.x = -SWIVEL_ANGLE + Math.random() * SWIVEL_ANGLE);
      } else {
        this.obj.x > -SWIVEL_ANGLE / 2 ? (this.obj.x = SWIVEL_ANGLE / 2 + (Math.random() * SWIVEL_ANGLE) / 2) : (this.obj.x = Math.random() * SWIVEL_ANGLE);
      }
      setTimeout(() => {
        if (this.isLoading) {
          this.startDashboardAnimation(true);
        } else {
          if (last) {
            this.startDashboardAnimation(!last);
          }
        }
      }, 750);
    },
    async getData() {
      if (this.isFetching) return;
      this.isFetching = true;
      this.signal = "";
      this.isLoading = true;
      this.isFinish = false;
      this.obj.transition = "none";
      this.rotate();

      this.obj.x_transition = `transform 0.75s ease-in-out`;
      this.startColorAnimation();
      this.startDashboardAnimation(); 
      
      const params = {
        cmdKey: "query_ssi",
        endpointId: this.getEndpointId
      };
      let { data, error } = await endpointControlRep(params);
      this.isFetching = false;
      if (!error) {
        this.timer = setTimeout(() => {
          this.timer = 0;
          this.signalNum = -1;
          this.finish(this.signalNum, true);
        }, 4000);
      } else {
        this.$Toast.show({
          title: error.msg,
          postion: "middle"
        });
            this.timer = 0;
         this.signalNum = -1;
        this.finish(this.signalNum, false);
      }
    },
    // 清除所有定时器
    exitPage() {
      this.timer && clearTimeout(this.timer);
      this.raf && cancelAnimationFrame(this.raf);
      this.colorTimer && clearTimeout(this.colorTimer);
      this.circleTimer && clearTimeout(this.circleTimer);
    }
  },

  deactivated() {
    this.exitPage();
  },
  beforeDestroy() {
    this.exitPage();
  },
  created() {
    this.getData();
  },
  mounted() {
    // this.getData();
    window.WINGTO_H5.onPageChange = data => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if (result.type == 2) {
              clearTimeout(this.timer);
            }
            //  app回到前台
            if (result.type == 3) {
              clearTimeout(this.timer);
            }
          }
        } catch (error) {
          console.log("onPageChange Error:", error);
        }
      }
    };
  },
  activated() {
    this.getData();
  },
  watch: {
    globalMattData(newV) {
      const attrs = newV
        .filter(item => item.endpointIndex == -1 || item.endpointIndex == this.deviceDetail.endpointIndex)
        .map(item => item.attrs)
        .reduce((acc, i) => {
          acc.push(...i);
          return acc;
        }, []);
  

      const res = attrs.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.attrHex]: cur.attrValue
        }),
        {}
      );
 
      if (res.hasOwnProperty("4228972288") && this.timer) {
        clearTimeout(this.timer);
        this.timer = 0;
        setTimeout(() => {
          this.signalNum = Math.floor(Math.random() * 100) % 4;
          this.finish(this.signalNum);
        }, 1000);
      }
    }
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "globalMattData"]),
    getEndpointId(){
      if(this.deviceDetail.dataTypeEnum === 'endpoint') {
        return this.globalDataId
      } else if(this.deviceDetail.dataTypeEnum === 'device') { 
        const list = this.deviceDetail.endpointList || []
        if(list.length > 0) {
          return list[0].dataId
        }
      } 
      return '' 
    },
    circleInner() {
      return {
        transform: `rotate(${this.obj.inner}deg) translateZ(0)`,
        transition: this.obj.transition
      };
    },
    circleMiddle() {
      return {
        transform: `rotate(${this.obj.middle}deg) translateZ(0)`,
        transition: this.obj.transition
      };
    },
    circleOuter() {
      return {
        transform: `rotate(${this.obj.outer}deg) translateZ(0)`,
        transition: this.obj.transition
      };
    },
    circle4() {
      return {
        transform: `rotate(${this.obj.x}deg)  translateZ(0)`,
        transition: this.obj.x_transition
      };
    }
  },
  components: { titleBar }
};
</script>
<style lang="less" scoped>
.signalTest {
  background: #fbfbfc;
  display: flex;
  flex-direction: column;
  .title-area {
    position: relative;
    flex: 0 0 88px;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: bold;
      color: #2f2f4a;
    }
  }
  .main {
    width: 100%;
    flex: 1;
    max-height: calc(100% - 88px);
    overflow-y: auto;
    .control {
      width: 750px;
      height: 600px;
      position: relative;
      margin-top: 50px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      .circle-ring {
        line-height: 1.5;
        position: absolute;
      }
      .circle-outer {
        width: 584px;
        height: 584px;
        background: url("../../assets/svgs/circle-ring-outer.svg");
      }

      .circle-middle {
        width: 522px;
        height: 522px;
        background: url("../../assets/svgs/circle-ring-middle.svg");
      }

      .circle-inner {
        width: 466px;
        height: 466px;
        background: url("../../assets/svgs/circle-ring-inner.svg");
      }
      .circle-dashboard {
        width: 400px;
        height: 400px;
        background: url("../../assets/images/chassis.png");
        background-size: contain;
      }
      .circle-swivel {
        width: 304px;
        height: 304px;
        background: url("../../assets/images/swivel.png");
        background-size: contain;
      }
    }
    .pointers {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 49px;
      .point {
        border-radius: 50%;
        width: 14px;
        height: 14px;
        &:nth-of-type(n + 1) {
          margin-left: 30px;
        }
      }
    }

    .message-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      .signal-level {
        font-size: 120px;
        color: #000;
        height: 160px;
        margin-top: 50px;
      }
      .signal-desc {
        font-weight: bold;
        color: #767676;
        font-size: 32px;
      }
    }
    .btn-wrap {
      display: flex;
      align-items: center;
      justify-content: center;

      .btn {
        margin-top: 60px;
        width: 90%;
        height: 13.86667vw;
        line-height: 13.86667vw;
        background: #5f6acb;
        border-radius: 64px;
        text-align: center;
        font-size: 4.26667vw;
        font-weight: 400;
        color: #fff;
        border: none;
      }
      .btn[disabled="disabled"] {
        opacity: 0.3;
      }
    }
  }
}
</style>
