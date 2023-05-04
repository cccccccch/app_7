<template>
  <div class="device-room">
    <title-bar @goBack="goBack" :showRight="false" class="title-area">
      <template v-slot:title><span class="title">系统消息</span></template>
    </title-bar>
    <div class="main">
      <div class="box disturb m-lr-40" v-for="d in statusList" :key="d.id">
        <label for="">{{ d.typeName }}</label>
        <!-- <i-switch @onClickSwitch="onClickSwitch" :type='d.typeName' v-model="disturbEnable" /> -->
        <!-- <i-switch v-model="Rc01status[d.typeCode]" @onClickSwitch="onClickSwitch" :type='d.typeCode'/> -->
        <i-switch v-model="Rc01status[d.typeCode]" :type='d.typeCode'/>
      </div>
    </div>
    <!-- <div class="main" v-if="msg === '1'">
      <div class="box disturb m-lr-40">
        <label for="">设备相关</label>
        <i-switch v-model="disturbEnable" />
      </div>
      <div class="box disturb m-lr-40">
        <label for="">公告</label>
        <i-switch v-model="disturbEnable" />
      </div>
    </div>
    <div class="main" v-if="msg === '2'">
      <div class="box disturb m-lr-40">
        <label for="">WinBell</label>
        <i-switch v-model="disturbEnable" />
      </div>
    </div>
    <div class="main" v-if="msg === '3'">
      <div class="box disturb m-lr-40">
        <label for="">产品推广</label>
        <i-switch v-model="disturbEnable" />
      </div>
      <div class="box disturb m-lr-40">
        <label for="">关怀问候</label>
        <i-switch v-model="disturbEnable" />
      </div>
    </div> -->
  </div>
</template>
<script>
import titleBar from "../../components/titleBar";
import iSwitch from "@/components/switch";
import { mapGetters, mapMutations } from "vuex";
import { appMsgTypeTreeRc01Rep, deviceDetailRc01Rep, UpdateByDeviceRc01Req } from "../../api/request";
export default {
  name: "msgStatus",
  data() {
    return {
      disturbEnable: true,
      msg: "1",
      statusMsg: {
        disturbEnable: false, //勿扰模式
        systemMsg: false, //系统消息
        leaveMsg: false, //消息留言
        promotionMsg: false, //推广消息
      },
      appMsgTypeCode: "",
      deviceMac: "",
      statusList: [],
      Rc01status: {},
    };
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    async onClickSwitch(value, type) {
      let text = "yes";
      if (value) {
    
        text = "yes";
      } else {
   
        text = "no";
      }

      await UpdateByDeviceRc01Req({ appMsgTypeCode: type, deviceMac: this.deviceMac, ifEnableEnum: text });
      // console.log(value,'!this.value')
      
    },
  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "childMode", "globalDeviceMac"]),
  },
  created() {
    // let Rc01status = (await deviceDetailRc01Rep({ deviceMac: data.deviceMac })).data.data;
  },
  async activated() {

    this.msg = this.$route.query.msg;
    this.deviceMac = this.$route.query.deviceMac;
    this.appMsgTypeCode = this.$route.query.appMsgTypeCode;
    let request = await deviceDetailRc01Rep({ deviceMac: this.deviceMac });
    this.Rc01status = request.data.data.msgTypeEnableEnumMap;
    for (var i in this.Rc01status) {
      if (this.Rc01status[i] == "yes") {
        this.Rc01status[i] = true;
      } else {
        this.Rc01status[i] = false;
      }
    }

    let result = await appMsgTypeTreeRc01Rep({ deviceMac: this.deviceMac, appMsgTypeCode: this.appMsgTypeCode });
    this.statusList = result.data.data;

  },
  computed: {},
  components: {
    titleBar,
    iSwitch,
  },
};
</script>
<style lang="less" scoped>
.box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 20px;
}
.main {
  background: #fbfbfc;
  height: 100vh;
}

.disturb {
  padding: 20px 20px;
  border-radius: 8pt;
  background-color: #fff;
}

.switch {
  margin: 20px 0;
}
</style>
