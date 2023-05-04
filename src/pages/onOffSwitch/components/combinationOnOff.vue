<template>
  <div class="combinationOnOff">
    <title-bar2 :title="itemName" optionType="light" :typeC="true" @goBack="goback" />
    <div class="combinationOnOff-box">
      <div
        class="combinationOnOff-box-item"
        @click="onExecScene(i)"
        v-CDTAP="handleLongPressForK5X"
        v-for="(item, i) in deviceDetail"
        :key="item.dataId"
        :id="i"
        :class="{ active: mData[i].isLightOn }"
      >
        <div class="combinationOnOff-box-item-img">
          <img :src="item.typeBlackIconUrlAbs" alt="" />
        </div>
        <div class="combinationOnOff-box-item-title">
          {{ item.deviceName }}
        </div>
        <div class="combinationOnOff-box-item-text" v-if="item.bindSceneId != -1">
          <p style="margin-right: 10px">已绑定 :</p>
          <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ item.bindSceneName }}</p>
        </div>
      </div>
    </div>
    <div class="combinationOnOff-middle off-line" v-if="allOnOff || onOfLine">
      {{ offLine }}
    </div>
    <div class="combinationOnOff-middle execute" v-else-if="isShow">
      <p>{{ text }}</p>
    </div>
    <div class="combinationOnOff-foolt">
      <div class="combinationOnOff-foolt-left">
        <button @click="AllClick(0)" :class="{ onOFF: allOnOff }"><i>OFF</i>全关</button>
      </div>
      <div class="combinationOnOff-foolt-right">
        <button @click="AllClick(1)" :disabled="allOnOff"><i>ON</i>全开</button>
      </div>
    </div>
    <!-- <van-popup v-model="k05show" position="bottom" :style="{ height: '230px' }" class="combinationOnOff-PoP">
      <div class="popupTotle">请选择要绑定的类型</div>
      <div class="popupcontent" @click="bindEqForK5X">绑定设备</div>
      <div class="popupcontent" @click="onNavigateToBindScene">绑定场景</div>
      <div class="popupcontent" @click="onUnbindModal">解绑</div>
      <div class="popup"></div>
      <div class="popupclose" @click="closepop">取消</div>
    </van-popup> -->
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
  </div>
</template>
<script>
import TitleBar2 from "../components/titleBar";
import Modal from "@/components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { endpointControlRep, roomDeviceRep, deviceDetailRep, execSceneRep,deviceBindSceneSwitchReq } from "@/api/request.js";
import { mapGetters, mapMutations } from "vuex";
import { formatMQTTData } from "../../../utils/socketUtil";

