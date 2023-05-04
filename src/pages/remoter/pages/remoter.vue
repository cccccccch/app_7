<template>
  <div class="remoter">
    <TitleBarRemoter :title="deviceDetail.deviceName" @goBack="goback" optionType="light" />

    <!-- <div class="box main m-lr-40">
      <img src="@/static/images/device/remoter/01.png" alt="" />
    </div> -->
    <div class="box-floot">
      <div v-if="deviceDetail.zigbeeTypeEnum == 'P6Pro' || deviceDetail.zigbeeTypeEnum == 'P6' ">
        <!--        <div class="titletext">当前环境</div>-->
        <!--        <div class="onelist">-->
        <!--          <div class="list1">-->
        <!--            <div class="unit">23</div>-->
        <!--            <div class="text">温度(℃)</div>-->
        <!--          </div>-->
        <!--          <div class="list1">-->
        <!--            <div class="unit">69</div>-->
        <!--            <div class="text">湿度(%)</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="titletext">按键设置</div>
        <div class="but">
          <!--          <div class="switchtab">-->
          <!--            <div>效果灯</div>-->
          <!--            <i-switch @onClickSwitch="clickEffect" v-model="isTrunOnEffectLight" />-->
          <!--          </div>-->

          <div class="bindeq">
            <img class="img" src="../../../assets/images/bind1.png" alt="" />
            <div v-if="deviceDetail.indexBindVoList[0].bindId === -1" class="bindbut" @click="clickBindScene(deviceDetail.indexBindVoList[0].deviceIndex, deviceDetail.indexBindVoList[0].bindId)">
              <img src="../../../assets/images/bing5.png" alt="" />
              <div>点击可绑定一个智能</div>
            </div>
            <div v-else class="bindbut" @touchstart="ontouchstart(deviceDetail.indexBindVoList[0].deviceIndex, deviceDetail.indexBindVoList[0].bindId)" @touchend="ontouchend" @touchmove="ontouchmove">
              <div class="bindscene">{{ deviceDetail.indexBindVoList[0].bindName }}</div>
              <div class="bindchange">长按可换绑智能</div>
            </div>
          </div>
          <div class="bindeq">
            <img class="img" src="../../../assets/images/bind2.png" alt="" />
            <div class="bindbut" v-if="deviceDetail.indexBindVoList[1].bindId === -1" @click="clickBindScene(deviceDetail.indexBindVoList[1].deviceIndex, deviceDetail.indexBindVoList[1].bindId)">
              <img src="../../../assets/images/bing5.png" alt="" />
              <div>点击可绑定一个智能</div>
            </div>
            <div v-else class="bindbut" @touchstart="ontouchstart(deviceDetail.indexBindVoList[1].deviceIndex, deviceDetail.indexBindVoList[1].bindId)" @touchend="ontouchend" @touchmove="ontouchmove">
              <div class="bindscene">{{ deviceDetail.indexBindVoList[1].bindName }}</div>
              <div class="bindchange">长按可换绑智能</div>
            </div>
          </div>
          <div class="bindeq">
            <img class="img" src="../../../assets/images/bind3.png" alt="" />
            <div class="bindbut" v-if="deviceDetail.indexBindVoList[2].bindId === -1" @click="clickBindScene(deviceDetail.indexBindVoList[2].deviceIndex, deviceDetail.indexBindVoList[2].bindId)">
              <img src="../../../assets/images/bing5.png" alt="" />
              <div>点击可绑定一个智能</div>
            </div>
            <div v-else class="bindbut" @touchstart="ontouchstart(deviceDetail.indexBindVoList[2].deviceIndex, deviceDetail.indexBindVoList[2].bindId)" @touchend="ontouchend" @touchmove="ontouchmove">
              <div class="bindscene">{{ deviceDetail.indexBindVoList[2].bindName }}</div>
              <div class="bindchange">长按可换绑智能</div>
            </div>
          </div>
          <div class="bindeq">
            <img class="img" src="../../../assets/images/bing4.png" alt="" />
            <div class="bindbut" v-if="deviceDetail.indexBindVoList[3].bindId === -1" @click="clickBindScene(deviceDetail.indexBindVoList[3].deviceIndex, deviceDetail.indexBindVoList[3].bindId)">
              <img src="../../../assets/images/bing5.png" alt="" />
              <div>点击可绑定一个智能</div>
            </div>
            <div v-else class="bindbut" @touchstart="ontouchstart(deviceDetail.indexBindVoList[3].deviceIndex, deviceDetail.indexBindVoList[3].bindId)" @touchend="ontouchend" @touchmove="ontouchmove">
              <div class="bindscene">{{ deviceDetail.indexBindVoList[3].bindName }}</div>
              <div class="bindchange">长按可换绑智能</div>
            </div>
          </div>

          <div class="switchtab">
            <div>效果灯</div>
            <i-switch @onClickSwitch="clickEffect" v-model="isTrunOnEffectLight" />
          </div>
        </div>
      </div>
      <!-- p7 -->
      <div v-else-if="deviceDetail.zigbeeTypeEnum == 'P7'">
        <div class="titletext">按键设置</div>
        <div class="but_p7 m-lr-40">
          <div class="bindeq_p7" v-for="item in deviceDetail.indexBindVoList" :key="item.deviceIndex">
              <div class="bindbut" v-if="item.bindId == -1" @click="clickBindScene(item.deviceIndex,item.bindId)">
              <!-- <div class="bindbut" v-if="true" @click="clickBindScene(item.deviceIndex)"> -->
                <img src="../../../assets/images/bing5.png" alt="" />
                <div class="bindbut-text">点击可绑定一个智能</div>
              </div>
              <div v-else class="bindbut" @touchstart="ontouchstart(item.deviceIndex,item.bindId)" @touchend="ontouchend" @touchmove="ontouchmove">
                <div class="bindscene">{{ item.bindName }}</div>
                <div class="bindchange">长按可换绑智能</div>
              </div>
          </div>
        </div>
      </div>
      <div class="titletext">通知提醒</div>

      <div class="box disturb m-lr-40">
        <label for="">勿扰模式</label>
        <i-switch @onClickSwitch="onClickSwitch" v-model="statusMsg.disturbEnable" />
      </div>
      <div class="box m-lr-40" v-if="!statusMsg.disturbEnable">
        <div class="card m-r-20">
          <div class="icon">
            <i @click="msgchange('1')" class="iconfont">&#xe618;</i>
            <img src="@/static/images/device/remoter/setting.png" alt="" />
            <span>系统消息</span>
          </div>
          <!-- <i-switch @onClickSwitch="onClickSwitch2" v-model="statusMsg.systemMsg" /> -->
          <i-switch v-model="statusMsg.systemMsg" />
        </div>
        <div class="card m-r-20">
          <div class="icon">
            <i class="iconfont" @click="msgchange('2')">&#xe618;</i>
            <img src="@/static/images/device/remoter/notify.png" alt="" />
            <span>消息留言</span>
          </div>
          <!-- <i-switch @onClickSwitch="onClickSwitch3" v-model="statusMsg.leaveMsg" /> -->
          <i-switch v-model="statusMsg.leaveMsg" />
        </div>
        <div class="card">
          <div class="icon">
            <i class="iconfont" @click="msgchange('3')">&#xe618;</i>
            <img src="@/static/images/device/remoter/share.png" alt="" />
            <span>推广消息</span>
          </div>
          <!-- <i-switch @onClickSwitch="onClickSwitch4" v-model="statusMsg.promotionMsg" /> -->
          <i-switch v-model="statusMsg.promotionMsg" />
        </div>

        <div class="loading-wrap" v-show="isLoading">
          <loadingComp />
        </div>
      </div>
      <Modal v-model="statusData.show" title="温馨提示" type="one" :content="statusData.content" okText="确认" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

