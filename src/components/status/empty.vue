<template>
  <div class="status-empty" @click="onClick">
    <div class="hidden">
      <div class="hidden bg empty"></div>
      <div class="hidden bg netError"></div>
    </div>
    <div class="bg empty" v-show="type === 1">
      <img src="../../assets/images/empty.png" alt="" />
    </div>
    <div class="bg netError" v-show="type === 2">
      <img src="../../assets/images/network_error.png" alt="" />
    </div>
    <div class="bg no-scene" v-show="type === 3">
      <img src="../../assets/images/no_scenes.png" alt="" />
    </div>
    <p class="empty-tips">{{ tips }}</p>
  </div>
</template>
<script>
export default {
  name: "statusEmpty",
  props: {
    tips: {
      type: String,
      default: "暂时没有任何设备",
    },
    type: {
      type: Number,
      default() {
        return 1;
      },
    },
  },
  methods: {
    onClick() {
      this.$emit("on-click");
    },
  },
};
</script>
<style lang="less" scoped>
.status-empty {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  .hidden {
    height: 0;
    width: 0;
    overflow: hidden;
    opacity: 0;
  }
  .bg {
    width: 308px;
    height: 322px;
    background-size: cover;
    >img {
      width: 100%;
      height: 100%;
    }
    &.netError {
      width: 492px;
      height: 360px;
    }
    &.no-scene{
      width: 550px;
      height: 302px;
    }
  }
  > p.empty-tips {
    font-size: 32px;
    font-weight: 400;
    color: #5e5e83;
    margin-top: 36px;
    line-height: 1;
  }
}
</style>
