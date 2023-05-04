<template>
  <div id="shadow-ktv" :class="{ active: isLightOn }">
    <tool-bar
      :title="deviceDetail.deviceName"
      @goBack="goback"
      :showRight="!!deviceDetail.dataId"
    >
      <span slot="title" class="custom-title">
        <span class="title-desc">{{ deviceDetail.deviceName }}</span>
      </span>
      <template v-slot:options="data">
        <device-options :isShow="data.active"></device-options>
      </template>
    </tool-bar>

    <div class="content">
      <img src="../../../assets/images/shadowk.png" class="image" alt />
      <div class="desc">
        <span>更多功能，敬请期待</span>
      </div>
    </div>

    <net-status-error-modal ref="nsem"></net-status-error-modal>
    <device-disabled-modal v-model="deviceDisableModal"></device-disabled-modal>
    <upgrade-modal ref="upgradeModal"></upgrade-modal>
  </div>
</template>

<script>
import {
  deviceDetailRep,
  getDeviceScheduleTaskListRep,
} from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { deviceZigbeeType } from "../../../utils/index";
import ToolBar from "../../../components/ToolBar";
import DeviceDisabledModal from "../../../components/modals/modal/DeviceDisabledModal";
import UpgradeModal from "../../../components/modals/modal/UpgradeModal";
import NetStatusErrorModal from "../../../components/modals/modal/NetStatusErrorModal";
import DeviceOptions from "../components/DeviceOptions";
import { execNativeFunc } from "../../../utils/bridge";
import pageMixins from "../mixins/index";

export default {
  name: "shadowKtv",
  mixins: [pageMixins],
  components: {
    ToolBar,
    DeviceDisabledModal,
    UpgradeModal,
    NetStatusErrorModal,
    DeviceOptions,
  },
  data() {
    return {
      deviceZigbeeType: deviceZigbeeType,
      windowHeight: 1, 
      isOnLine: true, // 设备在线/离线
      isLightOn: false, // 设备开启/关闭
 
      deviceDisableModal: false,
    };
  },
  methods: {
    ...mapMutations([ 
      "setGlobalDeviceStatus",
      "setDataToNative",
      "setGlobalMac",
      "setDeviceDetail",
      "setLightOnStatus",
      "setElectriDefaultLightStatus", 
    ]),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    // 初始化获取数据
    getData() {
      this.getDeviceData();
    }, 
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType,
      });
      if (data && !error) {
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        const deviceStateEnum = new Map([
          ["offNetwork", 4],
          ["binding", 7],
          ["online", 1],
          ["default", 0],
        ]);
        let num =
          deviceStateEnum.get(data.data.deviceStateEnum) ||
          deviceStateEnum.get("default");
        this.setGlobalDeviceStatus(num);
        this.$refs.nsem.checkNetStatus();
        this.$refs.upgradeModal.checkUpgrade();
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
  },
  watch: {
    globalMattData(newV, oldV) {
      const attrs = newV
        .map((item) => item.attrs)
        .reduce((acc, i) => {
          acc.push(...i);
          return acc;
        }, []);
      const res = newV.reduce((acc, item) => {
        return Object.assign(acc, item);
      });
      res.attrs = attrs;
    },
    globalDeviceStatus(newV) {
      this.isLightOn = Number(newV) === 1 || Number(newV) === 5; 
    },
  },
  computed: {
    ...mapGetters([  
      "deviceDataModify",
      "globalDeviceType",
      "globalData", 
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "childMode",
    ]),
  },
  created() {
    this.getData();
  },
  mounted() {},
};
</script>
<style lang="less">
#shadow-ktv { 
  
background: #F0F0FD;
  .title-bar {
    .custom-title {
    height: 50px;
    font-size: 36px;
    font-weight: 500;
    color: #2f2f4a;
    line-height: 50px;
    width: 100%;
    max-width: 100vw;
    text-align: center;
    .title-desc {
      max-width: 60vw;
      text-align: center;
    }
  }
  }
  .content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    .image {
      margin-top: 359px;
      width: 492px;
      height: 368px;
    }
    .desc {
      margin-top: 40px;
      height: 28px;
      font-size: 32px;
      font-weight: 400;
      color: #5e5e83;
      line-height: 28px;
    }
  }
}
</style>
