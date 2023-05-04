<template>
  <div class="device-options" :class="{ active: showAnimation }" ref="deviceOptions" @scroll="handleScroll">
    <transition name="opt-slide">
      <div class="options-func" v-show="showAnimation">
        <p class="title">功能</p>
        <div class="cell" @click="handleReverWay">
          <div class="left">电机反转</div>
          <div class="right" v-show="!isReverLoading">
            <span class="tips name">{{ getCurtainRunWay === 0 ? "正向" : "反向" }}</span>
            <span class="iconfont icon-right"></span>
          </div>
          <div class="right loading" v-show="isReverLoading">
            <loadingBtn color="#999" />
          </div>
        </div>

        <div class="cell" @click="goGroup">
          <div class="left">编组管理</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell">
          <div class="left">定时</div>
          <div class="right" @click="goClock">
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-two">
      <div class="options-normal" v-show="showAnimation">
        <p class="title">常规</p>
        <div class="cell" @click="clickCell('deviceName')">
          <div class="left">设备名称</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.deviceName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goDeviceRoom">
          <div class="left">设备房间</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.goalDeviceRoomName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <div class="cell" @click="goScenePage">
          <div class="left">场景</div>
          <div class="right" v-if="deviceDetail.ownedCount > 0">
            <span class="tips">{{ deviceDetail.ownedCount }}个</span>
            <span class="iconfont icon-right"></span>
          </div>
          <div class="right" v-else>
            <span class="tips">无</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">添加到常用</div>
          <div class="right">
            <i-switch v-model="isUsually" @onClickSwitch="clickUsually" />
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-three">
      <div class="options-info" v-show="showAnimation">
        <p class="title">设备信息</p>
        <div>
          <div class="cell" @click="goGroupDetail(item)" v-for="(item, idx) of groupList" :key="idx">
            <div class="left">{{ item.deviceName }}</div>
            <div class="right">
              <span class="iconfont icon-right"></span>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-four">
      <div v-show="showAnimation">
        <div class="del-btn" @click="clickDel(0)">解散窗帘编组</div>
      </div>
    </transition>
    <div class="device-name-modal" @touchmove.stop.prevent @click.stop="forceFocus" v-show="nameModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click="clickCancel">取消</span>
          <span class="name">修改设备名称</span>
          <span class="comfirm" @click="onComfirm">确定</span>
        </div>
        <div style="position: relative">
          <input class="input-area" ref="inputArea" v-model="deviceName" :maxlength="20" autofocus type="text" />
          <span class="iconfont icon-close" v-show="deviceName" @click="deviceName = ''"></span>
        </div>
        <div class="tips">
          <span>支持中/英文/数字/符号</span>
          <span>{{ (deviceName && deviceName.length) || 0 }}/20</span>
        </div>
      </div>
    </div>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="showReverModal" title="开合方向" type="one" :content="reverContent" />
    <Modal v-model="delModal" title="温馨提示" content="确定要解散窗帘组吗？" @on-ok="onDel" />
  </div>
