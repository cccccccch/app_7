<template>
  <div class="groupPage">
    <div class="main flex-jb-dc" v-show="curtainType >= 0">
      <div class="wrap">
        <c-roll ref="curtainRoll" @onMoveCurtain="onMoveCurtain" :disable="deviceDisable" :curtainPercent="curtainPercent" :autoMoveWay="autoMoveWay" @onMove="onCurtainBtnMove" />
      </div>
      <p class="close-tip">{{ curtainCloseStatus }}</p>
      <div class="bot">
        <c-bottom @onCurtainMove="onCurtainMove" :disable="deviceDisable" />
      </div>
    </div>
    <div class="data-loading flex-ac-jc" v-show="isLoadingData">
      <div class="flex-ac-jc">
        <loadingSvg color="#999" />
      </div>
    </div>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
    <Modal v-model="unSetModal" title="温馨提示" :dismiss="false" okText="好的" @on-ok="clickSetOk" @on-cancel="cancelCoreect" content="请先对窗帘电机进行上下限位设置">好的</Modal>
  </div>
</template>
<script>
import CRoll from "../components/c-roll.vue";
import CBottom from "../components/c-bottom.vue";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters, mapMutations } from "vuex";
import { formatMQTTData } from "../../../utils/socketUtil";
import loadingSvg from "../components/loading-svg.vue";
export default {
  name: "curtain",
  data() {
    return {
      unSetModal: false,
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
      curtainType: 0,
      effectdegree: 0,
    };
  },
  methods: {
    ...mapMutations(["setGlobalMac", "setDeviceDetail", "setGlobalDataId", "setGlobalDeviceStatus", "setCurtainMaxMinPoint", "setCurtainRunWay", "setCurtainAngleGear"]),
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
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    onCurtainBtnMove() {
      if (this.deviceDisable) {
        this._showOfflineModal();
        return;
      }
    },
    // 点击上升下降暂停
    onCurtainMove(type) {
      if (this.deviceDisable) {
        this._showOfflineModal();
        return;
      }
      this.autoMoveWay = type;
      this.onMoveCurtain();
      this.$nextTick(() => {
        this.$refs.curtainRoll._setAutoMotion();
      });
    },
    onUpgradeOk() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    onUpgradeCancel() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      } else {
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
    clickSetOk() {
      this.$router.push({ name: "CurtainCorrect", query: { slideWay: "left" } });
    },
    clickSetUpOk() {
      this.$router.push({ name: "CurtainType", query: { slideWay: "left" } });
    },
    cancelCoreect() {
      this.goback();
    },
    checkUpgrade(data) {
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
    },
    // 手指移动窗帘或者点击百分比， 设置定时器，如果四秒没有返回MQTT,就reback 到上一次有效值
    onMoveCurtain() {
      this.moveTimer && clearTimeout(this.moveTimer);
      this.moveTimer = setTimeout(() => {
        this.$refs.curtainRoll._setPercentMove(this.effectCurtainPercent);
        this.$refs.curtainRoll.degree = this.effectdegree;
        this.curtainPercent = this.effectCurtainPercent;
        this.moveTimer && clearTimeout(this.moveTimer);
      }, 10000);
    },

    handleRender(data, isFirst) {
      const result = formatMQTTData(data);
      if (!result) return;
      if (typeof result.isOnLine === "boolean") {
        this.isOnLine = result.isOnLine;
        this.deviceDisable = !result.isOnLine;
      }
      if (typeof result.onLineValue === "number") {
        this.onLineValue = result.onLineValue;
        this.setGlobalDeviceStatus(result.onLineValue);
      }
      if (typeof result.curtainMaxMinPoints === "number") {
        this.setCurtainMaxMinPoint(result.curtainMaxMinPoints);
        if (result.isOnLine || (typeof result.isOnLine !== "boolean" && this.isOnLine)) {
          this.unSetModal = result.curtainMaxMinPoints !== 0b0011 && this.curtainType >= 0;
        } else {
          this.unSetModal = false;
        }
      }
      if (typeof result.curtainPercent === "number") {
        this.moveTimer && clearTimeout(this.moveTimer);
        this.autoMoveWay = "";
        this.autoMoveWay !== "" && this.$refs.curtainRoll._destroyMotion();
        this.$nextTick(() => {
          this.curtainPercent = result.curtainPercent;
          this.effectCurtainPercent = result.curtainPercent;
          this.effectdegree = result.degree;
          console.log(this.effectdegree, "初始化角度");
          this.$refs.curtainRoll.degree = this.effectdegree;
          this.$refs.curtainRoll._setPercentMove(this.effectCurtainPercent, isFirst);
        });
      }
      if (typeof result.curtainRunWay === "number") {
        this.setCurtainRunWay(result.curtainRunWay);
      }
      if (typeof result.curtainAngleGear === "number") {
        this.setCurtainAngleGear(result.curtainAngleGear);
      }
    },
    initData() {
      this.handleRender(this.deviceDetail, true);
    },
    // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
    },
  },
  mounted() {
    setTimeout(() => {
      // 设置一个定时，等待外部的deviceDetail传参结束后再调用
      this.initData();
    }, 60);
  },
  beforeDestroy() {
    this.moveTimer && clearTimeout(this.moveTimer);
  },
  computed: {
    ...mapGetters(["globalDataId", "globalMattData", "getDeviceDelFromCurHomeList", "globalDeviceStatus", "globalDeviceType", "globalMattData", "getCurtainTypeCodes", "deviceDetail"]),
    curtainCloseStatus() {
      if (!this.isOnLine) return "";
      if (this.curtainType === 1) {
        return this.curtainPercent === 0 ? "已全开" : this.curtainPercent === 100 ? "已全关" : "";
      } else {
        return this.curtainPercent === 0 ? "已全关" : this.curtainPercent === 100 ? "已全开" : "";
      }
    },
  },
  watch: {
    //mqtt刷新
    globalMattData(newV, oldV) {
      for (let i = 0; i < newV.length; i++) {
        this.handleRender(newV[i]);
      }
    },
  },
  components: {
    CRoll,
    CBottom,
    Modal,
    loadingSvg,
  },
};
</script>
<style lang="less" scoped>
.groupPage {
  flex: 1;
  overflow: hidden;
  display: flex;
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
