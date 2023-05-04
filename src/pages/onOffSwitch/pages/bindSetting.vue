<template>
  <div class="bind-scene-setting">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">关联智能</span></template>
    </title-bar>
    <div class="main">
      <div class="cell">
        <span class="name">关联智能</span>
        <i-switch v-model="isBindScene" @onClickSwitch="onClickBind" />
      </div>
      <div class="cellswitch" v-show="(isBindScene && showDeviceOftenOpen) || (isBindScene && switchDevice) ">
        <p class="tip2">继电器设置</p>

        <van-radio-group v-model="checked" @change="checkedchange">
          <div class="divflex" @click="checked = 1">
            <div>主动控制</div>
            <van-radio :name="1" checked-color="#6165C5" icon-size="18px"></van-radio>
          </div>
          <div class="divflex" @click="checked = 5">
            <div>常开</div>
            <van-radio :name="5" checked-color="#6165C5" icon-size="18px"></van-radio>
          </div>
        </van-radio-group>
      </div>

      <p class="tip" v-show="isBindScene">注：若选择常开，则设备详情页中的继电器按钮将消失，此设备继电器将不能被手动或情景等任何方式控制。</p>
    </div>
    <Modal v-model="isConfirmOpen" title="温馨提示" content="开关设为常开后继电器状态将切换为断电记忆，切不可进行配置" @on-ok="onClickStatus" @on-cancel="openConfirmCancel" />
    <Modal v-model="sceneflag" title="温馨提示" content="开关已被编组使用，若开启关联智能，将会从原编组移除，请确认是否进行此操作！" @on-ok="onClickScene" @on-cancel="onClickSceneCancel" />
  </div>
