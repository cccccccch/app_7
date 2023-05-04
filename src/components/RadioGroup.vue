<template>
  <div class="">
    <slot></slot>
  </div>
</template>
<script>
export default {
  components: {},
  name: "wtRadiogroup",
  provide() {
    return { radioGroup: this };
  },
  props: {
    value: {
       type: String,
      default: "",
    },
    name: {
      type: [String, Number],
      default: "",
    },
    iconType: {
      type: String,
      default: 'circle'
    }
  },
  watch: {
    value(newVal, oldVal) { 
      this.$emit("onChange", newVal, oldVal);
    },
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {},
};
</script>
<style lang="less" scoped></style>