export default {
  name: "combinationOnOff",
  components: {
    TitleBar2,
    Modal,
  },
  directives: {
    CDTAP: {
      bind(node, binding) {
        if (!node) return;
        const el = node;
        let touchType = 0; // 0 短按， 1：长按， -1：不执行或者长按事件已经执行过
        let timer = null;
        let rect = {};
        el.addEventListener(
          "touchstart",
          function (e) {
            rect = el.getBoundingClientRect();
            touchType = 0;
            timer = setTimeout(() => {
              touchType = -1;
              binding.value(true, node.id);
              timer && clearTimeout(timer);
            }, 500);
          },
          false
        );
        el.addEventListener(
          "touchend",
          function (e) {
            const evt = e.changedTouches[0];
            const x = evt.clientX;
            const y = evt.clientY;
            if (x < rect.left || y < rect.top || x > rect.right || y > rect.bottom) {
              // 不在元素内松手，认为是取消事件
              touchType = -1;
              timer && clearTimeout(timer);
              return;
            }
            if (touchType === 1) {
              binding.value(true, node.id);
            } else if (touchType === 0) {
              binding.value(false, node.id);
            }
            touchType = 0;
            timer && clearTimeout(timer);
          },
          false
        );
        el.addEventListener(
          "touchcancel",
          function (e) {
            touchType = 0;
            timer && clearTimeout(timer);
          },
          false
        );
      },
    },
  },
  props: {
    // initData: {
    //   type:Array,
    //   default: () => [],
    // },
    // InitmData: {
    //   type: Array,
    //   default: () => [],
    // },
    itemName: {
      type: String,
      default: "",
    },
  },
  created() {
    this.getData();
    console.log(this.datas, "datas");
  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.deviceDetail, "InitmData");
    });
  },
  watch: {
    $route: {
      handler(newVal, oldVal) {
        console.log(oldVal, "oldVal");
        if (oldVal && oldVal.name === "SwitchingSystem") {
          this.getData();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      datas: [],
      mData: [],

      allOnOff: false,
      deviceDetail: [],
      onOfLine: false,
      isShow: false,
      text: "开关1执行成功",
      offLine: "离线",
      k05show: false,
      Cindex: 0,
      deviceDisableModal: false,
      deviceDisableContent: "",
      isSceneLoading: false,
    };
  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalDataId"]),
  },
  methods: {
    ...mapMutations(['setOnOffSwithDeviceStatus']),
    async getData(){
      //deviceId为52995 数组多出600 601 603
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      const res = await deviceDetailRep({ dataId: result.data.data.deviceId, dataTypeEnum: 'device' });
      let data = res.data.data.endpointList.filter((v)=>v.endpointIndex<600)
      this.setInitData(data)
    },
    async getData1() {
      let { data, error } = await roomDeviceRep({ pageSize: 999, currentPage: 1 });
      const res = data.data.filter((v) => this.globalDataId == v.dataId);
      let deviceMac = res[0].deviceMac;
      let InitData = data.data.filter((v) => deviceMac == v.deviceMac);
      let arr = [];
      // this.itemName = InitData[0].attrs[0].attrDesc.split('-')[0]
      InitData.forEach(async (v, i) => {
        let result = await deviceDetailRep({ dataId: v.dataId, dataTypeEnum: this.globalDeviceType });
        this.datas.push(result.data.data);
        if (InitData.length - 1 == i) {
          console.log("执行setInitData");
          this.setInitData(this.datas);
        }
      });
      // this.deviceDetail = arr
    },
    setInitData(item) {
      let arr = [];
      let mArr = [];
      let res = 0;
      item.forEach((v) => {
        arr[v.endpointIndex - 1] = v;
      });
      arr.forEach((v,i)=> {
        const mData = formatMQTTData(v);
        console.log(mData, "vvv");
        if(v.bindSceneId==-1){
        deviceBindSceneSwitchReq({
        dataId: v.dataId,
        dataTypeEnum: v.dataTypeEnum,
        ifSceneConvertedEnum:"no",
      }).then(data=>{
            console.log(data);
          }).catch(error=>{

          })
        }
        if (!mData.onLineValue) {
          res++;
        }
        mArr.push(mData);
      });
      this.allOnOff = res == arr.length ? true : false;
      this.mData = mArr;
      this.deviceDetail = arr;
      console.log(this.deviceDetail, "lll");
    },
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
    goback() {
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    async AllClick(index) {
      console.log(index);

      this.deviceDetail.forEach(async (v, i) => {
        let params = {
          cmdKey: index ? "open" : "close",
        };
        params.endpointId = this.deviceDetail[i].dataId;
        let { result, error } = await endpointControlRep(params);
      });
    },
    onpop() {
      this.k05show = true;
    },
    closepop() {
      this.k05show = false;
    },
    async onExecScene(inedx) {
      
      console.log(this.mData[inedx].onLineValue);
      if (![1, 5].includes(this.mData[inedx].onLineValue)) {
        this.onOfLine = true;
        return;
      }
      if (this.deviceDetail[inedx].knobeBindEndpoint) return;
      console.log("执行场景");
      if (this.isSceneLoading) return;
      this.isSceneLoading = true;
      let result
      if(this.deviceDetail[inedx].bindSceneId==-1){
        //开关 isLightOn
         result = await endpointControlRep({ cmdKey:this.mData[inedx].isLightOn?"close" : "open",endpointId:this.deviceDetail[inedx].dataId});
      }else{
        //执行情景
         result = await execSceneRep({ sceneId: this.deviceDetail[inedx].bindSceneId });
      }
      this.isSceneLoading = false;
      this.getData()
      // this.$Toast.show({ postion: "middle", title: result && result.data ? "执行成功" : "执行失败" });
      this.isShow = true
      this.text=`开关${inedx+1}${result && result.data ? "执行成功" : "执行失败"}`
    },
    // bindEqForK5X() {
    //   console.log(this.Cindex);
    // },
    // onNavigateToBindScene() {
    //   console.log(this.Cindex);
    // },
    // onUnbindModal() {
    //   console.log(this.Cindex);
    // },
    handleLongPressForK5X(isLongPress, index) {
      this.Cindex = index;
      typeof this.mData[index].onOffSwithDeviceStatus === "number"?this.setOnOffSwithDeviceStatus(this.mData[index].onOffSwithDeviceStatus):''
      let dataId = this.deviceDetail[this.Cindex].dataId;
      if (isLongPress) {
        this.$router.push({ name: "SwitchingSystem", query: { slideWay: "left", dataId } });
      }
    },
  },
};
</script>

<style scoped lang="less">
.combinationOnOff {
  user-select: none;
  width: 100%;
  height: 100%;
  background-color: #fbfbfc;
  div.title-bar {
    font-weight: 500 !important;
    font-size: 36px !important;
    div.txt {
      width: fit-content;
      margin: 0 auto;
      transform: translateX(60px);
    }
  }
  &-box {
    margin-top: 96px;
    padding: 0 64px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    &-item {
      margin-bottom: 30px;
      width: 296px;
      height: 322px;
      box-sizing: border-box;
      padding: 40px 35px;
      background: #ffffff;
      border-radius: 32px;
      box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      .TEXT(@W,@S,@C) {
        width: 100%;
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: @W;
        font-size: @S;
        color: @C;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &-img {
        width: 128px;
        height: 128px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &-title {
        text-align: center;
        margin: 16px 0;
        .TEXT(500,32px,#2f2f4a);
      }
      &-text {
        display: flex;
        .TEXT(400,28px,#5e5e83);
        line-height: normal;
      }
    }
    .active {
      box-shadow: 0px 0px 30px rgba(215, 164, 104, 0.5);
    }
  }
  .TXT(@W,@S,@C,@O) {
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: @W;
    font-size: @S;
    color: @C;
    opacity: @O;
  }
  &-middle {
    margin: 0 auto;
    text-align: center;
    margin: 64px 0 74px;
    .TXT(400,32px,#5e5e83,0.6);
    mix-blend-mode: normal;
  }
  .off-line {
    .TXT(400,40px,#FF453A,1);
  }
  &-foolt {
    display: flex;
    justify-content: space-between;
    padding: 0 64px;
    button {
      width: 240px;
      height: 96px;
      background: #ffffff;
      border: none;
      box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.04);
      border-radius: 48px;
      font-size: 26px;
      i {
        font-style: normal;
        margin-right: 16px;
        font-size: 32px;
        vertical-align: middle;
      }
    }
    .BoxShadow() {
      background: #faf7f7;
      box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12), inset -8px -8px 16px rgba(255, 255, 255, 0.978529), inset 10px 10px 18px #e3e7ed;
    }

    &-left {
      button:active {
        .BoxShadow();
      }
    }
    &-right {
      button:active {
        .BoxShadow();
      }
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
      .TXT(100px,400,26px,100px,#5e5e83);
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
.onOFF {
  background: #faf7f7 !important;
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12), inset -8px -8px 16px rgba(255, 255, 255, 0.978529), inset 10px 10px 18px #e3e7ed !important;
}
</style>