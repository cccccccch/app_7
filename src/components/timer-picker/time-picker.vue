<template>
  <div class="countdown-box" @click.stop="() => {}">
    <div class="countdown" :class="{ 'hide-option-countdown': !showButton }">
      <div class="btn-option" v-if="showButton">
        <div class="option-text cancel-countdown" @click="handleCountdown('cancel')">
          {{ cancelText }}
        </div>
        <div class="option-text confirm-countdown" @click="handleCountdown('ok')">
          {{ okText }}
        </div>
      </div>
      <div class="component">
        <div class="" ref="timerPickerWrap">
          <div class="scroller-box">
            <div class="picker">
               <infinite-scroll class="left" ref="hourRef" @onChange="onHourChange" :initVal="initHour"></infinite-scroll>
               <infinite-scroll class="minute" ref="minuteRef" @onChange="onMinuteChange" :initVal="initMinute" :maxDegree="59"></infinite-scroll>
            </div>

            <div class="current-time">
              <div class="desc">
                <span class="first desc-text-inner">{{hourDesc}} </span>
                <span class="second desc-text-inner">{{minuteDesc}}</span>
              </div>
              <!-- <div class="desc-text space">
              
            </div> 
            <div class="desc-text right">
               
            </div> -->
            </div> 
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const PRE_DEGREE = 10;
import infiniteScroll from "./infinite-scroll";
export default {
  name: "time-picker",
  components: {
    infiniteScroll
  },
  props: {
    showButton: {
      type: Boolean,
      default: true
    },
    maxDegree: {
      type: Number,
      default: 23
    },
    minDegree: {
      type: Number,
      default: 0
    },
    hourDesc: {
      type: String,
      default: "时"
    },
    minuteDesc: {
      type: String,
      default: "分"
    },
    initHour: {
      type: Number,
      default: 24
    },
    initMinute: {
      type: Number,
      default: 15
    },
    value: {
      type: Boolean,
      default: false
    },
    okText: {
      type: String,
      default: "确定"
    },
    cancelText: {
      type: String,
      default: "取消"
    }
  },
  data() {
    return {
      hour: 0,
      minute: 0
    };
  },
  watch: {
    value(val) {
      this.setInitData();
    }
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
      this.$refs.hourRef && this.$refs.hourRef.setInitData();
      this.$refs.minuteRef && this.$refs.minuteRef.setInitData();
    },

    onHourChange(data) {
      this.hour = data.value;
    //   console.log(data);
    },
    onMinuteChange(data) {
      this.minute = data.value;
    //   console.log(data);
    },
    handleCountdown(name) {
      if ("cancel" == name) {
        this.$emit("input", false);
        this.$emit("on-cancel");
      } else if ("ok" == name) {
        this.$emit("input", false);
        this.$emit("on-confirm", {
          hour: this.hour,
          minute: this.minute
        });
      }
    }
  }
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
.picker {
  z-index: 3;
   position: absolute;
   top: 0;
   right:0;
   bottom: 0;
   left: 0;
   display: flex;
   align-items: center;
   justify-content: space-between;
   .left {
     margin-left: 182px; 
   }
   .minute {
     margin-right: 182px; 
   }
}
.scroller-box {
  align-items: center;
  position: relative;
  display: flex;
  justify-content: space-around;
  overflow: hidden;
  height: 416px;
 
}
.text {
  height: 40px;
  font-size: 40px;
  font-weight: 400;
  color: #121212;
  line-height: 40px;
  width: 58px;
}
.current-time {
   z-index: 2;
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
     .first {
      margin-left: 304px;
    }
    .second {
      margin-right: 204px;
    }

   .desc-text-inner {
      height: 48px;
      font-size: 24px;
      display: flex;
      line-height: 38px;
      align-items: flex-end;
    }
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

.desc-text {
  color: #121212;
  display: flex;
  align-items: center;
  height: @level1;
  font-weight: 400;
  //   margin-left: 12px;
  color: #121212;
 
 
} 
.space {
  width: 149px;
}
</style>
