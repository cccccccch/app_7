<template>
  <div class="wrap">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">参数校准</span></template>
    </title-bar>
    <div class="bodyrows">
      <div class="rows">
        <div class="Subtitle">温度 ℃</div>
        <van-stepper min="-10" max="10"   v-model="value"  @change='setAttribute'/>
      </div>
      <div class="rows">
        <div class="Subtitle">湿度 %</div>
        <van-stepper min="-20" max="20" v-model="value"  @change='setAttribute' />
      </div>
      <div class="rows">
        <div class="Subtitle">PM2.5 UG/m³</div>
        <van-stepper min="-50" max="50" step="10"  @change='setAttribute' v-model="value" />
      </div>
      <div class="rows">
        <div class="Subtitle">CO2 ppm</div>
        <van-stepper min="-500" max="500" step="10"  @change='setAttribute' v-model="value" />
      </div>
      <div class="rows">
        <div class="Subtitle">TVOC指标</div>
        <div class="value">50</div>
        <div class="floor">校准</div>
      </div>
      <div class="rows">
        <div class="Subtitle">甲醛 mg/m³</div>
        <van-stepper min="-0.05" max="0.05" step="0.01"  @change='setAttribute' v-model="value" />
      </div>
    </div>
  </div>
</template>

<script>
import titleBar from "@/components/titleBar";
import { deviceAttributeReq} from "../../../api/request";
export default {
  components: { titleBar },
  data() {
    return {
      value: 1,
    };
  },
  created() {},
  methods: {
    goBack() {},
    setAttribute(){

    },
        //校准
    async getDeviceAttributeValue() {
      let result2 = await deviceAttributeReq({ deviceMac: "84-71-27-FF-FE-94-B7-DE" });
      console.log(result2);
    },
  },
};
</script>

<style scoped lang="less" >
/deep/ .van-stepper__plus {
  width: 40px;
  height: 40px;
  background: unset;
}
/deep/ .van-stepper__minus,
.van-stepper__plus {
  width: 40px;
  height: 40px;
  background: unset;
}
/deep/ .van-stepper__input {
  margin-right: 20px;
  margin-left: 20px;
  width: 110px;
  height: 50px;
  background: unset;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 500;
  font-size: 40px;
  line-height: 150%;
  text-align: center;
  color: #2f2f4a;
}
.wrap {
  display: flex;
  background: rgba(240, 240, 253);
  .bodyrows {
    display: flex;
    flex-wrap: wrap;
    padding-left: 7px;
    // padding: 40px 0px 40px 40px;
    // justify-content: space-between;
  }
  .rows {
    width: 320px;
    height: 200px;
    text-align: center;
    // padding:40px 40px;
    margin: 40px 0 0 33px;
    box-sizing: border-box;

    background: #ffffff;
    border-radius: 20px;
    .value {
      color: #2f2f4a;
      font-size: 40px;
    }
    .Subtitle {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 90px;
      /* identical to box height, or 150% */

      text-align: center;

      color: #9d9dab;
    }
    .floor {
      // float: bottom;
      width: 100%;
      bottom: 0;
      float: left;
      background: #6165c5;
      height: 50px;
      color: #ffffff;
      line-height: 50px;
        border-radius:0 0 20px 20px;
        font-size: 28px;
        margin-top: 14px;
    }
  }
}
.title-area {
  position: relative;
  flex: 0 0 88px;
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 36px;
    font-weight: bold;
    color: #2f2f4a;
  }
}
</style>