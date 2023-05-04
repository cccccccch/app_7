<template>
  <div class="dont-disturb-setting">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">勿扰模式</span></template>
      <template v-slot:right><span></span></template>
    </title-bar>
    <div class="main">
      <div class="main-setting">
        <transition name="slide">
          <div class="cell">
            <div class="left">勿扰模式</div>
            <div class="right">
              <i-switch @onClickSwitch="clickDontDistrub" v-model="doNotDisturbEnable" />
            </div>
          </div>
        </transition>

        <transition name="slide">
          <div class="cell" v-if="doNotDisturbEnable" @click="clickCell('time')">
            <div class="left">勿扰时间</div>
            <div class="right">
              <span class="tips">{{ doNotDisturb }}</span>
              <span class="iconfont icon-right"></span>
            </div>
          </div>
        </transition>

        <transition name="slide">
          <div class="cell" v-if="doNotDisturbEnable" @click="clickCell('mode')">
            <div class="left">勿扰时间效果</div>
            <div class="right">
              <span class="tips">{{ effectDesc }}</span>
              <span class="iconfont icon-right" v-if="showModeClose && showModeDarker"></span>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <transition name="countdown">
      <div class="countdown-modal" ref="countdown" @touchmove.stop.prevent @click.stop="forceFocus" v-show="countdownModal">
        <div class="mask" @click="clickOption('cancel')"></div>
        <transition name="options-ani">
          <div class="options-box" v-show="isShowOption">
            <div class="options" >
              <div class="option-text first-option" @click="clickOption('dark')" >
                较暗
              </div>
              <div class="border"></div>
              <div class="option-text last-option" @click="clickOption('close')" >
                关闭
              </div>
            </div>
            <div class="cancel" @click="clickOption('cancel')">取消</div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script>
import titleBar from "@/components/titleBar";
import { EnableEffectLightRep, UpdateEffectLightRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
import iSwitch from "@/components/switch";
export default {
  name: "EffectLightSetting",
  data() {
    return {
      closeTimeMinutes: 15,
      doNotDisturbEnable: false,
      isShowOption: false,
      countdownModal: false,
      workTimer: 0
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail"]),
    goBack() {
      this.$router.back();
    },

    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
    },
    async clickDontDistrub() {
      let { data, error } = await EnableEffectLightRep({
        endpointId: this.getEndpointId,
        ifEnableEnum: this.doNotDisturbEnable ? "yes" : "no"
      });

      if (!error) {
        const data = this.deviceDetail;
        data.deviceAttributeValueVoList.effect_light_dnd_mode_if_enable = this.doNotDisturbEnable ? "1" : "0";
        this.setDeviceDetail(data);
      } else {
        this.$Toast.show({
          title: error.msg,
          postion: "middle"
        });
        this.doNotDisturbEnable = !this.doNotDisturbEnable;
      }
    },
    clickCell(name) {
      if (name === "mode" && this.showModeClose && this.showModeDarker) {
        this.isShowOption = true;
        this.countdownModal = true;
      } else if (name === "time") {
        this.$router.push({
          name: "DoNotDisturbSetting",
          query: { slideWay: "left" }
        });
      }
    },
    closeCountdownModal() {
      this.isShowOption = false;
      this.countdownModal = false;
    },
    clickOption(optionName) {
      if (optionName == "cancel") {
        this.closeCountdownModal();
      } else if (optionName == "dark") {
        this.updateEffectLight("1");
      } else if (optionName == "close") {
        this.updateEffectLight("2");
      }
    },
    onTimeChange(data) {
      this.closeTimeMinutes = data.hour * 60 + data.minute;
    },
    async updateEffectLight(type) {
      let { error } = await UpdateEffectLightRep({
        endTimeMinutes: this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_end_time_minutes,
        endpointId: this.getEndpointId,
        startTimeMinutes: this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_start_time_minutes,
        type
      });
      if (!error) {
        const data = this.deviceDetail;
        data.deviceAttributeValueVoList.effect_light_dnd_mode_type = type;
        this.setDeviceDetail(data);
        this.closeCountdownModal();
      }
    }
  },
  created() {
    if (this.deviceDetail.deviceAttributeValueVoList) {
      this.doNotDisturbEnable = this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_if_enable === "1";
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.meta.level > to.meta.level) {
      to.query.slideWay = "right";
    }
    next();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId"]),
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
    doNotDisturb() {
      if (this.deviceDetail.deviceAttributeValueVoList) {
        const detail = this.deviceDetail.deviceAttributeValueVoList;
        let start = detail.effect_light_dnd_mode_start_time_minutes;
        let end = detail.effect_light_dnd_mode_end_time_minutes;

        start = isNaN(start) ? 1260 : ~~start;
        end = isNaN(end) ? 1980 : ~~end;
        return `${Math.floor(start / 60)}: ${(start % 60).toString().padStart(2, "0")} - ${end >= 24 * 60 ? "次日" : ""}${Math.floor(end / 60) % 24}: ${(end % 60).toString().padStart(2, "0")}`;
      } else {
        return "";
      }
    },
    effectDesc() {
      const {effect_light_dnd_mode_type}  = this.deviceDetail.deviceAttributeValueVoList || {}
      if (this.showModeDarker && effect_light_dnd_mode_type === "1") {
        return "较暗";
      } else {
        return "关闭";
      }
    },
    // 是否显示 灯效设置-勿扰模式效果-较暗
    showModeDarker() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_no_disturb_mode_darker } = attrs;
      return function_no_disturb_mode_darker == 1;
    },
    // 是否显示 灯效设置-勿扰模式效果-关闭
    showModeClose() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_no_disturb_mode_close } = attrs;
      return function_no_disturb_mode_close == 1;
    }
  },
  watch: {},
  components: {
    titleBar,
    iSwitch
  }
};
</script>
<style lang="less" scoped>
.dont-disturb-setting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0fd;

  font-weight: 400;
  color: #2f2f4a;
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
    .main-setting {
      margin-top: 20px;
      overflow: hidden;
      flex: 1;
    }
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
      &:nth-of-type(n + 0) {
        z-index: 1;
      }
      &:first-of-type {
        z-index: 2;
        // margin-bottom: 24px;
      }

      // &:nth-of-type(n + 2) {
      //   border-bottom: 2px solid rgba(17, 17, 17, 0.25);
      // }
      .left {
        font-size: 32px;
        font-weight: 500;
        color: #2f2f4a;
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
          color: #5e5e83;
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
    z-index: 100;
    .mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }

    .options-box {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      border-top-left-radius: 50px;
      border-top-right-radius: 50px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
      .options {
        height: 234px;
        border-radius: 16px;
        background: #ffffff;
        width: 100%;
        flex-direction: column;
        align-items: center;
        display: flex;
        margin-bottom: 16px;
        justify-content: space-evenly;
        .border {
          width: 100%;
          height: 2px;
          background: rgba(17, 17, 17, 0.5);
          opacity: 0.5;
        }
        .option-text {
          padding: 16px;
          text-align: center;
          width: 100%;
          height: 45px;
          font-size: 32px;

          font-weight: 400;
          color: #4289ff;
          line-height: 45px;
        }
        .first-option {
        }
        .last-option {
        }
      }
      .cancel {
        transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
        height: 117px;
        width: 100%;
        background: #ffffff;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease-out;
}
.slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(-200%);
  // opacity: 0;
}
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.15s;
}
.countdown-enter, .countdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.options-box-show {
  transform: translateY(0) !important;
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
