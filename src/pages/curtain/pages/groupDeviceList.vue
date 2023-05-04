<template>
  <div class="device-group">
    <title-bar @goBack="goback" :showRight="false">
      <template v-slot:title>
        <p class="title">{{ detail.deviceName }}</p>
      </template>
    </title-bar>
    <div class="card">
      <div class="options-info">
        <div class="cell">
          <div class="left">型号</div>
          <div class="right">
            <span class="tips">{{ detail.deviceTypeCode }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">MAC地址</div>
          <div class="right">
            <span class="tips">{{ detail.deviceMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">所属网关MAC地址</div>
          <div class="right">
            <span class="tips">{{ detail.parentMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">SN码</div>
          <div class="right">
            <span class="tips">{{ detail.snCode || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">UDID</div>
          <div class="right">
            <span class="tips">{{ detail.bindUdid || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">软件版本</div>
          <div class="right">
            <span class="tips">V{{ detail.softVersion }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import titleBar from "../../../components/titleBar";
import { deviceDetailRep } from "../../../api/request";
export default {
  name: "groupDeviceList",
  data() {
    return {
      detail: {},
      dataId: "",
      dataTypeEnum: "endpoint"
    };
  },
  methods: {
    goback() {
      this.$router.back();
    },
    async getData() {
      let params = { dataId: this.dataId, dataTypeEnum: this.dataTypeEnum };
      let { data, error } = await deviceDetailRep(params);
      if (data && !error) {
        this.detail = data.data;
      }
    }
  },
  created() {
    this.dataId = this.$route.query.dataId || {};
    this.dataTypeEnum = this.$route.query.dataTypeEnum || "endpoint";
    this.getData();
  },
  components: { titleBar }
};
</script>
<style lang="less" scoped>
.device-group {
  width: 100vw;
  height: 100vh;
  background: #fbfbfc;
  box-sizing: border-box;
  .card {
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    padding: 40px;
  }
}
.options-info {
  width: 100%;
  background: #fff;
  box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  text-align: left;
  margin-bottom: 40px;
  box-sizing: border-box;
  padding: 40px 24px 8px;
  .cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 96px;
    .left {
      font-size: 32px;
      font-weight: 400;
      color: #000000;
    }
    .right {
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .tips {
        line-height: 1;
        color: #797979;
        max-width: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>