import TitleBarRemoter from "../components/titleBar";
import loadingComp from "../../../components/Loading";
import { execNativeFunc } from "../../../utils/bridge";
import { formatMQTTData } from "../../../utils/socketUtil";
import { deviceDetailRep, deviceDetailRc01Rep, UpdateByDeviceRc01Req, setDeviceAttrUrlReq } from "../../../api/request";
import iSwitch from "@/components/switch";
import { CMD_KEY } from "../../socket/cmdkey";

export default {
  name: "remoter",
  components: { TitleBarRemoter, loadingComp, iSwitch },
  data () {
    return {
      test:"a",
      isLoading: false,
      isOnLine: false,
      statusMsg: {
        disturbEnable: false, //勿扰模式
        systemMsg: false, //系统消息
        leaveMsg: false, //消息留言
        promotionMsg: false //推广消息
      },
      deviceDetail: {},
      statusData: {
        content: "",
        show: false
      },
      onLineValue: 0,
      timeOutEvent: null,
      deviceIndex: 0,
      bindSceneId: -1,
      isTrunOnEffectLight: true
    };
  },
  created () {
    this.isLoading = true;
    this.getData(true);
  },
  methods: {
    ...mapMutations(["setGlobalMac", "setDeviceDetail", "setChildMode", "setcurEndpointId"]),
    ontouchstart (val, val2) {
      this.deviceIndex = val;
      this.bindSceneId = val2;
      this.timeOutEvent = setTimeout(this.emitBindScene, 1000);
      return false;
    },
    ontouchmove () {
      clearTimeout(this.timeOutEvent);
      return false;
    },
    emitBindScene () {
      this.clickBindScene(this.deviceIndex, this.bindSceneId);
    },
    ontouchend () {
      clearTimeout(this.timeOutEvent);
      return false;
    },
    clickBindScene (val, val2) {
      console.log("val:", val, "val2:", val2);
      this.deviceIndex = val;
      this.bindSceneId = val2;
      if (!this.isOnLine) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      this.onNavigateToBindScene();
    },
    // 非在线状态弹窗
    _showOfflineModal (value) {
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
      this.statusData.content = txt;
      this.statusData.show = true;
    },
    onNavigateToBindScene () {
      //这里变成弹窗
      this.setcurEndpointId(this.deviceDetail.dataId);
      //alert(" this.deviceIndex:"+this.deviceIndex+"this.bindSceneId"+this.bindSceneId);
      console.log(" this.deviceIndex:", this.deviceIndex, "this.bindSceneId", this.bindSceneId);
      let query = { deviceIndex: this.deviceIndex, bindId: this.bindSceneId, sourceDataId: this.deviceDetail.dataId, slideWay: "left" }
      if(this.deviceDetail.zigbeeTypeEnum == 'P6Pro' || this.deviceDetail.zigbeeTypeEnum == 'P6'){
        query.roomId = this.deviceDetail.goalDeviceRoomId
      }
        this.$router.push({ name: "scenesList", query});
    },
    async onClickSwitch (value) {
      let text = "yes";
      if (value) {
        this.statusMsg.disturbEnable = true;
        text = "yes";
      } else {
        this.statusMsg.disturbEnable = false;
        text = "no";
      }
      await UpdateByDeviceRc01Req({ appMsgTypeCode: "all", deviceMac: this.globalDeviceMac, ifEnableEnum: text });
      // console.log(value,'!this.value')
    },
    async onClickSwitch2 (value) {
      let text = "yes";
      if (value) {
        this.statusMsg.systemMsg = true;
        text = "yes";
      } else {
        this.statusMsg.systemMsg = false;
        text = "no";
      }
      await UpdateByDeviceRc01Req({ appMsgTypeCode: "systemMsg", deviceMac: this.globalDeviceMac, ifEnableEnum: text });
      // console.log(value,'!this.value')
    },
    async onClickSwitch3 (value) {
      let text = "yes";
      if (value) {
        this.statusMsg.leaveMsg = true;
        text = "yes";
      } else {
        this.statusMsg.leaveMsg = false;
        text = "no";
      }
      await UpdateByDeviceRc01Req({ appMsgTypeCode: "leaveMsg", deviceMac: this.globalDeviceMac, ifEnableEnum: text });
      // console.log(value,'!this.value')
    },
    async onClickSwitch4 (value) {
      let text = "yes";
      if (value) {
        this.statusMsg.promotionMsg = true;
        text = "yes";
      } else {
        this.statusMsg.promotionMsg = false;
        text = "no";
      }
      await UpdateByDeviceRc01Req({ appMsgTypeCode: "promotionMsg", deviceMac: this.globalDeviceMac, ifEnableEnum: text });
      // console.log(value,'!this.value')
    },
    msgchange (msg) {
      this.$router.push({ name: "msgStatus", query: { msg: msg, appMsgTypeCode: msg === "1" ? "systemMsg" : msg === "2" ? "leaveMsg" : "promotionMsg", deviceMac: this.globalDeviceMac } });
    },
    checkUpgrade (data) {
      if (this.hasNoticeUpgrade) return;
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.hasNoticeUpgrade = true;
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
    },
    goback () {
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    async getData (isCheckStatus = false) {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      this.isLoading = false;
      if (result && result.data) {
        const data = result.data.data;
        this.setGlobalMac(data.deviceMac);
        this.deviceDetail = data;
        console.log(data, "RedeviceDetail");
        this.isSceneType = data.ifSceneConvertedEnum === "yes";
        const mData = formatMQTTData(data);
        this.checkUpgrade(data);
        this.isOnLine = mData.isOnLine;
        if (!mData.isOnLine && isCheckStatus) {
          this.onLineValue = mData.onLineValue;
          this._showOfflineModal(mData.onLineValue);
        }
        this.setDeviceDetail(data);
        // this.handleRender(mData);
        //let Rc01status = (await deviceDetailRc01Rep({ deviceMac: data.deviceMac })).data.data;
        let Rc01statusResult = await deviceDetailRc01Rep({ deviceMac: data.deviceMac });
        if (Rc01statusResult && Rc01statusResult.data) {
          const Rc01status = Rc01statusResult.data.data;
          if (Rc01status.msgTypeEnableEnumMap.all == "yes") {
            this.statusMsg.disturbEnable = true;
          }
          if (Rc01status.msgTypeEnableEnumMap.systemMsg == "yes") {
            this.statusMsg.systemMsg = true;
          }
          if (Rc01status.msgTypeEnableEnumMap.leaveMsg == "yes") {
            this.statusMsg.leaveMsg = true;
          }
          if (Rc01status.msgTypeEnableEnumMap.promotionMsg == "yes") {
            this.statusMsg.promotionMsg = true;
          }
        }
        this.statusMsg.disturbEnable = false;
        this.statusMsg.systemMsg = false;
        this.statusMsg.leaveMsg = false;
        this.statusMsg.promotionMsg = false;

        if (this.deviceDetail.deviceAttributeValueVoList != null && this.deviceDetail.deviceAttributeValueVoList["set_work_light_on_off"] === "1") {
          this.isTrunOnEffectLight = true; ////效果灯的状态
        } else {
          this.isTrunOnEffectLight = false;
        }
      }
    },
    async clickEffect () {
      console.log("clickEffect this.globalDataId", this.globalDataId);
      let params = {
        endpointId: this.globalDataId,
        attrKey: CMD_KEY.SET_WORK_LIGHT_ON_OFF,
        attrValue: !this.isTrunOnEffectLight ? "0" : "1"
      };
      let { data, error } = await setDeviceAttrUrlReq(params);
      if (!error) {
      } else {
        this.isTrunOnEffectLight = !this.isTrunOnEffectLight;
      }
    }
  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "childMode", "globalDeviceMac"])
  },
  //返回调用这个方法
  activated () {
    this.getData(true);
  }
};
</script>

