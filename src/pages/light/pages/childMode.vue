<template>
  <div class="child-mode">
    <title-bar @goBack="goBack" :showRight="false">
      <template v-slot:title>
        <p class="title">儿童模式</p>
      </template>
    </title-bar>
    <div class="bg" :style="{ 'background-image': `url(${bg})` }"></div>
    <div class="operate">
      <span>儿童模式</span>
      <i-switch v-model="isChildMOdeOn" @onClickSwitch="onClickSwitch" />
    </div>
    <p class="tips">“儿童模式”启用时，调节色温时会限制在4500k以下，减少灯光中蓝光比例，避免双眼收到蓝光伤害，保护视力</p>
  </div>
</template>
<script>
import TitleBar from "../../../components/titleBar";
import bg from "../../../assets/images/childmode.png";
import iSwitch from "../../../components/switch";
import { mapGetters, mapMutations } from "vuex";
import { endpointControlRep } from "../../../api/request";
export default {
  name: "child-mode",
  data() {
    return {
      bg,
      isChildMOdeOn: false,
    };
  },
  methods: {
    ...mapMutations(["setChildMode"]),
    goBack() {
      this.$router.back();
    },
    async onClickSwitch() {
      let childMode = this.isChildMOdeOn;
      let params = {
        endpointId: this.globalDataId,
        cmdKey: "set_colorTemp_min_m",
        cmdValue1: !childMode ? "154" : "222",
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.setChildMode(childMode);
        if(this.globalTemprature > 4500 && this.childMode) {
          this.handleTemprature({templature: 4500})
        }
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async handleTemprature(obj) {
      let params = {
        cmdKey: "colorTemp_set_k",
        cmdValue1: obj.templature,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
    },
  },
  mounted() {
    this.isChildMOdeOn = this.childMode;
  },
  computed: {
    ...mapGetters(["childMode", "deviceDetail", "globalDataId", "globalTemprature"]),
  },
  watch: {
    childMode(newV) {
      this.isChildMOdeOn = newV;
    },
  },
  components: {
    TitleBar,
    iSwitch,
  },
};
</script>
<style lang="less" scoped>
.child-mode {
  background: #F0F0FD;
  .title {
    font-size: 36px !important;
    font-weight: 600;
    color: #000000;
    text-align: center;
    flex: 1;
    padding-right: 40px;
  }
  .bg {
    width: 100%;
    height: 400px;
    background-size: cover;
  }
  .operate {
    background: #fff;
    height: 112px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tips {
    font-size: 24px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.6);
    line-height: 36px;
    margin-top: 32px;
    padding: 0 40px;
  }
}
</style>
