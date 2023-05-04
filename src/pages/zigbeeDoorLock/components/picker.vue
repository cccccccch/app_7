<template>
  <div class="picker" :class="{ style1: showType === 0, style2: showType === 1 }">
    <div class="btn" v-if="showType === 0"><span @click="onCancel">取消</span> <span class="next" @click="onConfirm">确定</span></div>
    <div class="date" v-if="pickerType === 'date'">
      <div class="year">
        <scroll :range="yearList" @onChange="onYearChange" :selectedValue="yearIdx" dateText="年" :isYear="true" :showType="showType" />
      </div>
      <div class="month">
        <scroll :range="monthList" @onChange="onMonthChange" :selectedValue="monthIdx" dateText="月" :showType="showType" />
      </div>
      <div class="day">
        <scroll :range="dayList" @onChange="onDayChange" :selectedValue="dayIdx" dateText="日" :showType="showType" />
      </div>
    </div>
    <div class="date" v-if="pickerType === 'time'">
      <div class="line-wrap" v-if="showType === 1">
        <div class="line"></div>
      </div>
      <div v-else></div>
      <div class="hour" style="width: 25%; flex: 0 0 25%">
        <scroll :range="hourList" @onChange="onHourChange" :selectedValue="hourIdx" dateText="时" :showType="showType" />
      </div>
      <div class="minute" style="width: 25%; flex: 0 0 25%">
        <scroll :range="minuteList" @onChange="onMinuteChange" :selectedValue="minuteIdx" dateText="分" :showType="showType" />
      </div>
      <div class="line-wrap" v-if="showType === 1">
        <div class="line"></div>
      </div>
      <div v-else></div>
    </div>
    <div class="date" v-if="pickerType === 'second'">
      <div class="second">
        <scroll
          :range="secondList"
          :dateText="secondText"
          @onChange="onSecondChange"
          :selectedValue="secondIdx"
          :isSecond2="curtainType === 9 ? true : false"
          :isSecond="curtainType === 9 ? false : true"
          :showType="showType"
        />
        <scroll v-if="curtainType === 9" :range="[0, 180]" dateText="°" @onChange="onSecondChange2"  :isSecond2="true" />
      </div>
    </div>
  </div>
</template>
<script>
import scroll from "./scroll";
import { mapGetters } from "vuex";
export default {
  props: {
    pickerType: {
      type: String,
      default: "date", // "date" | "time" | 'second'
    },
    secondList: {
      // pickerType为second的时候，需要传secondList
      type: Array,
      default() {
        return [5, 20];
      },
    },
    showType: {
      // 0: 默认，有确定取消按钮，1：没有确定取消按钮，每次滑动都自动emit当前值
      type: Number,
      default: 0,
    },
    secondText: {
      type: String, // 当是second的时候，显示的数字旁边的文字
      default: "秒",
    },
    value: {
      type: Number,
      default() {
        return new Date().getTime();
      },
    },
    immediate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      yearList: [2021, 2099],
      monthList: [1, 12],
      dayList: [1, 30],
      hourList: [0, 23],
      minuteList: [0, 59],
      yearIdx: 0,
      monthIdx: 0,
      dayIdx: 0,
      hourIdx: 0,
      minuteIdx: 0,
      secondIdx: 5, // 默认是显示10s
      degree: 0,
    };
  },
  methods: {
    //获取一个月有多少天
    getMonthDay(year, month) {
      let days = new Date(year, month + 1, 0).getDate();
      return days;
    },
    onCancel() {
      this.$emit("onCancel");
    },
    onConfirm() {
      let params = {};
      let params2 = {};
      if (this.pickerType === "date") {
        params = { year: this.yearList[0] + this.yearIdx, month: this.monthList[0] + this.monthIdx, day: this.dayList[0] + this.dayIdx };
      } else if (this.pickerType === "time") {
        params = { hour: this.hourIdx, minute: this.minuteIdx };
      } else if (this.pickerType === "second") {
        params = { second: this.secondList[0] + this.secondIdx };
      }
      if (this.curtainType === 9) {
        params2 = { degree: this.degree };
        this.$emit("onConfirm2", params2);
      }

      this.$emit("onConfirm", params);
    },
    onYearChange(value) {
      this.yearIdx = value;
      this.setDateNum();
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onMonthChange(value) {
   
      this.monthIdx = value;
      this.setDateNum();
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onDayChange(value) {
      this.dayIdx = value;
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onHourChange(value) {
      this.hourIdx = value;
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onMinuteChange(value) {
      this.minuteIdx = value;
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onSecondChange(value) {
      this.secondIdx = value;
      if (this.showType === 1) {
        this.onConfirm();
      }
    },
    onSecondChange2(value){
    this.degree = value;
    },
    setDateNum() {
      //这一段代码控制日的选择
      let date = new Date(this.yearList[0] + this.yearIdx, this.monthList[0] + this.monthIdx, 0).getDate();
      if (this.dayIdx > date - 1) {
        this.dayIdx = date - 1;
      }
      this.dayList.splice(1, 1, date);
    },
    setDateIdx(immediate) {
      let date = new Date(this.value);
      if (!date instanceof Date) return;
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      this.dayList[1] = this.getMonthDay(year, month - 1); //获取当月有多少天

      let hour = date.getHours();
      let minute = date.getMinutes();
      if (this.pickerType === "date") {
        if (year >= this.yearList[0]) {
          this.yearIdx = year - this.yearList[0];
        }
        if (month >= this.monthList[0]) {
          this.monthIdx = month - this.monthList[0];
        }
        if (day >= this.dayList[0]) {
          this.dayIdx = day - this.dayList[0];
        }
      } else if (this.pickerType === "time") {
        if (hour >= this.hourList[0]) {
          this.hourIdx = hour - this.hourList[0];
        }
        if (minute >= this.minuteList[0]) {
          this.minuteIdx = minute - this.minuteList[0];
        }
      } else {
        this.secondIdx = this.value - this.secondList[0];
      }
      immediate && this.onConfirm();
    },
  },
  computed: {
    ...mapGetters(["getCurtainPreferencePoint", "getCurtainTypeCodes", "deviceDetail"]),
    curtainType() {
      // 编组是否存在百叶帘
      if (this.deviceDetail.ifLogicGroupEnum == "yes" && this.venetainExist) {
        return 3;
      }
      let has =
        this.deviceDetail &&
        this.deviceDetail.deviceBindInfoVoList &&
        this.deviceDetail.deviceBindInfoVoList[0] &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList[0];
      return !has ? 0 : this.getCurtainTypeCodes[has["typeCode"]];
    },
  },
  watch: {
    value(newV, oldV) {

      this.setDateIdx();
    },
  },
  mounted() {
    this.setDateIdx(this.immediate);
  },

  components: { scroll },
};
</script>
<style lang="less" scoped>
.picker {
  width: 100%;
  background: #fff;
  &.style1 {
    height: 528px;
  }
  &.style2 {
    height: 416px;
  }
  .btn {
    height: 112px;
    line-height: 112px;
    padding: 0 40px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32px;
    color: #959495;
    .next {
      color: #4289ff;
    }
  }
  .date {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 416px;
    > div {
      width: 33%;
      flex: 0 0 33%;
      height: 100%;
      &.second {
        width: 100%;
        flex: 0 0 100%;
        display: flex;
      }
      &.hour,
      &.minute {
        width: 33%;
        flex: 0 0 33%;
      }
    }
  }
  .line-wrap {
    position: relative;
    height: 100%;
    overflow: hidden;
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