<style lang="less" scoped>
.remoter {
  // min-height: 100vh;
  background-color: #fbfbfc;

  .titletext {
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 600;
    font-size: 36px;
    line-height: 40px;
    /* identical to box height, or 111% */
    padding-left: 40px;
    margin-bottom: 40px;
    margin-top: 40px;
    color: #000000;
  }
  .box-floot {
    background: #fbfbfc;
    height: 1650px;
    overflow: auto;
  }
  .box-bottom {
    width: 670px;

    margin-left: 40px;
  }
  .onelist {
    width: 670px;
    height: 224px;
    margin-left: 40px;
    display: flex;
    background: #ffffff;
    box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    .list1 {
      width: 50%;
      text-align: center;
      .unit {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 500;
        font-size: 80px;
        line-height: 140px;
        /* identical to box height, or 100% */

        text-align: center;

        color: #333333;
      }
      .text {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 32px;
        line-height: 48px;
        /* identical to box height, or 150% */

        text-align: center;

        color: #999999;
      }
    }
  }
  .but {
    .switchtab {
      display: flex;
      // line-height: 102px;
      margin-left: 40px;
      background: #ffffff;
      justify-content: space-between;
      box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.06);
      // border-radius: 16px;
      box-sizing: border-box;
      width: 670px;
      margin-bottom: 20px;

      padding: 30px 20px;
    }
    .bindeq {
      background: #ffffff;
      box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.06);
      border-radius: 16px;
      width: 670px;
      height: 150px;
      margin-left: 40px;
      text-align: center;
      margin-bottom: 20px;

      .img {
        float: left;
        width: 48px;
        height: 48px;
        margin-top: 60px;
        margin-left: 60px;
      }
      .bindbut {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        line-height: 24px;
        /* identical to box height, or 100% */

        text-align: center;

        color: #d2d2d2;
        .bindscene {
          font-family: "PingFang SC";
          font-style: normal;
          font-weight: 400;
          font-size: 32px;
          // line-height: 100px;
          /* identical to box height, or 100% */

          text-align: center;

          color: #424242;
          padding-top: 40px;
          padding-bottom: 30px;
        }
        img {
          width: 48px;
          height: 48px;
          margin-top: 30px;
          margin-bottom: 15px;
        }
      }
    }
  }
}
.box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.main {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  background-color: #fff;
}

