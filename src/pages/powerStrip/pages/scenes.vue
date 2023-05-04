<template>
  <div id="power-strip">
    <title-bar :title="deviceDetail.deviceName" @goBack="goback" :showRight="!!deviceDetail.dataId" :showUdid="false" />
    <div class="loading" v-show="isLoading"><loading-comp color="#ccc" :showMask="false" /></div>
    <div class="strip-5" v-if="showType === 5">
      <div class="left">
        <div
          class="strip-left-item"
          v-for="(item, idx) of 3"
          :key="idx"
          :class="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
        >
          <scene-btn-comp
            :disabled="deviceOnline !== 'online'"
            @longtap="longtapSceneItem(idx)"
            @tap="clickSceneItem(idx)"
            :sceneName="(deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneName) || ''"
            :btnType="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
            :loading="deviceEndpointList[idx] && deviceEndpointList[idx].isLoading"
          />
        </div>
      </div>
      <div class="right">
        <div
          class="strip-right-item"
          v-for="(item, idx) of 5"
          :key="idx"
          v-show="idx >= 3"
          :class="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
        >
          <scene-btn-comp
            :disabled="deviceOnline !== 'online'"
            @longtap="longtapSceneItem(idx)"
            @tap="clickSceneItem(idx)"
            :sceneName="(deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneName) || ''"
            :btnType="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
            :loading="deviceEndpointList[idx] && deviceEndpointList[idx].isLoading"
          />
        </div>
      </div>
    </div>
    <div class="strip-4" v-if="showType === 4 && deviceEndpointList.length">
      <div class="top">
        <div class="strip-item" :class="deviceEndpointList && deviceEndpointList[0] && deviceEndpointList[0].bindSceneId > 0 ? 'bind' : ''">
          <!-- <div class="strip-item" :class="deviceEndpointList && deviceEndpointList[0] && deviceEndpointList[0].bindSceneId > 0 ? 'bind' : ''" @click="clickSceneItem(0)"> -->
          <scene-btn-comp
            :disabled="deviceOnline !== 'online'"
            @longtap="longtapSceneItem(0)"
            @tap="clickSceneItem(0)"
            :sceneName="(deviceEndpointList[0] && deviceEndpointList[0].bindSceneName) || ''"
            :btnType="deviceEndpointList && deviceEndpointList[0] && deviceEndpointList[0].bindSceneId > 0 ? 'bind' : ''"
            :loading="(deviceEndpointList[0] && deviceEndpointList[0].isLoading) || false"
          />
        </div>
      </div>
      <div class="bot">
        <div
          class="strip-item"
          v-for="(item, idx) of 4"
          :key="idx"
          v-show="idx > 0"
          :class="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
        >
          <scene-btn-comp
            :disabled="deviceOnline !== 'online'"
            @longtap="longtapSceneItem(idx)"
            @tap="clickSceneItem(idx)"
            :sceneName="(deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneName) || ''"
            :btnType="deviceEndpointList[idx] && deviceEndpointList[idx].bindSceneId > 0 ? 'bind' : ''"
            :loading="deviceEndpointList[idx] && deviceEndpointList[idx].isLoading"
          />
        </div>
      </div>
    </div>
    <div class="tp-4" v-if="showType === 6 && deviceEndpointList.length">
      <div class="strip-item" v-for="(item, idx) of deviceEndpointList" :key="idx" :class="item && item.bindSceneId > 0 ? 'bind' : ''">
        <scene-btn-comp
          :disabled="deviceOnline !== 'online'"
          @longtap="longtapSceneItem(idx)"
          @tap="clickSceneItem(idx)"
          :sceneName="item.bindSceneName || ''"
          :btnType="item.bindSceneId > 0 ? 'bind' : ''"
          :loading="item.isLoading || false"
        />
      </div>
    </div>
    <div class="bot-area">
      <div v-if="deviceOnline === 'online'">
        <p class="empty-tips" v-for="(item, idx) of execTips" :key="idx">{{ item }}</p>
      </div>
      <p v-else class="offline">{{ netStatus[deviceOnline] }}</p>
    </div>
    <Modal v-model="netStatusModal" title="温馨提示" type="one" :content="modalContent" />
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
  </div>
</template>

