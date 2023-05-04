
<template>
  <div class="wt-radio-wrapper">
    <label class="wt-radio" @click.prevent="handClick">
      <span class="wt-radio-label">
        <slot></slot>
      </span>
      <span class="wt-radio-input">
        <span  
          :class="getRadioClass"
        ></span>
        <input
          :name="name || this.radioGroup.name"
          type="radio"
          :v-model="this.label"
          class="wt-radio-original"
        />
      </span>
    </label>
  </div>
</template>
<script>
// radio可添加onselect事件
export default {
  name: "wtRadio",
  inject: {
    radioGroup: { default: "" },
  },
  props: {
    name: {
      type: String,
      default: "",
    },
    value: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: [String, Number, Boolean],
      default: "",
    },
    iconType: {
      type: String
    }
  },
  data() {
    return {};
  },
  created() {},
  computed: {
    //是否存在radioGroup
    isRadioGp() {
      return !!this.radioGroup;
    },
    isChecked() {
      //判断radio类型
      if (this.radioGroup) {
        return this.label == this.radioGroup.value;
      } else {
        return this.label === this.value;
      }
    },
    getRadioClass() {
      let type = ''
      if(this.isRadioGp) {
        type = this.radioGroup.iconType
      }
      if(this.iconType) {
        type = this.iconType
      }

      let checkCls = []
      let typeCls = []
      if(this.isChecked) {
        checkCls = type === 'right'? ['wt-radio-clicked-right-bg','wt-radio-clicked'] : ['wt-radio-clicked','wt-radio-clicked-circle-bg']
      } else {
        typeCls = type === 'right' ? [''] : ['wt-radio-inner']
      }
      return [...typeCls,...checkCls]
    }
  },
  methods: {
    handClick() {
      //发生点击事件后就把this.label发送给 父组件的radio,这样通过更新radio，
      //通过props传到子组件，触发子组件的computed，从而改变wt-radio-clicked
      if (this.isRadioGp) {
        this.radioGroup.$emit("input", this.label);
        this.$emit("onselect", this.label);
      } else {
        this.$emit("input", this.label);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.wt-radio-wrapper {
  height: 128px;
  -webkit-tap-highlight-color: transparent;
  padding-left: 40px; 
  .wt-radio {
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

    .wt-radio-inner {
      border: 1px solid #dcdfe6;
      border-radius: 100%;
      width: 46px;
      height: 46px;
      background-color: #fff;
      position: relative; 
      display: inline-block;
      box-sizing: border-box;
    } 
    .wt-radio-clicked {  
      background-size: contain;
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      border: 0;
    }

    .wt-radio-clicked-circle-bg { 
      background-image: url("../assets/svgs/radio-right.svg");
    }

    .wt-radio-clicked-right-bg {
      width: 46px;
      height: 46px;
      background-image: url("../assets/svgs/radio-right1.svg");
    }
    .wt-radio-clicked:after {
      transform: translate(-50%, -50%) scale(1);
    }
    .wt-radio-original {
      opacity: 0;
      outline: none;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
    }
  }

  &-label {
    padding-left: 12px;
  }
}
}

</style>
