<template>
  <div class="wrap">
    <TitleBarRemoter title="空气检测仪" @goBack="goback" @shownote="shownote" optionType="light" />
    <div class="head">
      <img class="img" v-if="attrvalue.qualityGrade == '优'" src="../../../assets/images/testing1.png" alt="" />
      <img class="img" v-if="attrvalue.qualityGrade == '良'" src="../../../assets/images/testing2.png" alt="" />
      <img class="img" v-if="attrvalue.qualityGrade == '中'" src="../../../assets/images/testing3.png" alt="" />
      <img class="img" v-if="attrvalue.qualityGrade == '差'" src="../../../assets/images/testing4.png" alt="" />
    </div>
    <div class="conte">
      <div class="row" @click="getdeviceEchart('温度', 0)">
        <div class="title">温度℃</div>
        <div class="value">{{ attrvalue.humidity }}</div>
      </div>
      <div class="row" @click="getdeviceEchart('湿度', 0)">
        <div class="title">湿度%</div>
        <div class="value">{{ attrvalue.humidity }}</div>
      </div>
      <div class="row" @click="getdeviceEchart('PM2.5', 0)">
        <div class="title">PM2.5 μg/m³</div>
        <div class="value">{{ attrvalue.pM2 }}</div>
      </div>
    </div>
    <div class="conte">
      <div class="row2" @click="getdeviceEchart('CO2', 0)">
        <div class="title">CO2 ppm</div>
        <div class="value">{{ attrvalue.cO2 }}</div>
      </div>
      <div class="row2" @click="getdeviceEchart('TVOC', 70)">
        <div class="title">TVOC指标</div>
        <div class="value">7{{ attrvalue.tVOC }}</div>
      </div>
      <div class="row2" @click="getdeviceEchart('甲醛', 0)">
        <div class="title">甲醛 mg/m³</div>
        <div class="value">{{ attrvalue.hCHO }}</div>
      </div>
    </div>
    <div class="floor">
      <div class="head">
        <div class="lefttext">
          <div>
            {{ defaultobj.unit }}<span class="unit">{{ defaultobj.num }}</span>
          </div>
        </div>
        <div class="timetext">
          <div>{{ timetext }}</div>
        </div>
        <van-tabs v-model="activeType" type="card" @change="datechange">
          <van-tab title="日" name="d"></van-tab>
          <van-tab title="月" name="m"></van-tab>
          <van-tab title="年" name="y"></van-tab>
        </van-tabs>
      </div>
      <echart></echart>
    </div>

    <van-calendar :min-date="minDate" :show-title="false" :show-confirm="false" :row-height="40" v-model="show" @confirm="onConfirmchange" />
  </div>
</template>

<script>
import { deviceAttributeReq, ValueGradeReq, deviceAttributeValueHistoryReq, deviceDetailRep } from "../../../api/request";
import TitleBarRemoter from "../components/titleBar";
import echart from "../components/echart";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "testing",
  components: {
    TitleBarRemoter,
    echart,
  },
  data() {
    return {
      activeType: "",
      dateshow: false,
      show: false,
      date: "",
      minDate: new Date(2010, 0, 1),
      attrvalue: {},
      timetext: "",

      defaultobj: {
        unit: "温度",
        num: "26°",
      },
    };
  },
  created() {
    this.getValueGrade();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "globalDeviceStatus", "globalDeviceType"]),
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify", "setGlobalDataId", "setGlobalMac"]),
    async getData() {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });

      if (result && !result.error && result.data && result.data.data) {
        this.setGlobalMac(result.data.data.deviceMac || "");
        this.setDeviceDetail(result.data.data);
        this.setGlobalDataId({ deviceId: result.data.data.dataId });
      } else {
        this.$Toast.show({ title: "数据错误", postion: "middle" });
        setTimeout(() => {
          execNativeFunc("onNavigateTo", { type: 0 });
        }, 1000);
      }
    },
    shownote() {
      this.show = true;
    },
    formatDate(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    async onConfirmchange(date) {
      this.timetext = this.formatDate(date);
      this.activeType = "d";

      // await deviceAttributeValueHistoryReq({ deviceMac: "84-71-27-FF-FE-94-B7-DE", attrHexEnum: "TEMPERATURE", timeType: '', dateTime: this.timetext });
    },
    goback() {},

    // 上面的数据
    async getValueGrade() {
      let result = await ValueGradeReq({ deviceMac: "84-71-27-FF-FE-94-B7-DE" });

      this.attrvalue = result.data.data;
    },

    //echart图表
    async getdeviceEchart(text, num) {
      this.defaultobj.unit = text;
      this.defaultobj.num = num;
      let result2 = await deviceAttributeValueHistoryReq({ deviceMac: this.deviceDetail.deviceMac, attrHexEnum: "TEMPERATURE", timeType: this.activeType, dateTime: this.timetext });
    },
    async datechange(index) {
      if (this.activeType) {
        this.timetext = "";
        let result2 = await deviceAttributeValueHistoryReq({ deviceMac: this.deviceDetail.deviceMac, attrHexEnum: "TEMPERATURE", timeType: this.activeType, dateTime: this.timetext });
      }
    },
  },
  mounted() {
    this.getdeviceEchart("温度", 0);
  },
};
</script>