</template>
<script>
import iSwitch from "../../../components/switch";
import { deviceZigbeeType, throttle } from "../../../utils/index";
import { deviceInfoUpdRep, deviceDelRep, addUsuallyRep, removeUsuallyRep, endpointControlRep, groupDeviceListRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { emojiReg } from "../../../utils/reg";
import loadingBtn from "./loading-svg.vue";

export default {
  name: "DeviceOptions",
  props: {
    isShow: {
      type: Boolean,
    },
  },
  data() {
    return {
      deviceZigbeeType: deviceZigbeeType,
      showAnimation: false,
      isUsually: false,
      nameModal: false,
      deviceName: "",
      delModal: false,
      deviceDisableModal: false,
      deviceDisableContent: "",
      showReverModal: false,
      isReverLoading: false,
      reverContent: "已切换",
      groupList: [],
      handleScroll: null,
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setCurtainRunWay", "setOptionPageScrollPosition"]),
    onScroll(e) {
      let top = e && e.target && e.target.scrollTop;
      this.setOptionPageScrollPosition(top || 0);
    },
    // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return false;
      if (num === 1 || num === 5) return true;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
      return false;
    },
    goGroupDetail(item) {
      if (!item) return;
      this.$router.push({
        name: "GroupDeviceList",
        query: {
          slideWay: "left",
          dataId: item.dataId,
          dataTypeEnum: item.dataTypeEnum,
        },
      });
    },
    goDeviceRoom() {
      this.$router.push({ name: "DeviceRoom", query: { slideWay: "left" } });
    },
    goSignal() {
      if (!this._showOfflineModal()) return;
      this.$router.push({ name: "SignalTest", query: { slideWay: "left" } });
    },
    goPreference() {
      this.$router.push({ name: "Preference", query: { slideWay: "left" } });
    },
    goClock() {
      if (!this._showOfflineModal()) return;
      this.$router.push({ name: "CurtainClock", query: { slideWay: "left" } });
    },
    goGearPage() {
      if (!this._showOfflineModal()) return;
      this.$router.push({ name: "CurtainGear", query: { slideWay: "left" } });
    },
    goScenePage() {
      if (this.deviceDetail.ownedCount <= 0) return;
      this.$router.push({ name: "ScenePage", query: { slideWay: "left" } });
    },
    goGroup() {
      if (!this._showOfflineModal()) return;
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 3, data: this.deviceDetail });
    },
    goVersion() {
      if (!this._showOfflineModal()) return;
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    goFeedback() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 2, data: this.deviceDetail });
    },
    goChildMode() {
      if (!this._showOfflineModal()) return;
      if (!this.dev) this.$router.push({ name: "childMode", query: { slideWay: "left" } });
    },
    goLightStatus() {
      if (!this._showOfflineModal()) return;
      this.$router.push({ name: "lightStatus", query: { slideWay: "left" } });
    },
    clickDel(type) {
      if (type === 0) {
        this.delModal = true;
      } else {
        this.delGroupModal = true;
      }
    },
    clickChangeName() {
      this.nameModal = true;
      this.deviceName = this.deviceDetail.deviceName;
      this.$nextTick(() => {
        this.forceFocus();
      });
    },
    clickCancel() {
      this.deviceName = this.deviceDetail.deviceName;
      this.nameModal = false;
    },
    onClickSwitch() {
      this.switchStatus = !this.switchStatus;
    },
    clickCell(cellName) {
      if (cellName === "deviceName") {
        this.clickChangeName();
      }
    },
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      this.$refs.inputArea.focus();
    },
    clickUsually() {
      execNativeFunc("onDataChannel", { type: 0 });
      if (this.isUsually) {
        this.addToUsually();
      } else {
        this.removeUsually();
      }
    },
    async handleReverWay() {
      if (!this._showOfflineModal()) return;
      let k = this.getCurtainRunWay === 0 ? "windowCoveringDirectionReversed" : "windowCoveringDirectionNormal";
      this.reverContent = this.getCurtainRunWay === 0 ? "已切换为反向" : "已切换为正向";
      let v = this.getCurtainRunWay === 0 ? 1 : 0;
      this.isReverLoading = true;
      let result = await endpointControlRep({ cmdKey: k, endpointId: this.globalDataId });
      this.isReverLoading = false;
      if (result && !result.error) {
        this.showReverModal = true;
        this.setCurtainRunWay(v);
      } else {
        let msg = (result && result.error && result.error.msg) || "切换失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async removeUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device",
      };
      let { data, error } = await removeUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = false;
        this.setDeviceDetail(data);
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    async addToUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device",
      };
      let { data, error } = await addUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = true;
        this.setDeviceDetail(data);
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    async onComfirm(e) {
      e && e.preventDefault();
      if (emojiReg.test(this.deviceName)) {
        this.$Toast.show({
          title: "设备名称只支持中文、英文、数字、符号",
          postion: "bottom",
        });
        this.forceFocus();
        return;
      }
      if (!this.deviceName) {
        this.$Toast.show({ title: "请输入设备名称", postion: "bottom" });
        this.forceFocus();
        return;
      }
      let { data, error } = await deviceInfoUpdRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
        deviceName: this.deviceName,
      });
      if (data && !error) {
        let detail = this.deviceDetail;
        detail.deviceName = this.deviceName;
        this.setDeviceDetail(detail);
        this.clickCancel();
        this.$refs.inputArea.blur();
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
          },
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async onDel() {
      let { data, error } = await deviceDelRep({
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
      });
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        let _data = { curtainPreferencePoint: [25, 50, 75] };
        execNativeFunc("dataSave", _data);
        this.$Toast.show({ title: "操作成功" });
        execNativeFunc("onDataChannel", {
          type: 4,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
          },
        });
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
    async getGroupDeviceData() {
      let result = await groupDeviceListRep({
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
      });
      if (!result.error) {
        this.groupList = result.data.data || [];
      }
    },
  },
  mounted() {
    this.showAnimation = this.isShow;
    this.isUsually = this.deviceDetail.ifMostUsed;
  },
  created() {
    this.handleScroll = throttle(this.onScroll, 60);
    this.getGroupDeviceData();
  },
  activated() {
    this.$refs.deviceOptions.scrollTop = this.getOptionPageScrollPosition || 0;
  },
  computed: {
    ...mapGetters([
      "deviceDetail",
      "globalDataId",
      "getOptionPageScrollPosition",
      "globalDeviceStatus",
      "globalAppVersion",
      "getCurtainAngleGear",
      "getCurtainTypeCodes",
      "getDoorAutoLockTime",
      "getCurtainRunWay",
    ]),
    childModeShow() {
      return this.deviceDetail.zigbeeTypeEnum === "RGBCW3" || this.deviceDetail.zigbeeTypeEnum === "CW3";
    },
    deviceTypeName() {
      let has =
        this.deviceDetail &&
        this.deviceDetail.deviceBindInfoVoList &&
        this.deviceDetail.deviceBindInfoVoList[0] &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList[0];
      return !!has ? has.name : "";
    },
    curtainType() {
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
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
        this.isUsually = this.deviceDetail.ifMostUsed;
      }
    },
  },
  components: {
    Modal,
    loadingBtn,
    iSwitch,
  },
};
</script>
<style lang="less" scoped>
.device-options {
  position: fixed;
  left: 0;
  right: 0;
  width: 100vw;
  bottom: 0;
  top: 88px;
  z-index: 9;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 40px 0;
  overflow-x: hidden;
  &.active {
    > div {
      opacity: 1;
    }
  }
  &.hidden {
    overflow: hidden;
  }
  .options-func,
  .options-normal,
  .options-info {
    width: 100%;
    background: #ffffff;
    text-align: left;
    margin-bottom: 40px;
    box-sizing: border-box;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    .title {
      font-size: 28px;
      color: #5e5e83;
      padding-left: 52px;
      height: 70px;
      line-height: 70px;
    }
    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 128px;
      width: 100%;
      box-sizing: border-box;
      padding: 0 40px 0 52px;
      position: relative;
      &::after {
        position: absolute;
        bottom: 0;
        left: 52px;
        right: 0;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border-bottom: none;
        }
      }
      .left {
        font-size: 32px;
        font-weight: bold;
        position: relative;
        color: #2f2f4a;
        &.active {
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
      .right {
        flex: 1;
        overflow: hidden;
        display: flex;
        justify-content: flex-end;
        &.loading {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
        }
        .tips {
          line-height: 1;
          width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
          color: #5e5e83;
          &.name {
            max-width: 360px;
            font-size: 28px;
          }
        }
        .icon-right {
          font-size: 28px;
          margin-left: 10px;
        }
      }
    }
  }
  .del-btn {
    width: 490px;
    height: 104px;
    line-height: 104px;
    background: #ffffff;
    border-radius: 52px;
    text-align: center;
    font-size: 32px;
    font-weight: 400;
    color: #ff453a;
  }
  .device-name-modal {
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
    .main {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      height: 360px;
      background: #fff;
      border-top-left-radius: 50px;
      border-top-right-radius: 50px;
      box-sizing: border-box;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .input-area {
        width: 100%;
        height: 112px;
        background-color: #f1f1f1;
        font-size: 32px;
        color: #121212;
        line-height: 112px;
        border: none;
        outline: none;
        border-radius: 16px;
        padding: 0 80px 0 40px;
        box-sizing: border-box;
      }
      .tips {
        width: 100%;
        color: #959495;
        font-size: 26px;
        font-weight: 400;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 30px;
        font-weight: bold;
        color: #959495;
        .name {
          font-size: 32px;
          color: #121212;
        }
        .comfirm {
          color: #4289ff;
        }
      }
    }
    .icon-close {
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: rgba(0, 0, 0, 0.5);
    }
  }
}

.opt-slide-enter-active {
  animation: bounce-in 0.4s linear -0.18s;
}
.opt-slide-two-enter-active {
  animation: bounce-in 0.4s linear -0.15s;
}
.opt-slide-three-enter-active {
  animation: bounce-in 0.4s linear -0.12s;
}
.opt-slide-four-enter-active {
  animation: bounce-in 0.4s linear -0.09s;
}
@keyframes bounce-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  70% {
    transform: translateX(0%);
  }
  80% {
    transform: translateX(-5%);
  }
  90% {
    transform: translateX(0%);
  }
  100% {
    opacity: 1;
  }
}
</style>
