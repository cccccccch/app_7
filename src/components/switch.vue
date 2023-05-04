<template>
  <div class="switch" :class="{ active: value }" @click="clickSwitch">
    <div class="circle-btn"></div>
  </div>
</template>
<script>
export default {
  name: "i-switch",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    type:{
      type:String,
      default:"",
    }
  },
  methods: {
    clickSwitch() {
      if (this.disabled) return;
      this.$emit("input", !this.value);
      this.$emit("onClickSwitch",!this.value,this.type);
    },
  },
};
</script>
<style lang="less" scoped>
.switch {
  width: 80px;
  height: 44px;
  border-radius: 28px;
  background-color: #979797;
  box-sizing: border-box;
  padding: 2px;
  transition: all 0.2s ease-in-out;
  &.active {
    background: #6165C5;
    .circle-btn {
      transform: translateX(36px);
    }
  }
  .circle-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    transition: all 0.2s ease-in-out;
  }
}
</style>