<style scoped lang='less'>
.timetext {
  line-height: 60px;
  font-size: 30px;
  width: 33%;
}
/ddep/ .van-calendar__weekday {
  font-size: 30px;
}
/deep/.van-calendar__month-title {
  font-size: 30px;
}
/deep/.van-calendar__day {
  font-size: 30px;
  margin-top: 15px;
}
/deep/.van-calendar__selected-day {
  background: #6165c5;
  border-radius: 50% 50%;
  font-size: 30px;
}
/deep/.van-calendar__header-subtitle {
  height: 80px;
  font-size: 30px;
  line-height: 80px;
}
/deep/ .van-calendar__popup.van-popup--bottom,
.van-calendar__popup.van-popup--top {
  height: 40%;
}
.wrap {
  // overflow: hidden;
  .head {
    width: 100%;
    text-align: center;
    padding-top: 20px;
    .img {
      width: 353px;
      height: 345px;
    }
  }
}

.conte {
  display: flex;
  padding: 0 40px;

  .row {
    width: 33.3%;
    text-align: center;
    margin-top: 30px;
    border-bottom: 1px solid #dddddd;
    border-right: 1px solid #dddddd;
    padding: 30px 0 30px 0;
    .title {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 36px;
      text-align: center;
      color: #9d9dab;
      margin-bottom: 20px;
    }
    .value {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 500;
      font-size: 40px;
      line-height: 150%;
      /* identical to box height, or 60px */

      text-align: center;

      color: #2f2f4a;
    }
  }
  .row2 {
    width: 33.3%;
    text-align: center;

    border-right: 1px solid #dddddd;
    padding: 30px 0 30px 0;
    .title {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 36px;
      text-align: center;
      color: #9d9dab;
      margin-bottom: 20px;
    }
    .value {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 500;
      font-size: 40px;
      line-height: 150%;
      /* identical to box height, or 60px */

      text-align: center;

      color: #2f2f4a;
    }
  }
  .row:nth-child(3) {
    border-right: none;
  }
  .row2:nth-child(3) {
    border-right: none;
  }
}
.floor {
  padding: 0 40px;
  margin-top: 20px;
  .head {
    display: flex;
    // justify-content: space-between;
    /deep/ .van-tabs--card > .van-tabs__wrap {
      height: 60px;
    }
    /deep/ .van-tabs__nav--card {
      height: 60px;
      border: none;
      margin: 0 0;
    }
    /deep/ .van-tab__text--ellipsis {
      overflow: unset;
    }
    /deep/ .van-tabs__nav--card .van-tab.van-tab--active {
      background: #6165c5;
      border-radius: 8px;
      color: #fff;
    }
    /deep/ .van-tabs__nav--card .van-tab {
      border-right: none;
      width: 80px;
      background: linear-gradient(276.21deg, #f4f4f6 0%, #f1f1f3 54.91%);

      color: #9d9dab;
    }

    .lefttext {
      text-align: left;
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 28px;
      // line-height: 150%;
      color: #2f2f4a;
      margin-top: 8px;
      width: 33%;
      .unit {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        line-height: 150%;
        color: #9d9dab;
        margin-left: 15px;
      }
    }
    .unit2 {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 150%;
      color: #9d9dab;
      margin-top: 5px;
      // margin-left: 15px;
    }
  }
}
</style>