<script>
import { deviceDetailRep, execSceneRep } from "../../../api/request";
import sceneBtnComp from "../components/scene-btn/index";
import { mapGetters, mapMutations } from "vuex";
import titleBar from "../components/titleBar";
import { execNativeFunc } from "../../../utils/bridge";
import Modal from "../../../components/modals/modal/Modal";
import LoadingComp from "../../../components/Loading";
import { formatMQTTData } from "../../../utils/socketUtil";
export default {
  name: "powerStrip",
  data() {
    return {
      deviceOnline: "",
      showType: 0, // 4: 单火4位情景（K054）， 5：Tp玻璃5位， 6： TP玻璃4位
      deviceDetail: {},
      deviceEndpointList: [],
      // 注意，deviceDetail接口返回的deviceStateEnum 是英文枚举值：offline, online, offNetwork, binding
      // 但是mqtt返回的是数字  离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      /// 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      netStatus: {
        0: "offline",
        1: "online",
        4: "offNetwork",
        5: "online",
        7: "binding",
        binding: "配置中",
        online: "在线",
        offline: "离线",
        offNetwork: "离网",
      },
      onLineValue: 0,
      isOnLine: false,
      netStatusModal: false,
      modalContent: "",
      isLoading: false,
      deviceDisableModal: false,
      deviceDisableContent: "",
      upgradeContent: "发现新版本",
      upgradeModal: false,
      hasNoticeUpgrade: false,
      hasNoticeDisable: false,
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setcurEndpointId", "setExecTips", "setGlobalMac", "setGlobalDeviceStatus"]),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    longtapSceneItem(idx) {
      execNativeFunc("onVibrate", 100);
      if (!this.isOnLine) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      if (typeof this.deviceEndpointList[idx] !== "object" || !this.deviceEndpointList[idx].dataId) return;
      let id = this.deviceEndpointList[idx].dataId || "";
      this.setcurEndpointId(id);
      this.$router.push({ name: "scenesList", query: { bindId: this.deviceEndpointList[idx].bindSceneId, slideWay: "left" } });
    },
    clickSceneItem(idx) {
      if (!this.isOnLine) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      let unbind =
        typeof this.deviceEndpointList[idx] !== "object" || !this.deviceEndpointList[idx].dataId || !this.deviceEndpointList[idx].bindSceneId || this.deviceEndpointList[idx].bindSceneId < 0;
      if (unbind) {
        // 没有绑定则调到绑定页面
        let id = (this.deviceEndpointList[idx] && this.deviceEndpointList[idx].dataId) || "";
        if (id) {
          this.setcurEndpointId(id);
          this.$router.push({ name: "scenesList", query: { slideWay: "left" } });
        }
      } else {
        this.onExecScene(this.deviceEndpointList[idx]);
      }
    },
    async onExecScene(item) {
      this.$set(item, "isLoading", true);
      let { data, error } = await execSceneRep({ sceneId: item.bindSceneId });
      this.$set(item, "isLoading", false);
      let res = data && !error ? "执行成功" : "执行失败";
      let text = [`${item.bindSceneName} ${res}`];
      if (data && !error) {
        if (this.execTips.length) {
          if (this.execTips[0] !== "点击即可执行智能" && this.execTips[0] !== "点击即可配置智能") {
            let idx = this.execTips.length === 1 ? 0 : 1;
            text.unshift(this.execTips[idx]);
          }
        }
        this.setExecTips({ text });
      }
    },
    async getDeviceDetail() {

      // if(this.isLoading)return
      this.isLoading = true;
      let { data, error } = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      this.isLoading = false;
      if (data && !error) {
        this.setDeviceDetail(data.data);
        this.setGlobalMac(data.data.deviceMac);
        // 0: "offline",
        // 1: "online",
        // 4: "offNetwork",
        // 5: "online",
        // 7: "binding",  
        let tnum = data.data.deviceStateEnum;
        let num = tnum === "binding" ? 7 : tnum === "online" ? 1 : tnum === "offNetwork" ? 4 : 0;
        this.setGlobalDeviceStatus(num);
        this.deviceDetail = data.data || {};
        let deviceEndpointList = this.deviceDetail.endpointList || [];
 
        this.showType = this.deviceEndpointList.length;
   
   
        this.checkUpgrade(data.data);
        if (this.showType === 4) {
          // K54是TP玻璃开关四位， 顺序是1、2、3、4,其余的暂时按照3、1、2、4 
          if (data.data.deviceTypeCode !== "K54" && data.data.deviceTypeCode !== "K064") {
            let first = deviceEndpointList.splice(2, 1);
            deviceEndpointList = [...first, ...deviceEndpointList];
          } else if (data.data.deviceTypeCode === "K064") {
            let first = deviceEndpointList.splice(3, 1);
            deviceEndpointList = [...first, ...deviceEndpointList];
          }
        }
        if (data.data.deviceTypeCode === "K54") {
          this.showType = 6;
        }
        this.deviceEndpointList = deviceEndpointList;
        // 注意，deviceDetail接口返回的deviceStateEnum 是英文枚举值：offline, online, offNetwork, binding
        // 但是mqtt返回的是数字 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
        this.deviceOnline = data.data.deviceStateEnum;
        let has = this.deviceEndpointList.some((v) => v.bindSceneId && v.bindSceneId > 0);
        let text = [];
        if (has) {
          text = ["点击即可执行智能", "长按即可修改设备配置"];
        } else {
          text = ["点击即可配置智能"];
        }
        this.setExecTips({ text, isInit: true });
        let mqttResult = formatMQTTData(data.data);
        if (!mqttResult.isOnLine) {
          this._showOfflineModal(mqttResult.onLineValue);
        }
        this.handleRender(mqttResult);
      } else {
        this.$Toast.show({ title: error.msg });
      }
    }, // 非在线状态弹窗
    _showOfflineModal(value) {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      let txt = "暂时无法操作";
      let num = value;
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.modalContent = txt;
      this.netStatusModal = true;
    },
    handleRender(mData) {
      if (typeof mData.onLineValue === "number") {
        this.onLineValue = mData.onLineValue;
        this.setGlobalDeviceStatus(mData.onLineValue);
      }
      if (typeof mData.isOnLine === "boolean") {
        this.isOnLine = mData.isOnLine;
      }
    },
    checkUpgrade(data) {
      if (this.hasNoticeUpgrade) return;
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.hasNoticeUpgrade = true;
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
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
  },
  created() {
    this.getDeviceDetail();
  },
  activated() {
    this.getDeviceDetail();
  },
  watch: {
    globalDeviceStatus(newV, oldV) {
      this.deviceOnline = this.netStatus[newV];
    },
    globalMattData(newV, oldV) {
      for (let i = 0; i < newV.length; i++) {
        if (newV[i].endpointIndex === -1 || newV[i].endpointIndex === this.deviceDetail.endpointIndex) {
          const mData = formatMQTTData(newV[i]);
          this.handleRender(mData);
        }
      }
    },
  },
  computed: {
    ...mapGetters(["globalDataId", "execTips", "globalDeviceStatus", "deviceDataModify", "globalDeviceType"]),
  },
  components: {
    sceneBtnComp,
    titleBar,
    Modal,
    LoadingComp,
  },
};
</script>

