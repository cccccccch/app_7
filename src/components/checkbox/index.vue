<template>
  <div class="checkbox-wrapper" @click="handleClick">
    <div class="checkbox">
      <label>{{ label }}</label>
      <input type="checkbox" style="visibility: hidden" :value="isChecked"/>
      <div ref="box" v-show="isChecked" class="hook"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "CheckBox",
  props: {
    label: {
      type: String
    },
    value: {
      type: [String,Number]
    }
  },
  inject: {
    checkBoxGroup: { default: [] },
  }, 
  computed: {
    isChecked() { 
        if( this.checkBoxGroup && this.checkBoxGroup.checkBoxGroup instanceof Array) {
        return this.checkBoxGroup.checkBoxGroup.includes(this.value)
        }
        return false
    }
  },  
  methods: {
    handleClick() {
        const isChecked = !this.isChecked 
      if (isChecked) {
        this.$parent.$emit("pushItem", this.value);
      } else {
        this.$parent.$emit("removeItem", this.value);
      }
      this.$emit("input", isChecked);
    }
  }
};
</script>
<style lang="less" scoped>
.checkbox-wrapper {
  height: 128px;
  -webkit-tap-highlight-color: transparent;
  padding-left: 40px;
  .checkbox {
    border-bottom: 2px rgba(0, 0, 0, 0.05) solid;
    height: 100%;
    width: 100%;
    font-weight: 500;
    line-height: 1;
    position: relative;
    display: flex;
    align-items: center;
    white-space: nowrap;
    justify-content: space-between;
    outline: none;
    font-size: 32px;

    font-weight: 500;
    line-height: 48px;
    color: #2f2f4a;
    &-input {
      white-space: nowrap;
      outline: none;
      display: inline-block;
      line-height: 1;
      position: relative;
      vertical-align: middle;
      width: 46px;
      height: 46px;
      margin-right: 40px;
    }
    label {
      padding-left: 12px;
    }
    .hook {
      background-size: contain;
      z-index: 1;

      margin-right: 40px;
      border: 0;
      width: 46px;
      height: 46px;
      background-image: url("../../assets/svgs/radio-right1.svg");
    }
  }
}
</style>
