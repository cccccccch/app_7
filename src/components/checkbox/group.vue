<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "CheckBoxGroup",
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  provide() {
    return { checkBoxGroup: this };
  },
  data() {
    return {
      checkBoxGroup: []
    };
  },
  methods: {
    pushItem(value) {
      if (this.checkBoxGroup && !this.checkBoxGroup.includes(value)) {
        this.checkBoxGroup.push(value);
      } else if (!this.checkBoxGroup) {
        this.checkBoxGroup = [value];
      }
      this.$emit("onChange", this.checkBoxGroup);
    },
    removeItem(value) {
      const index = this.checkBoxGroup.indexOf(value);
      this.checkBoxGroup.splice(index, 1);
      this.$emit("input", this.checkBoxGroup);
      this.$emit("onChange", this.checkBoxGroup);
    }
  },
  mounted() {
    this.$on("pushItem", this.pushItem);
    this.$on("removeItem", this.removeItem);
  },
  created() {
    this.checkBoxGroup = this.value;
  },
  watch: {
    value() {
      this.checkBoxGroup = this.value;
    }
  }
};
</script>
