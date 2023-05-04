<template>
  <div class="status-empty" @click="reTry">
    <div class="bg">
      <img src="../../assets/images/network_error.png" alt="" />
    </div>
    <p class="empty-tips">{{ tips }}</p>
  </div>
</template>
<script>
export default {
  name: "networkError",
  props: {
    tips: {
      type: String,
      default: "网络连接失败，请点击重试",
    },
  },
  methods: {
    reTry() {
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
  .bg {
    width: 492px;
    height: 360px;
    > img {
      width: 100%;
      height: 100%;
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
