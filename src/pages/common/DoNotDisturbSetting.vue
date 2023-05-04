<template>
  <div id="dont-disturb-setting">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">勿扰时间</span></template>
      <template v-slot:right><span></span></template>
    </title-bar>
    <div class="main">
      <div class="cell" @click="clickCell('start')" ref="">
        <div class="left">开始时间</div>
        <div class="right">
          <span class="tips">{{ startTime }}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>

      <div class="cell" @click="clickCell('end')" ref="">
        <div class="left">结束时间</div>
        <div class="right">
          <span class="tips">{{ endTime }}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>
    </div> 
  </div>
</template>
<script>
import titleBar from "@/components/titleBar";
import { UpdateEffectLightRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex"; 
import TimerPickerCtrl from "@/components/timer-picker";
export default {
  name: "DoNotDisturbSetting",
  data() {
    return {
      closeTimeMinutes: 15,
      initHour: 0,
      initMinute: 0,
      isShowOption: false,
      countdownModal: false,
      type: "start",
      countDownInstance: ''
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail"]),
    goBack() {
      this.$router.back();
    },  
    onCountdownChange(data) {
      this.closeTimeMinutes = data.hour * 60 + data.minute;
      this.updateEffectLight();
    },
    /**
     * 选择时间，开始或结束时间
     */
    clickCell(name) {
      const detail = this.deviceDetail.deviceAttributeValueVoList;
      this.type = name;
      if (name === "start") {
        const start = ~~detail.effect_light_dnd_mode_start_time_minutes;
        this.initHour = Math.floor(start / 60);
        this.initMinute = start % 60;
      } else if (name === "end") {
        const end = ~~detail.effect_light_dnd_mode_end_time_minutes;
        this.initHour = Math.floor(end / 60) % 24;
        this.initMinute = end % 60;
      }
      this.$nextTick(() => { 
        this.countDownInstance && this.countDownInstance.showModal({
          initHour: this.initHour,
          initMinute: this.initMinute
        }) 
      });
    }, 
    /**
     * 更新勿扰时间
     */
    async updateEffectLight() {
      // 是否支持较暗模式，不支持则默认为关闭， type：2 为关闭
      let type = this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_type
      if(!this.showModeDarker) {
          type = '2'
      }
      console.log(this.deviceDetail,5555);
      const params = {
        endTimeMinutes: +this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_end_time_minutes,
        endpointId: this.getEndpointId,
        startTimeMinutes: +this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_start_time_minutes,
        type: type
      };
      if (this.type === "start") {
        params.startTimeMinutes = this.closeTimeMinutes;
      } else if (this.type === "end") {
        if (this.closeTimeMinutes <= params.startTimeMinutes) {
          this.closeTimeMinutes += 24 * 60;
        }
        params.endTimeMinutes = this.closeTimeMinutes;
      }
      // 若开始时间于结束时间间隔大于一天，则结束时间自动减一天
      if (params.endTimeMinutes - params.startTimeMinutes > 24 * 60) {
        params.endTimeMinutes -= 24 * 60;
      }

      // 若开始时间大于结束时间，则结束时间为第二天
      if (params.startTimeMinutes > params.endTimeMinutes) {
        params.endTimeMinutes += 24 * 60;
      }
      console.log(params,5555);
      return
      let { error } = await UpdateEffectLightRep(params);
      if (!error) {
        const data = this.deviceDetail;
        data.deviceAttributeValueVoList.effect_light_dnd_mode_start_time_minutes = params.startTimeMinutes;
        data.deviceAttributeValueVoList.effect_light_dnd_mode_end_time_minutes = params.endTimeMinutes;
        this.setDeviceDetail(data); 
      } else {
        console.log(error);
      }
    }
  },
    mounted() {
     this.countDownInstance = TimerPickerCtrl.create({
      el: '#dont-disturb-setting',
      show: false, // 创建实例，默认关闭 
      onCancel: () => {
        // 取消事件
      },
      onComfirm: data => {
        this.onCountdownChange(data)
        // 确定事件
   
      }
    });
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalFamilyId", "globalDataId"]),
    startTime() {
      if (this.deviceDetail.deviceAttributeValueVoList) {
        const detail = this.deviceDetail.deviceAttributeValueVoList;
        let start = detail.effect_light_dnd_mode_start_time_minutes;
        start = isNaN(start) ? 1260 : ~~start;
        return `${Math.floor(start / 60).toString().padStart(2, "0")}: ${(start % 60).toString().padStart(2, "0")}`;
      } else {
        return "";
      }
    },
    endTime() {
      if (this.deviceDetail.deviceAttributeValueVoList) {
        const detail = this.deviceDetail.deviceAttributeValueVoList;
        let end = detail.effect_light_dnd_mode_end_time_minutes;
        end = isNaN(end) ? 1980 : ~~end;
        
        return `${end >= 24 * 60 ? "次日" : ""}${(Math.floor(end / 60) % 24).toString().padStart(2, "0")}: ${(end % 60).toString().padStart(2, "0")}`;
      } else {
        return "";
      }
    },
    getEndpointId() {
      if (this.deviceDetail.dataTypeEnum === "endpoint") {
        return this.globalDataId;
      } else if (this.deviceDetail.dataTypeEnum === "device") {
        const list = this.deviceDetail.endpointList || [];
        if (list.length > 0) {
          return list[0].dataId;
        }
      }
      return "";
    },
    // 是否显示 灯效设置-勿扰模式效果-较暗
    showModeDarker() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_no_disturb_mode_darker } = attrs;
      return function_no_disturb_mode_darker == 1;
    },
  },
  components: {
    titleBar, 
  }
};
</script>
<style lang="less" scoped>
#dont-disturb-setting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0fd;

  font-weight: 400;
  color: #000000;
  .title-area {
    flex: 0 0 88px;
    height: 88px;
    background: #fff;
    .title {
      font-size: 36px;
      font-weight: 500;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .btn {
      font-size: 30px;
      font-weight: 500;
      color: #797979;
    }
  }
  .main {
    flex: 1;
    .cell {
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 128px;
      background: #fff;
      position: relative;
      &::after {
        position: absolute;
        content: "";
        display: block;
        height: 2px;
        background: #000000;
        opacity: 0.05;
        left: 40px;
        right: 0;
        bottom: 0;
      }
      &:first-of-type {
        margin-top: 20px;
      }
      .left {
        font-size: 32px;
        font-weight: 400;
        color: #000000;
        position: relative;
        &.active {
          transform: translateX(0);
          &::after {
            position: absolute;
            right: -12px;
            top: 4px;
            content: " ";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #d80200;
          }
        }
      }
      .mixed {
        display: flex;
        align-items: center;
        .tips {
          margin-right: 10px;
        }
      }
      .right {
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .tips {
          line-height: 1;
          color: #797979;
          max-width: 100%;
          overflow: hidden;
        }
        .icon-right {
          font-size: 28px;
          margin-left: 10px;
          color: #d8d8d8;
        }
      }
    }
  }
  .countdown-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }
  }
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s ease-out;
}
.slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(-100%);
}
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.15s;
}
.countdown-enter, .countdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.options-ani-enter-active {
  animation: slide-in 0.15s linear;
}

.options-ani-leave-active {
  animation: slide-in 0.15s linear reverse;
}

@keyframes slide-in {
  0% {
    transform: translateY(267px);
  }
  100% {
    transform: translateY(0) !important;
  }
}
</style>
