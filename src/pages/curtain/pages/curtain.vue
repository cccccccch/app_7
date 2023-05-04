<template>
  <div class="curtain">
    <titleBarCurtain :showRight="true" @goBack="goback" :isGroup="deviceDetail.ifLogicGroupEnum">
      <template v-slot:title>
        <p class="title title-bar">{{ (deviceDetail && deviceDetail.deviceName) || "窗帘" }}</p>
      </template>
    </titleBarCurtain>
    <singleComp v-if="deviceDetail && (!deviceDetail.ifLogicGroupEnum || deviceDetail.ifLogicGroupEnum !== 'yes')" />
    <GroupComp v-if="deviceDetail && deviceDetail.ifLogicGroupEnum === 'yes'" />
  </div>
</template>
<script>
import titleBarCurtain from "../components/titleBar";
import { execNativeFunc } from "../../../utils/bridge";
import { deviceDetailRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import GroupComp from "./curtainGroup.vue";
import singleComp from "./curtainSingle.vue";
export default {
  name: "curtain",
  data() {
    return {
      unSetModal: false,
      unSetUpModal: false,
      deviceDisableModal: false,
      deviceDisableContent: "",
      upgradeContent: "",
      upgradeModal: false,
      curtainPercent: 0,
      effectCurtainPercent: 0, // 记录上一次有效值
      autoMoveWay: "",
      deviceDisable: false,
      isLoadingData: false,
      moveTimer: null,
      isOnLine: false,
      onLineValue: 0,
    };
  },
  methods: {
    ...mapMutations(["setGlobalMac", "setDeviceDetail", "setGlobalDataId", "setGlobalDeviceStatus"]),
    goback() {
   
      if (this.getDeviceDelFromCurHomeList) {

        execNativeFunc("onDataChannel", {
          type: 2,
        });
      } else {
        // 每次退出都要更新首页对应卡片数据，因为切换为幕布没有MQTT，所以要自动刷新

        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
          },
        });
      }
      // execNativeFunc("onDataRefresh", { type: 0 });//刷新列表
      execNativeFunc("onNavigateTo", { type: 0,curtain:true });
    },
    async getData() {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      this.isLoadingData = false;
      console.log(result.data.data,'result.data.dataresult.data.dataresult.data.dataresult.data.data')
      if (result && !result.error && result.data && result.data.data) {
        this.setGlobalMac(result.data.data.deviceMac || "");
        this.setDeviceDetail(result.data.data);
        this.setGlobalDataId({ deviceId: result.data.data.dataId });
        this.setGlobalDeviceStatus(
          result.data.data.deviceStateEnum === "online"
            ? 1
            : result.data.data.deviceStateEnum === "offline"
            ? 0
            : result.data.data.deviceStateEnum === "offNetwork"
            ? 4
            : result.data.data.deviceStateEnum === "binding"
            ? 7
            : 0
        );
      } else {
        this.$Toast.show({ title: "数据错误", postion: "middle" });
        setTimeout(() => {
          execNativeFunc("onNavigateTo", { type: 0 });
        }, 1000);
      }
    },
  },
  mounted() {

    this.isLoadingData = true;
    this.getData(true);
  },
  computed: {
    ...mapGetters(["globalDataId", "globalMattData", "getDeviceDelFromCurHomeList", "globalDeviceStatus", "globalDeviceType", "globalMattData", "getCurtainTypeCodes", "deviceDetail"]),
  },
  // watch: {
  //   globalMattData(newV, oldV) {
  //     for (let i = 0; i < newV.length; i++) {
  //       this.handleRender(newV[i]);
  //     }
  //   }
  // },
  components: {
    titleBarCurtain,
    GroupComp,
    singleComp,
  },
};
</script>
<style lang="less" scoped>
.curtain {
  width: 100vw;
  height: 100vh;
  background-color: #fbfbfc;
  .main {
    flex: 1;
    width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 60px 76px 80px;
    position: relative;
    &.unset {
      background-color: #f0f0fd;
      position: relative;
      padding-bottom: 200px;
      .unset-pic {
        max-width: 100%;
      }
      .unset-tip {
        font-size: 32px;
        color: #5e5e83;
      }
    }
    .wrap {
      flex: 1;
      height: calc(100% - 300px);
    }
    .close-tip {
      height: 120px;
      line-height: 120px;
      text-align: center;
      font-size: 32px;
      color: #2f2f4a;
    }
    .bot {
      height: 140px;
      flex: 0 0 140px;
      box-sizing: border-box;
      padding: 0 50px;
    }
  }
  .data-loading {
    position: absolute;
    top: 88px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    background-color: rgba(255, 255, 255, 0.8);
    > div {
      width: 88px;
      height: 88px;
    }
  }
}
</style>
