<template>
  <div class="CombinationOptions">
    <transition name="opt-slide">
      <div class="options-normal">
        <p class="title">功能</p>
        <div class="cell" @click="goCountdownSetting">
          <div class="left">定时</div>
          <div class="right">
            <span class="tips">勿扰模式灭灯</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <!--  -->
        <div class="cell" @click="goCountdownSetting">
          <div class="left">设备编组</div>
          <div class="right">
            <span class="tips"></span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <!--  -->
      </div>
    </transition>
    <transition name="opt-slide-two">
      <div class="options-normal">
        <p class="title">常规</p>
        <div class="cell" @click="clickCell()">
          <div class="left">设备名称</div>
          <div class="right">
            <!-- <span class="tips name">{{ deviceDetail.deviceName }}</span> -->
            <span class="tips name">一位开关</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goDeviceRoom">
          <div class="left">设备房间</div>
          <div class="right">
            <!-- <span class="tips name">{{ deviceDetail.goalDeviceRoomName }}</span> -->
            <span class="tips name">一楼 / 客厅</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell">
          <div class="left">添加到常用</div>
          <div class="right">
            <i-switch v-model="isUsually" @onClickSwitch="clickUsually" />
          </div>
        </div>
        <div class="cell" @click="goScenePage">
          <div class="left">场景</div>
          <!-- <div class="right" v-if="deviceDetail.ownedCount > 0"> -->
          <div class="right" v-if="true">
            <!-- <span class="tips">{{ deviceDetail.ownedCount }}个</span> -->
            <span class="tips">4个</span>
            <span class="iconfont icon-right"></span>
          </div>
          <div class="right" v-else>
            <span class="tips">无</span>
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
  </div>
</template>

<script>
import iSwitch from "../../../components/switch";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "CombinationOptions",
  components: {
    iSwitch,
  },
  data() {
    return {
      isUsually: false,
    };
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "onOffSwithDeviceStatus", "globalDeviceStatus", "onOffSwitchMotorStrength", "onOffSwitchElectrifyStatus", "onOffSwitchScrollTop"]),
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setcurEndpointId"]),
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
    goCountdownSetting() {
      // this.$router.push({ name: "SwitchingSystem", query: { slideWay: "left" } });
    },
    clickCell(){},
    goDeviceRoom() {},
    goScenePage() {},
    clickUsually() {
      execNativeFunc("onDataChannel", { type: 0 });
      if (this.isUsually) {
        this.addToUsually();
      } else {
        this.removeUsually();
      }
    },
    goFeedback() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 2, data: this.deviceDetail });
    },
  },
};
</script>

<style scoped lang="less">
.CombinationOptions {
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
    // border-radius: 16px;
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
      position: relative;
      &::after {
        position: absolute;
        bottom: 0;
        left: 52px;
        right: 0;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
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
        font-weight: 500;
        color: #2f2f4a;
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
  }
}
.opt-slide-enter-active {
  animation: bounce-in 0.4s linear -0.18s;
}
.opt-slide-two-enter-active {
  animation: bounce-in 0.4s linear -0.15s;
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