<template>
  <div class="preference">
    <title-bar :showRight="false" @goBack="goback">
      <template v-slot:title><p class="title title-bar">偏好设置</p></template>
    </title-bar>
    <div class="main">
      <div class="cell">
        <div class="left">偏好点1：</div>
        <div class="right" @click="clickChangePercent(0)">
          <span class="tips name">{{ pointList[0] }}%,{{ degree[0] }}°</span>
          <!-- <span class="tips name">{{ degree[0] }}°</span> -->
          <span class="iconfont icon-right"></span>
        </div>
      </div>
      <div class="cell">
        <div class="left">偏好点2：</div>
        <div class="right" @click="clickChangePercent(1)">
          <span class="tips name">{{ pointList[1] }}%,{{ degree[1] }}°</span>
  
          <span class="iconfont icon-right"></span>
        </div>
      </div>
      <div class="cell">
        <div class="left">偏好点3：</div>
        <div class="right" @click="clickChangePercent(2)">
          <span class="tips name">{{ pointList[2] }}%,{{ degree[2] }}°</span>
   
          <span class="iconfont icon-right"></span>
        </div>
      </div>
    </div>
    <div class="device-name-modal" @touchmove.stop.prevent v-show="percentModal">
      <div class="mask"></div>
      <div class="main flex-ac-jb-dc">
        <picker pickerType="second" @onCancel="onCancelPicker" :secondList="[0, 100]" :value="percent" @onConfirm="onConfirmPicker" @onConfirm2="onConfirmPicker2" secondText="%" />
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBar";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters } from "vuex";
import picker from "../../zigbeeDoorLock/components/picker.vue";

export default {
  name: "preference",
  data() {
    return {
      percentModal: false,
      percent: 0,
      pointList: [25, 50, 75],
      degree:[0,0,0],
      modalTitle: "",
      point: 0, // 当前点击的偏好点
      degreenum:0,
    };
  },
  methods: {
    goback() {
      this.$router.back();
    },
    onCancelPicker() {
      this.percent = 0;
      this.percentModal = false;
    },
    onConfirmPicker(data) {
      this.percent = data.second;
      this.onComfirm();
    },
    onConfirmPicker2(data) {
   

      this.degreenum = data.degree;
      this.onComfirm();
    },
    clickCancel() {
      this.percentModal = false;
    },
    onComfirm() {
      this.pointList.splice(this.point, 1, Number(this.percent));
        this.degree.splice(this.point, 1, Number(this.degreenum));

      let data = { curtainPreferencePoint: this.pointList,curtaindegreearr: this.degree };
      execNativeFunc("dataSave", data);
      this.clickCancel();
    },
    onComfirm2() {
      // this.degree.splice(this.point, 1, Number(this.degreenum));
      // let data = { curtainPreferencePoint: this.pointList,curtaindegreearr: this.degree };
      // console.log('存数据',data)
      // execNativeFunc("dataSave", data);

    },
    clickChangePercent(type) {
      this.point = type;
      this.percent = this.pointList[type];
      this.percentModal = true;
    },
  },
  mounted() {
    this.pointList = this.getCurtainPreferencePoint;
    this.degree = this.getcurtaindegree;
  },
  computed: {
    ...mapGetters(["getCurtainPreferencePoint",'getcurtaindegree']),

  },
  components: {
    TitleBar,
    picker,
  },
};
</script>
<style lang="less" scoped>
.preference {
  background: #f0f0fd;
  .main {
    background: #fff;
    margin-top: 30px;
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
        font-weight: bold;
        position: relative;
        color: #2f2f4a;
      }
      .right {
        flex: 1;
        overflow: hidden;
        display: flex;
        justify-content: flex-end;
        .tips {
          line-height: 1;
          width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
          color: #5e5e83;
        }
        .icon-right {
          font-size: 28px;
          margin-left: 10px;
          color: #5e5e83;
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
      position: fixed;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      height: 550px;
      background: #fff;
      box-sizing: border-box;
      padding: 0 0 40px;
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
      .nav {
        width: 100%;
        font-size: 30px;
        font-weight: bold;
        color: #959495;
        font-size: 32px;
        .name {
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
}
</style>