.disturb {
  padding: 40px 20px;
  border-radius: 8pt;
  background-color: #fff;
  box-sizing: border-box;
}

.card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex: 1;
  border-radius: 20px;
  background-color: #fff;

  .icon {
    position: relative;

    img {
      width: 100%;
    }

    span {
      display: flex;
      justify-content: center;
      position: absolute;
      left: 0;
      bottom: 8px;
      width: 100%;
    }

    .iconfont {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 1rem;
    }
  }

  .switch {
    margin: 20px 0;
  }
}
.bgcShadow(@radius){
  user-select:none;
  background: #ffffff;
  box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.06);
  border-radius: @radius;
}
.but_p7{
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  // width: 670px;
  flex-wrap: wrap;
  .bindeq_p7{
    .bgcShadow(16px);
    width: 325px;
    height: 150px;
    // margin-left: 40px;
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    .bindbut{
        img{
          width: 40px;
          height: 40px;
          margin-bottom: 19px;
        }
        &-text{
          font-family: "PingFang SC";
          font-style: normal;
          font-size: 24px;
          color: #D2D2D2;
        }
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        line-height: 24px;
        /* identical to box height, or 100% */
        text-align: center;
        color: #d2d2d2;
        .bindscene {
          width: 260px;
          white-space: nowrap;
          overflow: hidden;
          // text-overflow: ellipsis;
          font-family: "PingFang SC";
          font-style: normal;
          font-weight: 400;
          font-size: 32px;
          text-align: center;
          color: #424242;
          padding-top: 40px;
          padding-bottom: 30px;
        }
    }
  }
}
</style>