</template>
<script>
import iSwitch from "../../../components/switch";
import loadingComp from "../../../components/Loading";
import titleBar from "../../../components/titleBar";
import { endpointControlRep, deviceBindSceneSwitchReq, checkIfGroupedReq } from "../../../api/request";
import Modal from "../../../components/modals/modal/Modal";
import { mapGetters, mapMutations } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
export default {
  name: "BindSetting",
  data() {
    return {
      // isOpen: false,
      isBindScene: false,
      isConfirmOpen: false,
      checked: "",
      sceneflag: false,
    };
  },
  methods: {
    ...mapMutations(["setOnOffSwithDeviceStatus"]),
    goBack() {
      this.$router.back();
    },
    async onClickScene() {
      const params = {
        endpointId: this.globalDataId,
        cmdKey: "set_switch_state",
        cmdValue1: 1,
      };
      let result = await endpointControlRep(params);
      this.sceneswitch();
      this.setOnOffSwithDeviceStatus(1);
    },
    onClickSceneCancel() {
      this.sceneflag = false;
      this.isBindScene = false;
    },
    async onClickBind() {
      if (this.isBindScene) {
        // let { data, error } = await checkIfGroupedReq({
        //   endpointId: this.globalDataId,
        // });
        // if (data.data) {
        //   this.sceneflag = true;
        // } else
        {
          // const params = {
          //   endpointId: this.globalDataId,
          //   cmdKey: "set_switch_state",
          //   cmdValue1: 1,
          // };
          // let result = await endpointControlRep(params);
          this.sceneswitch();
          this.setOnOffSwithDeviceStatus(1);
        }
      } else {
        this.sceneswitch();
      }
    },
    async sceneswitch() {
      let that = this;
      let { data, error } = await deviceBindSceneSwitchReq({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType,
        ifSceneConvertedEnum: this.isBindScene ? "yes" : "no",
      });
      if (!error) {
        //情景开开是5或1常开是5，没开情景是0
        // let status = this.isBindScene ? (this.isOpen ? 5 : 1) : 0;
        let status = this.isBindScene ? this.checked : 0;
        this.setOnOffSwithDeviceStatus(status);
      } else {
        // 此处不确定错误信息返回json结构
        let msg = error.msg || error.message || error.err || "设置失败";
        this.$Toast.show({
          title: msg,
        });
      }

      execNativeFunc("onDataChannel", {
        type: 3,
        params: {
          dataId: that.globalDataId,
          dataTypeEnum: that.globalDeviceType,
        },
      });
    },
    async openConfirm() {
      let that = this;
      if (this.checked == 1) {
        const params = {
          endpointId: this.globalDataId,
          cmdKey: "set_switch_state",
          cmdValue1: 1,
        };
        let result = await endpointControlRep(params);
        this.setOnOffSwithDeviceStatus(1);
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: that.globalDataId,
            dataTypeEnum: that.globalDeviceType,
          },
        });
      } else if (this.checked == 5) {
        // const params = {
        //   endpointId: this.globalDataId,
        //   cmdKey: "set_switch_state",
        //   cmdValue1: 5,
        // };
        // let result = await endpointControlRep(params);
        // this.setOnOffSwithDeviceStatus(5);
        // execNativeFunc("onDataChannel", {
        //   type: 3,
        //   params: {
        //     dataId: that.globalDataId,
        //     dataTypeEnum: that.globalDeviceType,
        //   },
        // });
        this.isConfirmOpen = true;
        // this.isOpen = !this.isOpen;
      }
    },
    openConfirmCancel() {
      this.isConfirmOpen = false;
      this.checked = 1;
    },
    async onClickStatus() {
      let that = this;
      const params = {
        endpointId: this.globalDataId,
        cmdKey: "set_switch_state",
        cmdValue1: 5,
      };
      let { data, error } = await endpointControlRep(params);
      if (!error) {
        this.setOnOffSwithDeviceStatus(5);
        // this.isOpen = true;
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: that.globalDataId,
            dataTypeEnum: that.globalDeviceType,
          },
        });
      } else {
        // 此处不确定错误信息返回json结构
        let msg = error.msg || error.message || error.err || "设置失败";
        this.$Toast.show({
          title: msg,
        });
      }
    },
    checkedchange() {
      this.openConfirm();
    },
  },

  watch: {
    onOffSwithDeviceStatus(newV) {
      console.log(newV, "设备开关状态");
      if (typeof newV !== "number") return;
      // this.isOpen = newV === 5;
      this.checked = newV;
      this.isBindScene = newV !== 0;
      // if(this.isBindScene == true && this.checked == 0){
      //   this.checked = 1
      // }
    },
    // checked(newV, oldV) {

    // },
  },
  created() {
    
    this.checked = this.onOffSwithDeviceStatus;
    this.isBindScene = this.onOffSwithDeviceStatus !== 0; //不等于0就是场景开开
  },
  computed: {
    ...mapGetters(["onOffSwithDeviceStatus", "globalDataId", "globalDeviceType", "deviceDetail"]),
    showDeviceOftenOpen() {
      console.log("showDeviceOftenOpen",this.deviceDetail);
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_normally_open } = attrs;
      return function_normally_open == 1;
    },
    deviceTypeCodeK5X() {
      return this.deviceDetail.deviceTypeCode == "K51" || this.deviceDetail.deviceTypeCode == "K52" || this.deviceDetail.deviceTypeCode == "K53" || this.deviceDetail.deviceTypeCode == "K54";
    },

    ////是否是开关设备
    switchDevice() {
      return this.deviceDetail.zigbeeTypeEnum == "OnOffSwitch" ;
    },

  },
  components: {
    titleBar,
    iSwitch,
    Modal,
    // loadingComp,
  },
};
</script>
<style lang="less" scoped>
.bind-scene-setting {
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
      font-weight: 600;
      color: #000000;
    }
  }
  .main {
    height: 100%;
    width: 100%;
    background: #f0f0fd;
    .cell {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px 0 52px;
      box-sizing: border-box;
      height: 128px;
      line-height: 128px;
      background: #fff;
      margin-top: 30px;
      font-weight: bold;
    }
    .cellswitch {
      width: 100%;

      padding: 0 40px 0 52px;
      box-sizing: border-box;
      height: 326px;
      // line-height: 128px;
      background: #fff;
      margin-top: 30px;
      font-weight: bold;
      font-size: 32px;
      .divflex {
        display: flex;
        justify-content: space-between;
        padding: 30px 0;
      }
    }
    .tip {
      font-size: 24px;
      color: #5e5e83;
      margin-top: 30px;
      padding-left: 52px;
      padding-right: 52px;
    }
    .tip2 {
      font-size: 28px;
      color: #5e5e83;
      line-height: 96px;
      height: 96px;
      // margin-top: 30px;
      // padding-left: 52px;
    }
  }
}
</style>
