<template>
  <div class="motorQuakeSetting">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">马达震感</span></template>
    </title-bar>
    <div class="main">
      <div class="radio-button">
        <radio-group v-model="motorStrength" name="motorQuake" >
          <radio label="0" @onselect="onSetting">关闭</radio>
          <radio label="40" @onselect="onSetting">一档</radio>
          <radio label="80" @onselect="onSetting">二档</radio>
          <radio label="120" @onselect="onSetting">三档</radio>
          <radio label="160" @onselect="onSetting">四档</radio>
          <radio label="200" @onselect="onSetting">五档</radio>
        </radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import Radio from "@/components/Radio";
import RadioGroup from "@/components/RadioGroup";
import titleBar from "@/components/titleBar";
import { execNativeFunc } from "@/utils/bridge";
import {
  endpointControlRep, 
} from "@/api/request";
import { mapGetters, mapMutations } from "vuex"; 
export default {
  name: "motorQuakeSetting",
  data() {
    return { 
      isBindScene: false,
      motorStrength: '160',
    };
  },
  methods: {
    ...mapMutations(["setOnOffSwithDeviceStatus", "setOnOffSwitchMotorStrength"]),
    goBack() {
      this.$router.back();
    },
    async onSetting(val) {  
      const params = {
        endpointId: this.getEndpointId,
        cmdKey: "set_motor_vibration_intensity",
        cmdValue1: ~~val,
      }; 
      let { error } = await endpointControlRep(params);
      
      if(!error) { 
this.setOnOffSwitchMotorStrength(~~val)
this.$Toast.show({
          title: '设置成功'
        })
         execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
          },
        });
      } else {
        this.$Toast.show({
          title: '设置失败'
        })
      }
    }, 
  },
  watch: {
    onOffSwithDeviceStatus(newV) {
      if (typeof newV !== "number") return;
      this.isOpen = newV === 5;
      this.isBindScene = newV !== 0;
    },
    // onOffSwitchMotorStrength(newV) {
    //  if (typeof newV !== "number") return;
    //  console.log('this.onOffSwitchMotorStrength changed:,', this.onOffSwitchMotorStrength);
    //  this.motorStrength = this.onOffSwitchMotorStrength + ''
    // },
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName; 
      }
    },
  },
  created() {
    this.isOpen = this.onOffSwithDeviceStatus === 5;
    this.isBindScene = this.onOffSwithDeviceStatus !== 0;
    this.motorStrength = this.onOffSwitchMotorStrength + ''

  },
  computed: {
    ...mapGetters([
      "onOffSwithDeviceStatus",
      "globalDataId",
      "globalDeviceType",
      "deviceDetail",
      "onOffSwitchMotorStrength"
    ]),
    getEndpointId(){
      if(this.deviceDetail.dataTypeEnum === 'endpoint') {
        return this.globalDataId
      } else if(this.deviceDetail.dataTypeEnum === 'device') { 
        const list = this.deviceDetail.endpointList || []
        if(list.length > 0) {
          return list[0].dataId
        }
      } 
      return '' 
    },
  },
  components: {
    titleBar,
    Radio,
    RadioGroup, 
  },
};
</script>
<style lang="less" scoped>
.motorQuakeSetting {
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
      color: #2F2F4A;;
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
