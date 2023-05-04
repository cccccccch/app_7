<template>
  <div class="subDeviceCard">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title
        ><span class="title">{{ getCurDeviceDetail.deviceName }}</span></template
      >
    </title-bar>
    <div class="main">
      <div class="box">
        <ul>
          <li>
            <label>型号</label>
            <span>{{ getCurDeviceDetail.deviceTypeCode || "-" }}</span>
          </li>
          <li>
            <label>MAC地址</label>
            <span>{{ getCurDeviceDetail.deviceMac || "-" }}</span>
          </li>
          <li>
            <label>所属网关MAC地址</label>
            <span>{{ getCurDeviceDetail.parentMac || "-" }}</span>
          </li>
          <li>
            <label>SN码</label>
            <span>{{ getCurDeviceDetail.snCode || "-" }}</span>
          </li>
          <li>
            <label>UDID</label>
            <span>{{ getCurDeviceDetail.bindUdid || "-" }}</span>
          </li>
          <li>
            <label>软件版本</label>
            <span>{{ getCurDeviceDetail.softVersion || "-" }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import titleBar from "../../../components/titleBar";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "subDeviceCard",
  data() {
    return {
      title: ""
    };
  },
  methods: {
    ...mapMutations(["setOnOffSwithDeviceStatus", "setOnOffSwitchElectrifyStatus"]),
    goBack() {
      this.$router.back();
    }
  },
  computed: {
    ...mapGetters([]),
    ...mapGetters({
      getCurDeviceDetail: "group/getCurDeviceDetail"
    })
  },
  components: {
    titleBar
  }
};
</script>
<style lang="less" scoped>
.subDeviceCard {
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
      color: #2f2f4a;
    }
  }
  .main {
    height: 100%;
    width: 100%;
    background: #f0f0fd;
    .box {
      margin: 43px 24px 0;
      border-radius: 16px;
      padding: 24px;
      background: #fff;
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80px;
        label {
          font-size: 32px;
          font-weight: bold;
          color: #2f2f4a;
          position: relative;
          white-space: nowrap;
        }

        span {
          flex: 1;
          text-align: right;
        }
      }
    }
  }
}

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
