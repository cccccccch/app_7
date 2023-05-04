<template>
  <div class="loading-mask flex-ac-jc-dc" :style="{ backgroundColor: maskColor }">
    <div class="loading-mask-outter">
      <loadingBtn :color="color" />
    </div>
  </div>
</template>
<script>
import loadingBtn from "./loading-svg.vue";
export default {
  props: {
    color: {
      type: String,
      default: "#999"
    },
    maskColor: {
      type: String,
      default: "rgba(255,255,255,0.3)"
    }
  },
  components: {
    loadingBtn
  }
};
</script>
<style lang="less" scoped>
.loading-mask {
  width: 100%;
  height: 100%;
  .loading-mask-outter {
    width: 88px;
    height: 88px;
  }
}
</style>