<style lang="less">
#power-strip {
  position: relative;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .strip-5 {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15vh;
    .left {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      height: 100%;
      margin-right: 24px;
      .strip-left-item {
        width: 264px;
        height: 180px;
        background-color: #e2e2e2;
        border-radius: 20px;
        margin-bottom: 24px;
        overflow: hidden;
        user-select: none;
        &.bind {
          background: #fff;
          box-shadow: 0px 6px 40px 0px rgba(0, 0, 0, 0.08);
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .right {
      .strip-right-item {
        width: 294px;
        height: 282px;
        border-radius: 20px;
        background-color: #e2e2e2;
        margin-bottom: 24px;
        overflow: hidden;
        user-select: none;
        &.bind {
          background: #fff;
          box-shadow: 0px 6px 40px 0px rgba(0, 0, 0, 0.1);
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  .strip-4 {
    width: 100%;
    .top,
    .bot {
      display: flex;
      align-items: center;
      justify-content: center;
      .strip-item {
        width: 100%;
        width: 212px;
        height: 184px;
        background-color: #e2e2e2;
        border-radius: 20px;
        overflow: hidden;
        margin-right: 24px;
        &.bind {
          background: #fff;
          box-shadow: 0px 4px 32px 0px rgba(0, 0, 0, 0.05);
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .top {
      margin-top: 18vh;
      margin-bottom: 24px;
    }
  }
  .tp-4 {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding-top: 16vh;
    .strip-item {
      width: 294px;
      height: 282px;
      background-color: #e2e2e2;
      border-radius: 20px;
      overflow: hidden;
      margin-right: 26px;
      margin-bottom: 26px;
      &:nth-child(2n) {
        margin-right: 0;
      }
      &.bind {
        background: #fff;
        box-shadow: 0px 4px 32px 0px rgba(0, 0, 0, 0.05);
      }
    }
  }
  .bot-area {
    position: absolute;
    bottom: 150px;
    left: 0;
    right: 0;
    .empty-tips {
      width: 100%;
      text-align: center;
      font-size: 28px;
      font-weight: 400;
      color: #9f9e9f;
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .offline {
      width: 100%;
      text-align: center;
      font-size: 38px;
      font-weight: bold;
      color: #ff425d;
    }
  }
}
</style>
