<template>
  <transition name="countdown">
    <div class="timer-picker-modal" ref="picker" @touchmove.stop.prevent @click.stop="forceFocus" v-show="countdownModal" @click="clickOption('cancel')">
      <transition name="options-ani">
        <timer-picker
          ref="TimerPicker"
          v-show="isShowOption"
          :okText="okText"
          :cancelText="cancelText"
          :hourDesc="hourText"
          :minuteDesc="minuteText"
          :initHour="initHour"
          :initMinute="initMinute" 
          @on-cancel="closeCountdownModal"
          @on-confirm="onCountdownChange"
        ></timer-picker>
      </transition>
    </div>
  </transition>
</template>
<script>
// import TimerPicker from "./infinite-scroll.vue";
import TimerPicker from "./time-picker.vue";
export default {
  name: "TimerPicker1",
  components: {
    TimerPicker
  },
  props: {
    show: {
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
    },
     initHour: {
      type: Number,
      default: 24
    },
    initMinute: {
      type: Number,
      default: 15
    },
    hourText: {
      type: String,
      default: "小时"
    },
    minuteText: {
      type: String,
      default: "分钟"
    },
    onCancel: { type: Function },
    onComfirm: { type: Function }
  },
  data() {
    return {
      closeTimeMinutes: 15, 
      isShowOption: false,
      countdownModal: false,
      type: "start"
    };
  },
  methods: {
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
    },
    closeCountdownModal() {
      this.hideModal();
    },
    clickOption(optionName) {
      if (optionName == "cancel") {
        this.closeCountdownModal();
      }
    },
    onCountdownChange(data) {
      this.closeTimeMinutes = data.hour * 60 + data.minute;
      this.onComfirm && this.onComfirm(data);
    },
    getData() {
      return this.initHour;
    },
    initData() {
        this.$refs.TimerPicker && this.$refs.TimerPicker.setInitData();
    }
  },
  created() {},
  mounted() {
      
    this.$nextTick(() => {
      this.countdownModal = this.show;
      this.isShowOption = this.show;
    });
  },
  watch: {
    show(newVal) { 
      this.$nextTick(() => {
        this.initData()
        this.countdownModal = newVal;
        this.isShowOption = newVal;
      });
    } 
  }
};
</script>
<style lang="less">
.timer-picker-modal {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
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
