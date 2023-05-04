<template>
  <div class="device-options" ref="options" :class="{ active: showAnimation }" @scroll="handleScroll">
    <transition name="opt-slide">
      <!-- showFunctionGroup from mixin -->
      <div class="options-normal" v-if="showAnimation && (showFunctionGroup || showGroupEditing)">
        <p class="title">功能</p>
        <!-- showGroupEditing from mixin -->
        <div class="cell" @click="goEditGroup" v-if="showGroupEditing">
          <div class="left">编组管理</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <div class="cell" @click="goCountdownSetting" v-if="showCountdown">
          <div class="left">定时</div>
          <div class="right">
            <span class="tips">{{ getTimingDesc }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <!-- showMotorStrength from mixin -->
        <div class="cell" @click="goMotorQuake" v-if="showMotorStrength">
          <div class="left">马达震感</div>
          <div class="right">
            <span class="tips">{{ getMotorStrength }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

        <div class="cell" v-if="showRelaySetting" @click="goRelayStatus" :class="relayStatusDisabled ? 'disabled' : ''">
          <div class="left">继电器状态</div>
          <div class="right">
            <span class="tips">{{relayStatusDisabled ? '断电记忆' : getElectrifyStatusText }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-two">
      <div class="options-normal" v-if="showAnimation">
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
        <div class="cell" @click="goFeedback">
          <div class="left">问题反馈</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-three">
      <div class="options-info" v-if="showAnimation">
        <p class="title">设备信息</p> 

        <div class="cell" v-for="item of getSubDeviceList" :key="item.dataId" @click="handleOnSubDevice(item.dataId)">
          <div class="left">{{ item.deviceName }}</div>
          <div class="right">
              <span class="iconfont icon-right"></span>
          </div>
        </div> 
      </div>
    </transition>
    <transition name="opt-slide-four">
      <div class="del-btn" v-if="showAnimation" @click="clickDel">解散开关编组</div>
    </transition>
    <div class="device-name-modal" @touchmove.stop.prevent @click.stop="forceFocus" v-show="nameModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click.stop="clickCancel">取消</span>
          <span class="name">修改设备名称</span>
          <span class="comfirm" @click.stop="onComfirm">确定</span>
        </div>
        <div style="position:relative">
          <input class="input-area" ref="inputArea" v-model="deviceName" :maxlength="20" autofocus type="text" />
          <span class="iconfont icon-close" v-show="deviceName" @click="deviceName = ''"></span>
        </div>
        <div class="tips">
          <span>支持中/英文/数字/符号</span>
          <span>{{ (deviceName && deviceName.length) || 0 }}/20</span>
        </div>
      </div>
    </div>
    <Modal
      v-transclude="'#onOffSwitchGroup'"
      v-model="isConfirmOpen"
      title="温馨提示"
      type="one"
      content="当前设备关联场景为常开,若需要自定义设置继电器状态，请将常开修改为主动控制或关闭情景"
      okText="我知道了"
    />
    <Modal v-transclude="'#onOffSwitchGroup'" v-model="delModal" title="温馨提示" content="确定要解散开关编组吗" @on-ok="onDel" />
    <Modal v-transclude="'#onOffSwitchGroup'" v-model="statusData.show" title="温馨提示" type="one" :content="statusData.content" okText="确认" />
    <!-- 设备查找 ing Modal -->
    <Modal v-transclude="'#onOffSwitchGroup'" v-model="findDeviceModal" title="查找设备" type="one" content="设备已唤醒，请注意查看" @on-ok="stopFindDevice">
      <template v-slot:title>
        <div class="find-device-title">
          <span class="title"
            >查找设备<span class="countdown">({{ findCountdown }}s)</span></span
          >
        </div>
      </template>
      关闭
    </Modal>

    <!-- 设备查找 超时Modal -->
    <Modal v-transclude="'#onOffSwitchGroup'" v-model="findDeviceTimeoutModal" title="温馨提示" content="查找超时，请点击重试" okText="重试" @on-ok="handleFindDevice"> </Modal>
  </div>
</template>
<script>
const FIND_DEVICE_SECONDS = 120;
import iSwitch from "../../../components/switch";
import { deviceInfoUpdRep, deviceDelRep,deviceDetailRep , removeUsuallyRep, addUsuallyRep, groupDeviceListRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { emojiReg } from "../../../utils/reg";
import onoffswitch from "@/mixins/onoffswitch";
export default {
  name: "DeviceOptionsOnOffSwitchGroup",
  mixins: [onoffswitch],
  props: {
    isShow: {
      type: Boolean
    }
  },
  data() {
    return {
      showAnimation: false,
      switchStatus: false,
      nameModal: false,
      deviceName: "",
      delModal: false,
      isUsually: false
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setcurEndpointId"]),
    ...mapMutations({setSubDeviceList: "group/setSubDeviceList", setCurDeviceDetail: "group/setCurDeviceDetail" }),
    
    goDeviceRoom() {
      this.$router.push({ name: "DeviceRoom", query: { slideWay: "left" } });
    },
    goVersion() {
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
    goScenePage() {
      if (this.deviceDetail.ownedCount <= 0) return;
      this.$router.push({ name: "ScenePage", query: { slideWay: "left" } });
    },
    goBindSetting() {
      this.ifOnlineCallback(() => {
        this.$router.push({ name: "bindSetting", query: { slideWay: "left" } });
      });
    },
    // 跳转倒计时设置界面
    goCountdownSetting() {
      this.$router.push({
        name: "TimingSetting",
        query: { slideWay: "left" }
      });
      // this.CountDownSetting()
      // if (this.countDownInstance) {
      //   this.countDownInstance.showModal();
      // }
      // todo
    },
    // 跳转倒计时设置界面
    goTimingSetting() {
      if (this.timingInstance) {
        this.timingInstance.showModal();
      }
      // todo
    },
    // 跳转到设备编组界面
    goDeviceMarshalling() {
      // todo
    },
    // 跳转到继电器设置
    goRelayStatus() {
      this.ifOnlineCallback(() => {
        if (this.onOffSwithDeviceStatus === 5) {
          this.isConfirmOpen = true;
        } else {
          this.$router.push({
            name: "RelayStatusSetting",
            query: { slideWay: "left" }
          });
        }

        // if (this.onOffSwitchElectrifyStatus === 255 && (this.deviceDetail.bindSceneName && this.onOffSwithDeviceStatus != 0 )) {
        //   this.$Toast.show({ title: "请先取消设备情景关联再进行此配置" });
        // } else if (this.onOffSwithDeviceStatus === 5) {
        //   this.isConfirmOpen = true;
        // } else {
        //   this.$router.push({
        //     name: "RelayStatusSetting",
        //     query: { slideWay: "left" }
        //   });
        // }
      });
    },
    goEditGroup() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 3, data: this.deviceDetail });
    },
    clickDel() {
      this.delModal = true;
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
    async removeUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device"
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
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device"
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
      e && e.stopPropagation();
      if (emojiReg.test(this.deviceName)) {
        this.$Toast.show({
          title: "设备名称只支持中文、英文、数字、符号",
          postion: "bottom"
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
        deviceName: this.deviceName
      });
      if (data && !error) {
        let detail = this.deviceDetail;
        detail.deviceName = this.deviceName;
        this.setDeviceDetail(detail);
        this.clickCancel();
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async onDel() {
      let { data, error } = await deviceDelRep({
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum
      });
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        this.$Toast.show({ title: "操作成功" });
        execNativeFunc("onDataChannel", {
          type: 4,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
    handleOnSubDevice(id) { 
      deviceDetailRep({ dataId: id, dataTypeEnum: this.globalDeviceType }).then((res => { 
          this.setCurDeviceDetail(res.data.data)
      })); 
      this.$router.push({
        name: 'SubDeviceCard',
         query: { slideWay: "left" }
      })
    },
  },
  
  async mounted() {

    this.showAnimation = this.isShow;
    this.isUsually = this.deviceDetail.ifMostUsed;
    const { data, error} = await groupDeviceListRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType
      })  
      if(!error){
         this.setSubDeviceList(data.data)
      }
   
  },
  beforeDestroy() {
    this.countDownInstance && this.countDownInstance.destroy();
    this.timingInstance && this.timingInstance.destroy();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "globalDeviceType", "onOffSwithDeviceStatus", "globalDeviceStatus", "onOffSwitchMotorStrength", "onOffSwitchElectrifyStatus", "onOffSwitchScrollTop"]),
    ...mapGetters({ getTimingDesc: "schedule/getTimingDesc", getSubDeviceList: "group/getSubDeviceList"  }),
    getElectrifyStatusText() {
      return this.onOffSwitchElectrifyStatus === 255 ? "断电记忆" : this.onOffSwitchElectrifyStatus === 1 ? "断电开" : "断电关";
    },
    // 是否支持继电器设置
    showRelaySetting() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { group_function_power_on_relay_setting } = attrs;
      return group_function_power_on_relay_setting == 1;
    },
    showCountdown() { 
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { group_function_timing_switch } = attrs;

      return group_function_timing_switch == 1; 
    }, 
    showMotorStrength() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { group_function_motor_vibration_setting } = attrs;
      return group_function_motor_vibration_setting == 1; 
    },
    relayStatusDisabled() {
      // return this.onOffSwithDeviceStatus === 5
      return this.onOffSwithDeviceStatus === 5 || (this.onOffSwitchElectrifyStatus === 255 && this.deviceDetail.bindSceneName && this.onOffSwithDeviceStatus != 0);
    }
  },
  watch: {
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
      }
    }
  },
  components: {
    Modal,
    iSwitch
  }
};
</script>
<style lang="less" scoped>
.device-options {
  position: absolute;
  left: 0;
  right: 0;
  width: 100vw;
  bottom: 0;
  top: 0;
  margin-top: 88px;
  z-index: 1200;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 40px 0;
  overflow-x: hidden;
  .options-func,
  .options-normal,
  .options-info {
    width: 100%;
    background: #ffffff;
    border-radius: 16px;
    text-align: left;
    margin-bottom: 40px;
    box-sizing: border-box;
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
        color: #000000;
        position: relative;
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
        .tips {
          line-height: 1;
          color: #797979;
          width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
          &.name {
            max-width: 360px;
          }
        }
        .icon-right {
          font-size: 28px;
          margin-left: 10px;
          color: #d8d8d8;
        }
      }
    }
    .disabled {
      .left {
        color: #c0c0cd !important;
      }
      .tips {
        color: #c0c0cd !important;
      }
      .icon-right {
        color: #c0c0cd !important;
        opacity: 0.3;
      }
    }
  }
  .del-btn {
    width: 90%;
    height: 104px;
    line-height: 104px;
    background: #ffffff;
    border-radius: 16px;
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

<style lang="less">
.find-device-title {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  margin-bottom: 40px;
  img {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
  .title {
    font-size: 32px;
    line-height: 45px;
    font-weight: bold;
    color: #121212;
  }
  .countdown {
    color: #6165c5;
  }
}
</style>
