<template>
  <div class="repeatSetting device-option-normal">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">重复类型</span></template>
      <!-- <template v-slot:right><span class="ok" @click="comfirm">确定</span></template> -->
    </title-bar>
    <div class="main">
      <div class="options-normal">
        <radio-group iconType="right" v-model="repeat" name="timing" @onChange="onSetting">
          <radio label="one">执行一次</radio>
          <radio label="daily">每天</radio>
          <radio label="onduty">工作日</radio>
          <radio label="weekend">周末</radio>
        </radio-group>
        <div class="cell" @click="goWeekSetting()">
          <div class="left">自定义</div>
          <div class="right">
            <span class="tips name link">{{ getCustomText }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const const_week = {
 
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  0: "周日",
};
import Radio from "../../components/Radio.vue";
import RadioGroup from "../../components/RadioGroup.vue";
import titleBar from "@/components/titleBar";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "repeatSetting",
  data() {
    return {
      isBindScene: false,
      repeat: "one", // 闹钟周期
      weeks: []
    };
  },
  methods: {
    ...mapMutations({ setScheduleDays: "schedule/setScheduleDays", setSocketNeedRefreshState: "schedule/setNeedRefreshState" }),
    goBack() {
      this.$router.back();
    },
    /**
     * 自定义周期
     */
    goWeekSetting() {
      this.keepVariable = true;
      this.$router.push({ name: "WeekSetting", query: { slideWay: "left" } });
    },
    /**
     * 设置周期
     * @param {*} val
     */
    async onSetting(val) {
      let weeks = [];
      switch (val) {
        case "daily":
          weeks = [ 1, 2, 3, 4, 5, 6,7];
          break;
        case "onduty":
          weeks = [1, 2, 3, 4, 5];
          break;
        case "weekend":
          weeks = [6,7];
          break;
        case "one":
          weeks = [];
          break;
        default:
          weeks = [...this.getScheduleDays];
      }
 
      this.setScheduleDays(weeks);
    },
    weeksChange(data) {
      console.log(data);
    },
    async comfirm() {
      this.setScheduleDays(this.weeks);
      // this.$Toast.show({
      //     title: '设置成功'
      // })
      this.$router.back();
    }
  },
  watch: {
    onOffSwithDeviceStatus(newV) {
      if (typeof newV !== "number") return;
      this.isOpen = newV === 5;
      this.isBindScene = newV !== 0;
    },
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
      }
    },
    getScheduleDays(newV) { 
      const str = [...this.getScheduleDays].sort().join("");
      if (str) {
        if (str === "1234567") {
          this.repeat = "daily";
        } else if (str === "67") {
          this.repeat = "weekend";
        } else if (str === "12345") {
          this.repeat = "onduty";
        } else {
          this.repeat = "";
        }
      } else if (this.id > 0) {
        this.repeat = "one";
      } else {
        this.repeat = "one";
      }
    }
  },
  created() { 
    this.weeks = this.getScheduleDays;
  },
  activated() { 
    this.weeks = this.getScheduleDays;
    this.isLoading = false;
    const str = [...this.getScheduleDays].sort().join("");
      if (str) {
        if (str === "1234567") {
          this.repeat = "daily";
        } else if (str === "67") {
          this.repeat = "weekend";
        } else if (str === "12345") {
          this.repeat = "onduty";
        } else {
           this.repeat = "";
        }
      } else if (this.id > 0) {
        this.repeat = "one";
      } else {
        this.repeat = "one";
      }
  },
  computed: {
    ...mapGetters(["globalDataId", "deviceDetail"]),
    ...mapGetters({
      getScheduleDays: "schedule/getScheduleDays"
    }),
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
    getCustomText() {
   
      if (this.repeat) {
        return "";
      } else {
        const list = [...this.getScheduleDays].sort();
   
        return list.map(item => const_week[item]).join("、");
      }
    }
  },
  components: {
    titleBar,
    Radio,
    RadioGroup
  }
};
</script>
<style lang="less" scoped>
@import "@/common/css/device-option.less";
.repeatSetting {
  color: #2f2f4a;
  .title-area {
    position: fixed;
    top: 0;
    flex: 0 0 88px;
    z-index: 12;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: 500;
      color: #2f2f4a;
    }
    .ok {
      font-weight: 500;
      color: #4289ff;
      line-height: 30px;
      font-size: 32px;
    }
  }
  .main {
    margin-top: 88px;
    height: 100%;
    width: 100%;
    background: #f0f0fd;
    .options-normal {
      overflow: hidden;
      .wt-radio-wrapper {
        padding-left: 0;
        margin-left: -12px;
      }
    }
    .radio-button {
      margin-top: 43px;
      background: #fff;
      .cell {
        height: 128px;
        background: #d8d8d8;
        padding-left: 52px;
      }
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
</style>
