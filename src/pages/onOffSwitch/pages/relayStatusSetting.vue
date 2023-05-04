<template>
  <div class="relayStatusSetting">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">继电器状态</span></template>
    </title-bar>
    <div class="main">
      <div class="radio-button">
        <radio-group v-model="relayMode" name="relayMode">
          <radio label="255" @onselect="onSetting">断电记忆</radio>
          <radio label="1" @onselect="onSetting">断电开</radio>
          <radio label="0" @onselect="onSetting">断电关</radio>
        </radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import Radio from "@/components/Radio";
import RadioGroup from "@/components/RadioGroup";
import titleBar from "../../../components/titleBar";
import { endpointControlRep, deviceBindSceneSwitchReq } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
export default {
  name: "relayStatusSetting",
  data() {
    return {
      isOpen: false,
      isBindScene: false,
      relayMode: "255"
    };
  },
  methods: {
    ...mapMutations(["setOnOffSwithDeviceStatus", "setOnOffSwitchElectrifyStatus"]),
    goBack() {
      this.$router.back();
    },
    async onSetting(val) {
      const cmdKey = val === "255" ? "set_startup_memory" : "set_startup_on_off";
      const params = {
        endpointId: this.globalDataId,
        cmdKey: cmdKey,
        cmdValue1: ~~val
      };
      let { error } = await endpointControlRep(params);

      if (!error) {
        //
        this.setOnOffSwitchElectrifyStatus(~~val);
        this.$Toast.show({
          title: "设置成功"
        });
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
      } else {
        this.$Toast.show({
          title: "设置失败"
        });
      }
    }
  },
  watch: {
    onOffSwithDeviceStatus(newV) {
      if (typeof newV !== "number") return;
      this.isOpen = newV === 5;
      this.isBindScene = newV !== 0;
    }
    // onOffSwitchElectrifyStatus(newV) {
    //  if (typeof newV !== "number") return;
    //  this.relayMode = this.onOffSwitchElectrifyStatus + ''
    // },
  },
  created() {
    this.relayMode = this.onOffSwitchElectrifyStatus + "";
  },
  activated() {
    this.relayMode = this.onOffSwitchElectrifyStatus + "";
  },
  computed: {
    ...mapGetters(["onOffSwithDeviceStatus", "globalDataId", "globalDeviceType", "deviceDetail", "onOffSwitchElectrifyStatus"])
  },
  components: {
    titleBar,
    Radio,
    RadioGroup
  }
};
</script>
<style lang="less" scoped>
.relayStatusSetting {
  color: #2f2f4a;
  .title-area {
    position: relative;
    flex: 0 0 88px;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: 500;
      color: #2f2f4a;
    }
  }
  .main {
    height: 100%;
    width: 100%;
    background: #f0f0fd;
    .radio-button {
      margin-top: 43px;
      background: #fff;
    }
  }
}
</style>
