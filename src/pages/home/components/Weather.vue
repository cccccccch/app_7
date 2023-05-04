<template>
  <div class="weather">
    <div class="item">
      <span class="value">{{ roomEnvironmentInfo && typeof  roomEnvironmentInfo["measureTemprature"] === 'number' && roomEnvironmentInfo["measureTemprature"] != 0 ? roomEnvironmentInfo["measureTemprature"] + " °C" : "--" }}</span>
      <span class="name">{{ !roomEnvironmentInfo.inside ? "室外温度" : "室内温度" }}</span>
    </div>
    <div class="item">
      <span class="value">{{ roomEnvironmentInfo && roomEnvironmentInfo["measureHumidity"] > 0 ? roomEnvironmentInfo["measureHumidity"] + "%" : "--" }}</span>
      <span class="name">{{ !roomEnvironmentInfo.inside ? "室外湿度" : "室内湿度" }}</span>
    </div>
    <div class="item">
      <span class="value">
        {{ roomEnvironmentInfo["vocValue"] === 1 ? "优" : roomEnvironmentInfo["vocValue"] === 2 ? "良" : roomEnvironmentInfo["vocValue"] === 3 ? "中" : roomEnvironmentInfo["vocValue"] === 4 ? "差" : "--" }}
      </span>
      <span class="name">{{ !roomEnvironmentInfo.inside ? "室外空气质量" : "室内空气质量" }}</span>
    </div>
  </div>
</template>
<script>
import { weatherRep } from "../../../api/request";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "weather",
  props: {
    roomId: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      weatherType: "now",
    };
  },
  methods: {
    ...mapActions(["getRoomEnvironmentData"]),
    getData() {
      this.getRoomEnvironmentData({ roomId: this.roomId });
    },
  },
  created() {
    this.getData();
  },
  computed: {
    ...mapGetters(["roomEnvironmentInfo"]),
  },
};
</script>
<style lang="less" scoped>
.weather {
  display: flex;
  align-items: center;
  padding-left: 36px;
  .item {
    margin-right: 60px;
    display: flex;
    flex-direction: column;
    &:last-child {
      margin-right: 0;
    }
    > span {
      line-height: 1;
    }
    .value {
      color: #fff;
      margin-bottom: 16px;
      font-size: 32px;
      font-weight: bold;
    }
    .name {
      font-size: 24px;
      font-weight: 400;
      color: #c0c0c0;
    }
  }
}
</style>
