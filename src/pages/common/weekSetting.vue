<template>
  <div class="weekSetting">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">自定义</span></template>
      <template v-slot:right><span class="ok" @click="comfirm">确定</span></template>
    </title-bar>
    <div class="main">
      <div class="radio-button">
        <checkbox-group v-model="weeks" @onChange="weeksChange">
          <checkbox label="星期一" :value="1" />
          <checkbox label="星期二" :value="2" />
          <checkbox label="星期三" :value="3" />
          <checkbox label="星期四" :value="4" />
          <checkbox label="星期五" :value="5" />
          <checkbox label="星期六" :value="6" />
          <checkbox label="星期日" :value="7" />
        </checkbox-group>
      </div>
    </div>
  </div>
</template>
<script>
import Checkbox from "@/components/checkbox/index";
import CheckboxGroup from "@/components/checkbox/group";
import titleBar from "@/components/titleBar";
import { execNativeFunc } from "@/utils/bridge";
import { endpointControlRep, getDeviceScheduleTaskListRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "weekSetting",
  data() {
    return {
      isBindScene: false,
      weeks: [],
    };
  },
  methods: {
    ...mapMutations({ setScheduleDays: "schedule/setScheduleDays" }),
    goBack() {
      this.$router.back();
    },

    weeksChange(data) {
      this.setScheduleDays(this.weeks);
      console.log(data);
    },
    async comfirm() {
      this.setScheduleDays(this.weeks);

      this.$router.back();
    },
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
      // this.weeks = newV;
    },
  },
  created() {
    this.weeks = this.getScheduleDays;
  },
  activated() {
    this.weeks = this.getScheduleDays;
  },
  computed: {
    ...mapGetters(["globalDataId", "deviceDetail"]),
    ...mapGetters({
      getScheduleDays: "schedule/getScheduleDays",
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
  },
  components: {
    titleBar,
    Checkbox,
    CheckboxGroup,
  },
};
</script>
<style lang="less" scoped>
.weekSetting {
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
    .radio-button {
      margin-top: 30px;
      background: #fff;
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
