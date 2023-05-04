<template>
  <div class="light-status">
    <title-bar @goBack="goBack" :showRight="false">
      <template v-slot:title>
        <p class="title">灯光状态</p>
      </template>
    </title-bar>
    <div class="main">
      <div class="section">
        <p class="tip">选择通电后灯光状态</p>
        <div class="cell" :class="{ 'no-border': recoveryOffStatus }">
          <span>恢复断电前状态</span>
          <i-switch v-model="recoveryOffStatus" @onClickSwitch="onSwitch('1')" />
        </div>
        <div class="cell no-border" v-show="!recoveryOffStatus">
          <span>通电后默认开灯</span>
          <i-switch v-model="defaultLightStatus" @onClickSwitch="onSwitch('2')" />
        </div>
        <p class="text" v-show="!recoveryOffStatus">关闭则通电后默认为关灯状态</p>
      </div>
      <div class="section">
        <p class="tip">选择开灯后灯光状态</p>
        <div class="cell no-border" @click="clickStatus">
          <span>恢复关灯前状态</span>
          <i-switch v-model="recoveryLightOffStatus" :disabled="!lightStatus" @onClickSwitch="onSwitch('3')" />
        </div>
        <p class="text" v-show="!recoveryLightOffStatus">开启后，开灯时会自动恢复关灯前灯光状态；关闭后，开灯时会恢复到记忆灯光状态。</p>
      </div>
      <div class="section" v-show="!recoveryLightOffStatus">
        <div class="cell no-border">
          <span>记忆灯光状态</span>
          <span class="remember-btn" @click="onSwitch('4')">记忆</span>
        </div>
        <p class="text">点击记忆按钮即可将设备当前状态保存为记忆状态，每次开灯后灯光将展示记忆状态。</p>
      </div>
    </div>
    <Modal v-model="isRememberModal" title="温馨提示" type="one" content="您未设置记忆灯光" />
    <Modal v-model="disableModal" title="温馨提示" type="one" :content="disableText" />
  </div>
</template>
<script>
import TitleBar from "../../../components/titleBar";
import iSwitch from "../../../components/switch";
import Modal from "../../../components/modals/modal/Modal";
import { mapGetters, mapMutations } from "vuex";
import { endpointControlRep } from "../../../api/request";
export default {
  name: "light-status",
  data() {
    return {
      recoveryOffStatus: false, // 恢复断电前状态
      defaultLightStatus: false, // 通电后默认开灯
      recoveryLightOffStatus: false, // 恢复关灯前状态
      rememberStatus: false,
      isRememberModal: false,
      disableModal: false,
      disableText: "设备未开启，暂不支持该操作",
    };
  },
  methods: {
    clickStatus() {
      if (!this.lightStatus) {
        this.disableModal = true;
        this.disableText = "设备未开启，暂不支持该操作";
        return;
      }
    },
    onSwitch(type) {
      if (type === "1") {
        // 恢复断电前状态
        if (this.recoveryOffStatus) {
          let params = {
            endpointId: this.globalDataId,
            cmdKey: "set_startup_memory",
          };
          this.handleExec(params, type);
        } else {
          let params = {
            endpointId: this.globalDataId,
            cmdKey: "set_startup_on_off",
            cmdValue1: this.defaultLightStatus ? 1 : 0,
          };
          this.handleExec(params, type);
        }
      } else if (type === "2") {
        // 通电后默认开灯
        let params = {
          endpointId: this.globalDataId,
          cmdKey: "set_startup_on_off",
          cmdValue1: this.defaultLightStatus ? 1 : 0,
        };
        this.handleExec(params, type);
      } else if (type === "3") {
        // 恢复关灯前状态
        this.rememberStatus = !this.recoveryLightOffStatus;
        let params = {
          endpointId: this.globalDataId,
          cmdKey: "set_on_memory_value",
        };
        this.handleExec(params, type);
      } else if (type === "4") {
        if (!this.lightStatus) {
          return this.clickStatus();
        }
        let params = {
          endpointId: this.globalDataId,
          cmdKey: "set_on_fixed_value",
        };
        this.rememberStatus = false;
        this.handleExec(params, type);
      }
    },
    goBack() {
      if (this.rememberStatus) {
        this.isRememberModal = true;
        this.rememberStatus = false;
        this.recoveryLightOffStatus = this.getWhenLightOnStatus === 255;
        return;
      }
      this.$router.back();
    },
    async handleExec(params, type) {
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        if (type === "4") {
          this.rememberStatus = false;
          this.$Toast.show({ title: "记忆成功", type: 2 });
        }
      } else {
        if (type === "4") {
          this.recoveryLightOffStatus = true;
          this.$Toast.show({ title: "记忆失败" });
        }
      }
    },
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "getWhenLightOnStatus", "getElectriDefaultLightStatus", "lightStatus"]),
  },
  components: {
    TitleBar,
    iSwitch,
    Modal,
  },
  created() {
    this.recoveryLightOffStatus = this.getWhenLightOnStatus === 255;
    this.recoveryOffStatus = this.getElectriDefaultLightStatus === 255;
    this.defaultLightStatus = this.getElectriDefaultLightStatus === 1;
  },
  watch: {
    getWhenLightOnStatus(newV) {
      this.recoveryLightOffStatus = newV === 255;
    },
    getElectriDefaultLightStatus(newV) {
      this.recoveryOffStatus = newV === 255;
      this.defaultLightStatus = newV === 1;
    },
  },
};
</script>
<style lang="less" scoped>
.light-status {
  background: #fafafb;
  .title {
    font-size: 36px !important;
    font-weight: 600;
    color: #000000;
    flex: 1;
    padding-right: 40px;
    text-align: center;
  }
  .main {
    .section {
      background: #fff;
      margin-bottom: 20px;
      &:last-child {
        margin-top: 40px;
      }
      .tip {
        padding: 24px 40px;
        line-height: 1;
        font-size: 28px;
        font-weight: 400;
        color: #4289ff;
        border-bottom: 2px solid rgba(0, 0, 0, 0.05);
      }
      .cell {
        width: 100%;
        display: flex;
        box-sizing: border-box;
        padding: 32px 40px;
        align-items: center;
        justify-content: space-between;
        font-size: 32px;
        font-weight: 400;
        color: #000000;
        position: relative;
        &::after {
          position: absolute;
          left: 40px;
          right: 0;
          content: " ";
          border-bottom: 2px solid rgba(0, 0, 0, 0.05);
          bottom: 0;
        }
        &.no-border {
          &::after {
            border: none;
          }
        }
      }
      .text {
        height: 74px;
        font-size: 28px;
        font-weight: 400;
        color: #d2d2d2;
        line-height: 1;
        padding-top: 20px;
        padding-left: 40px;
        padding-right: 40px;
        background: #fafafb;
        box-sizing: border-box;
        line-height: 40px;
      }
      .remember-btn {
        width: 140px;
        height: 60px;
        border-radius: 30px;
        border: 1px solid #6165c5;
        font-size: 32px;
        font-weight: 400;
        color: #6165c5;
        line-height: 58px;
        text-align: center;
        display: inline-block;
        box-sizing: border-box;
      }
    }
  }
}
</style>
