<template>
  <div class="SwitchingSystem">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title>
        <div class="title title-bar">
          <div class="txt">开关设置</div>
        </div>
      </template>
      <template v-slot:right><span></span></template>
    </title-bar>
    <transition name="opt-slide">
      <div class="options-normal">
        <div class="cell">
          <div class="left">开关名称</div>
          <div class="right" @click="goCountdownSetting">
            <span class="tips">{{ InitData.deviceName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <!--  -->
        <div class="cell">
          <div class="left">开关图标</div>
          <div class="right" @click="goIconSetting">
            <span class="tips"></span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-main">
      <div class="options-normal">
        <div class="cell">
          <div class="left">绑定智能</div>
          <div class="right" @click="goBindSetting">
            <span class="tips" v-if="InitData.bindSceneId != -1">{{ InitData.bindSceneName }}</span>
            <span class="tips" v-else>无</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" v-if="InitData.knobeBindEndpoint && deviceTypeCodeK5X">
          <div class="left">滑动控制</div>
          <div class="right" @click="goSlide">
            <span class="tips">停用</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-leg" v-if="isBindSence">
      <div class="options-normal">
        <div class="cell">
          <div class="left">开关状态</div>
          <div class="right" @click="goStatus">
            <span class="tips">{{ this.parmes.cmdValue1 == 1 ? "开关可控" : "常通电" }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-floot">
      <div class="options-normal">
        <div class="cell">
          <div class="left">上电状态</div>
          <div class="right" @click="goElectricity">
            <span class="tips">断电记忆</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <van-popup v-model="isShowPopup" :overlay="overlay" position="bottom" class="SwitchingSystem-PoP">
      <div v-if="Binding">
        <div class="popupTotle">请选择要绑定的类型</div>
        <div class="popupcontent" v-if="deviceTypeCodeK5X" @click="BindingDevice">绑定设备</div>
        <div class="popupcontent" @click="BindingScenario">绑定场景</div>
        <!-- <div class="popupcontent" @click="onUnbindModal">解绑</div> -->
        <div class="popup"></div>
        <div class="popupclose" @click="closepop">取消</div>
      </div>
      <div v-else-if="electricity">
        <div class="popupTotle">请选择上电后的电路状态</div>
        <div class="popupcontent" @click="On">通电</div>
        <div class="popupcontent" @click="Off">断电</div>
        <div class="popupcontent" @click="OffMemory">断电记忆</div>
        <div class="popup"></div>
        <div class="popupclose" @click="closepop">取消</div>
      </div>
      <div v-else-if="Status">
        <div class="popupTotle">请选择开关的受控状态</div>
        <div class="popupcontent" @click="controlled">开关可控</div>
        <div class="popupcontent" @click="constant">常通电</div>
        <div class="popup"></div>
        <div class="popupclose" @click="closepop">取消</div>
      </div>
      <div v-else-if="Slide">
        <div class="popupTotle">请选择滑动控制功能</div>
        <div class="popupcontent" @click="luminance">亮度调节</div>
        <div class="popupcontent" @click="colour">色温调节</div>
        <div class="popupcontent" @click="stopSlide">停用</div>
        <div class="popup"></div>
        <div class="popupclose" @click="closepop">取消</div>
      </div>
    </van-popup>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="constantMadal" title="温馨提示" :content="constantTxt" :okText="'确认'" @on-cancel="onCancel" @on-ok="onOk" />
    <div class="device-name-modal" @touchmove.stop.prevent @click.stop="forceFocus" v-show="nameModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click.stop="clickCancel">取消</span>
          <span class="name">修改设备名称</span>
          <span class="comfirm" @click.stop="onComfirm">确定</span>
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
  </div>
</template>

<script>
import titleBar from "@/components/titleBar";
import Modal from "@/components/modals/modal/Modal";
import { emojiReg } from "@/utils/reg";
import { mapGetters, mapMutations } from "vuex";
import { deviceDetailRep, deviceInfoUpdRep, bindDeviceKxReq, slidingRep, bindSceneRep, deviceBindSceneSwitchReq, endpointControlRep } from "@/api/request.js";
import { EventBus } from "../eventbus";

export default {
  name: "SwitchingSystem",
  components: {
    titleBar,
    Modal,
  },
  data() {
    return {
      //离线0 在线1||5 离网4 入网中7
      onOffLine: "", //设备是否在线 根据attrs中>>attrHex值为15855616的attrValue判断
      overlay: true,
      deviceDisableContent: "",
      deviceDisableModal: false,
      nameModal: false,
      deviceName: "",
      InitData: {},
      isShowPopup: false,
      Binding: false,
      electricity: false,
      Slide: false,
      Status: false,
      constantMadal: false,
      constantTxt: "",
      dataId: "",
      parmes: {
        endpointId: this.globalDataId,
        cmdKey: "set_switch_state",
        cmdValue1: 0,
      },
    };
  },
  created() {
    // this._showOfflineModal(0);
    // this.dataId = this.$route.query.dataId || "";
    // console.log(this.dataId, "query");
    // this.getData();
  },
  watch: {
    "$route.path": {
      handler(newVal, oldVal) {
        this.dataId = this.$route.query.dataId || "";
        this.getData();
      },
      immediate: true,
    },
    onOffSwithDeviceStatus: {
      handler(newVal) {
        console.log(newVal, "cmdValue1");
        if (typeof newVal !== "number") return;
        this.parmes.cmdValue1 = newVal;
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "childMode", "onOffSwithDeviceStatus", "onOffSwitchMotorStrength"]),
    // 是否绑定了情景
    isBindSence() {
      return this.InitData.bindSceneId && this.InitData.bindSceneId != "-1";
    },
    ////是否是K5X系列
    deviceTypeCodeK5X() {
      return ["K51", "K52", "K53", "K54"].includes(this.InitData.deviceTypeCode);
    },
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setcurEndpointId"]),

    async getData() {
      let result = await deviceDetailRep({ dataId: this.dataId, dataTypeEnum: this.globalDeviceType });
      if (result && result.data) {
        this.InitData = result.data.data;
        const onOffLine = result.data.data.attrs.find((v) => v.attrHex === 15855616);
        this.onOffLine = onOffLine.attrValue
        console.log(this.InitData, "ininini");
      }
    },
    SETSATE(item) {
      this.overlay = true;
      this.isShowPopup = true;
      let sateList = ["Binding", "electricity", "Slide", "Status"];
      sateList.forEach((v) => {
        this[v] = false;
      });
      item ? (this[item] = true) : "";
    },
    //滑动控制
    goSlide() {
      this.SETSATE("Slide");
    },
    luminance() {
      this.closepop();
      console.log("亮度调节");
      slidingRep({
        cmdKey: "brightness_set_percent",
        endpointId: this.InitData.dataId,
        transTime: 4,
      });
    },
    colour() {
      this.closepop();
      console.log("色温调节");
      slidingRep({
        cmdKey: "colorTemp_set_4000k",
        endpointId: this.InitData.dataId,
        transTime: 4,
      });
    },
    stopSlide() {
      this.closepop();
      console.log("停用");
    },
    // 开关状态
    goStatus() {
      if (![1, 5].includes(+this.onOffLine)) {
        this._showOfflineModal(0);
        return;
      }
      this.SETSATE("Status");
      // this.closepop();
    },
    controlled() {
      this.closepop();
      this.parmes.cmdValue1 = 1;
      this.overlay = false;
      return;
      endpointControlRep(this.parmes);
      this.setExecNativeFunc();
      console.log("开关可控");
    },
    constant() {
      this.closepop();
      console.log("常通电");
      this.constantMadal = true;
      this.constantTxt = "当选择常通电后，该开关对应的线路将一直通电，不能被手动、组控或情景的方式控制。";
    },
    onCancel() {
      console.log("onCancel");
      this.constantMadal = false;
      this.overlay = false;
      // document.querySelector('.van-this.overlay').style.display = 'none';
      this.parmes.cmdValue1 = 1;
    },
    //开关状态常开
    onOk() {
      console.log("onOk");
      this.parmes.cmdValue1 = 5;
      this.overlay = false;
      return;
      endpointControlRep(this.parmes);
      this.setExecNativeFunc();
    },
    setExecNativeFunc() {
      execNativeFunc("onDataChannel", {
        type: 3,
        params: {
          dataId: that.globalDataId,
          dataTypeEnum: that.globalDeviceType,
        },
      });
    },
    //绑定设备
    BindingDevice() {
      this.closepop();
      console.log("BindingDevice");
      ////若已经绑定了情景，先解绑情景，再去绑定设备，只能绑定一个，要么设备要么情景
      if (this.isBindSence) {
        let { data, error } = bindSceneRep({ endpointId: this.InitData.dataId, sceneId: -1 });
      }
      var parmes = this.InitData;
      this.overlay = false;
      this.$router.push({ name: "bingEq", query: parmes });
    },
    //绑定场景
    BindingScenario() {
      this.closepop();
      console.log("BindingScenario");
      let { data, error } = bindDeviceKxReq({
        sourceDataId: this.InitData.dataId,
        sourceDataTypeEnum: "endpoint",
        targetDataId: "-1", // -1 表示解绑
        targetDataTypeEnum: "endpoint",
      });
      //这里变成弹窗
      this.setcurEndpointId(this.InitData.dataId);
      this.overlay = false;
      this.$router.push({ name: "scenesList", query: { bindId: this.InitData.bindSceneId, slideWay: "left" } });
    },
    On() {
      console.log("On");
      this.closepop();
    },
    Off() {
      console.log("Off");
    },
    //断电记忆
    OffMemory() {
      console.log("OffMemory");
    },
    closepop() {
      console.log("closepop");
      this.isShowPopup = false;
      this.SETSATE("");
      this.overlay = false;
    },
    //绑定智能
    async goBindSetting() {
      if (![1, 5].includes(+this.onOffLine)) {
        this._showOfflineModal(0);
        return;
      }
      let { data, error } = await deviceBindSceneSwitchReq({
        dataId: this.InitData.dataId,
        dataTypeEnum: this.InitData.dataTypeEnum,
        ifSceneConvertedEnum: "yes",
      });
      this.deviceTypeCodeK5X ? this.SETSATE("Binding") : this.BindingScenario();
      //   this.$router.push({ name: "bindSetting", query: { slideWay: "left" } });
    },
    //上电状态
    goElectricity() {
      if (![1, 5].includes(+this.onOffLine)) {
        this._showOfflineModal(0);
        return;
      }
      this.SETSATE("electricity");
    },
    // 选择图标
    goIconSetting() {
      if (![1, 5].includes(+this.onOffLine)) {
        this._showOfflineModal(0);
        return;
      }
      this.$router.push({ name: "IconSetting", query: { slideWay: "left" } });
    },
    //弹出框
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
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
    },
    goBack() {
      EventBus.$emit("getData");
      this.$router.back();
    },
    // 修改名称
    goCountdownSetting() {
      if (![1, 5].includes(+this.onOffLine)) {
        this._showOfflineModal(0);
        return;
      }
      this.clickChangeName();
    },
    clickChangeName() {
      this.nameModal = true;
      //回显
      this.deviceName = this.InitData.deviceName;
      this.$nextTick(() => {
        this.forceFocus();
      });
    },
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      this.$refs.inputArea.focus();
    },
    clickCancel() {
      this.deviceName = this.InitData.deviceName;
      this.nameModal = false;
    },
    // 设置名称
    async onComfirm(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
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
      console.log(this.deviceName);
      let { data, error } = await deviceInfoUpdRep({
        dataId: this.InitData.dataId,
        dataTypeEnum: this.InitData.dataTypeEnum,
        deviceName: this.deviceName,
      });
      if (data && !error) {
        // let detail = this.deviceDetail;
        // detail.deviceName = this.deviceName;
        // this.setDeviceDetail(detail);
        // this.clickCancel();
        // execNativeFunc("onDataChannel", {
        //   type: 3,
        //   params: {
        //     dataId: this.globalDataId,
        //     dataTypeEnum: this.deviceDetail.dataTypeEnum,
        //   },
        // });
        this.nameModal = false;
        this.getData();
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
  },
};
</script>

<style scoped lang="less">
.SwitchingSystem {
  user-select: none;
  box-sizing: border-box;
  background-color: #f0f0fd;
  .title-area {
    margin-bottom: 40px;
  }
  div.title-bar {
    font-weight: 500 !important;
    font-size: 36px !important;
    div.txt {
      width: fit-content;
      margin: 0 auto;
      transform: translateX(60px);
    }
  }
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
        align-items: center;
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
  &-PoP {
    .TXT(@H,@W,@Z,@LH,@C) {
      font-family: "PingFang SC";
      font-style: normal;
      height: @H;
      font-weight: @W;
      font-size: @Z;
      line-height: @LH;
      text-align: center;
      color: @C;
    }
    .popupTotle {
      .TXT(80px,400,26px,100px,#5e5e83);
      border-bottom: 1px solid rgba(168, 166, 166, 0.5);
    }
    .popupcontent {
      .TXT(100px,500,32px,100px,#4289ff);
      border-bottom: 1px solid rgba(168, 166, 166, 0.5);
    }
    .popup {
      background: #000;
      opacity: 0.2;
      height: 30px;
    }
    .popupclose {
      .TXT(100px,400,26px,100px,#5e5e83);
    }
  }
}
.opt-slide-enter-active {
  animation: bounce-in 0.4s linear -0.18s;
}
.opt-slide-main-enter-active {
  animation: bounce-in 0.4s linear -0.15s;
}
.opt-slide-floot-enter-active {
  animation: bounce-in 0.4s linear -0.12s;
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