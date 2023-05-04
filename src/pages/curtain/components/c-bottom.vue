<template>
  <div class="c-bottom" :class="{ disable: disable }">
    <div class="bot-item">
      <template v-if="curtainType !== 1 && curtainType !== 9">
        <span class="iconfont icon-down" @click="handleMove('down')"></span>
        <span class="txt">下降</span>
      </template>
      <template v-else-if="curtainType === 1">
        <span class="iconfont icon-up" @click="handleMove('up')"></span>
        <span class="txt">上升</span>
      </template>
      <template v-else-if="curtainType === 9">
        <!-- <span class="iconfont icon-down" @click="handleMove('down')"></span> -->
        <div class="arrow" @click="handleMove('down')"><van-icon name="arrow" size="15" />|<van-icon size="15" name="arrow-left" /></div>

        <span class="txt">全关</span>
      </template>
    </div>
    <div class="bot-item center">
    <span class="iconfont icon-pause" @click="handleMove('pause')"></span>
    </div>
    <div class="bot-item">
      <template v-if="curtainType !== 1 && curtainType !== 9">
        <span class="iconfont icon-up" @click="handleMove('up')"></span>
        <span class="txt">上升</span>
      </template>
      <template v-else-if="curtainType === 1">
        <span class="iconfont icon-down" @click="handleMove('down')"></span>
        <span class="txt">下降</span>
      </template>
      <template v-else-if="curtainType === 9">
        <div class="arrow" @click="handleMove('up')"><van-icon name="arrow-left" size="15" />|<van-icon size="15" name="arrow" /></div>
        <span class="txt">全开</span>
      </template>
    </div>
  </div>
</template>
<script>
import { endpointControlRep } from "../../../api/request";
import { mapGetters } from "vuex";
export default {
  name: "c-bottom",
  props: {
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  methods: {
    async handleMove(type) {
      this.$emit("onCurtainMove", type);
      if (this.disable) return;
      let params = {
        cmdKey: type === "up" ? "windowCoveringUp" : type === "down" ? "windowCoveringDown" : "windowCoveringStop",
        endpointId: this.globalDataId,
      };
      //   EXTERNAL_ROLLER_BLIND: 0, // 卷帘
      // EXTERNAL_CURTAIN: 1, // 幕布
      // EXTERNAL_SHANGRI_LA_CURTAIN: 2, // 香格里拉帘
      // EXTERNAL_VENETAIN_BLIND: 3, // 百叶帘
      // EXTERNAL_ROMAN_SHADE: 4, // 罗马帘
      // EXTERNAL_ZEBRA_CURTAIN: 5, // 斑马帘
      // EXTERNAL_ZONEYCOMD_BLINDS: 6 // 蜂巢帘
      // || this.getCurtainRunWay === 1
      if (this.curtainType === 1) {
        // 幕布方向相反
        params.cmdKey = type === "up" ? "windowCoveringDown" : type === "down" ? "windowCoveringUp" : "windowCoveringStop";
      }
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "操作失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
  },
  computed: {
    ...mapGetters(["globalDataId", "getCurtainTypeCodes", "deviceDetail", "getCurtainRunWay"]),
    curtainType() {
      let has =
        this.deviceDetail &&
        this.deviceDetail.deviceBindInfoVoList &&
        this.deviceDetail.deviceBindInfoVoList[0] &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList[0]; 
      return !has ? 0 : this.getCurtainTypeCodes[has["typeCode"]];
    },
  },
};
</script>
<style lang="less" scoped>
.arrow {
  width: 13.33333vw;
  height: 13.33333vw;
  background: #ffffff;
  box-shadow: 0px 1px 1.33333vw 0px rgb(0 0 0 / 4%);
  border-radius: 5.33333vw;
  text-align: center;
  line-height: 13.33333vw;
  // font-size: 6.66667vw;
  color: #2f2f4a;
  /deep/.van-icon {
    top: 1px;
  }
}
.c-bottom {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.disable {
    .bot-item {
      &.center {
        background: #c0c0cd;
      }
      .iconfont,
      .txt {
        color: #c0c0cd;
      }
    }
  }
  .bot-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    &.center {
      width: 140px;
      height: 140px;
      background: #6165c5;
      border-radius: 50%;
      &:active {
        opacity: 0.8;
      }
      .iconfont {
        color: #fff;
        background: transparent;
        height: 140px;
        line-height: 140px;
        font-size: 70px;
      }
    }
    .iconfont {
      font-size: 30px;
      width: 100px;
      height: 100px;
      background: #ffffff;
      box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.04);
      border-radius: 40px;
      text-align: center;
      line-height: 100px;
      font-size: 50px;
      color: #2f2f4a;
      &:active {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }
    .txt {
      margin-top: 24px;
      font-size: 26px;
      color: #2f2f4a;
    }
  }
}
</style>
