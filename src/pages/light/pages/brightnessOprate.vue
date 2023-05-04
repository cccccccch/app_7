<!--
 * @Author: Dywade
 * @Date: 2022-01-10 15:14:22
 * @LastEditTime: 2022-02-14 15:17:29
 * @LastEditors: Dywade
 * @Description: 
-->
<template>
  <div class="brightness">
    <title-bar @goBack="goBack" :showRight="false" class="titleBar">
      <template v-slot:title>
        <p class="title">{{ type === 0 ? "调光曲线" : "调光方式" }}</p>
      </template>
    </title-bar>
    <div class="main" v-show="type === 0">
      <div class="cell" @click="handleChange(0)">
        <span class="text">线性调光</span>
        <span class="iconfont icon-check1" v-show="getBrightnessCurveValue === 0"></span>
      </div>
      <div class="cell" @click="handleChange(1)">
        <span class="text">曲线调光</span>
        <span class="iconfont icon-check1" v-show="getBrightnessCurveValue === 1"></span>
      </div>
    </div>
    <div class="main" v-show="type === 1">
      <div class="cell" @click="handleChange(2)">
        <span class="text">1-10V调光</span>
        <span class="iconfont icon-check1" v-show="getBrightnessWayValue === 0"></span>
      </div>
      <div class="cell" @click="handleChange(3)">
        <span class="text">0-10V调光</span>
        <span class="iconfont icon-check1" v-show="getBrightnessWayValue === 1"></span>
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../../../components/titleBar";
import { mapGetters, mapMutations } from "vuex";
import { endpointControlRep } from "../../../api/request";
export default {
  name: "brightnessWayValue",
  data() {
    return { type: 0 };
  },
  methods: {
    ...mapMutations(["setBrightnessCurveValue", "setBrightnessWayValue"]),
    goBack() {
      this.$router.back();
    },
    async handleChange(type) {
      let key = type === 0 || type === 1 ? "set_dimm_curve" : "set_dimm_mode";
      let value = type < 2 ? type : type - 2;
      let params = {
        endpointId: this.globalDataId,
        cmdKey: key,
        cmdValue1: value
      };
      let result = await endpointControlRep(params);
      if (result && !result.error) {
        if (this.type === 0) {
          this.setBrightnessCurveValue(value);
        } else {
          this.setBrightnessWayValue(value);
        }
      }
    }
  },
  mounted() {
    this.isChildMOdeOn = this.childMode;
  },
  activated() {
    this.type = this.$route.query.type || 0;
  },
  computed: {
    ...mapGetters(["getBrightnessCurveValue", "getBrightnessWayValue", "globalDataId"])
  },
  components: {
    TitleBar
  }
};
</script>
<style lang="less" scoped>
.brightness {
  background: #f0f0fd;
  .titleBar {
    .title {
      position: absolute;
      font-size: 36px !important;
      font-weight: bold;
      color: #000000;
      text-align: center;
      flex: 1;
      left: 100px;
      right: 100px;
    }
  }
  .main {
    margin-top: 30px;
    background-color: #fff;
    .cell {
      position: relative;
      height: 128px;
      line-height: 128px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 0 40px 0 52px;
      .text {
        font-size: 32px;
        font-weight: bold;
        color: #2f2f4a;
      }
      .iconfont {
        color: #6165c5;
        font-size: 32px;
      }
      &::after {
        position: absolute;
        left: 48px;
        right: 0;
        content: " ";
        bottom: 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border-bottom: none;
        }
      }
    }
  }
}
</style>
