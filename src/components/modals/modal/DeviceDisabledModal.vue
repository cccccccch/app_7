<template>
  <Modal v-model="isShow" title="温馨提示" type="one" :content="disableContent" @on-ok="onConfirm" />
</template>
<script>
import Modal from "./Modal";
import { mapGetters } from "vuex";
export default {
  name: "DeviceDisabledModal",
  components: {
    Modal
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isLightOn: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      isShow: false
    };
  },
  methods: {
    onConfirm() {
      this.isShow = false
      this.$emit('input', false)
    }
  },
  watch: {
    value(newVal) {
      this.isShow = newVal;
    }
  },
  created() {
    this.isShow = this.value;
  },
  computed: {
    ...mapGetters([  
      "globalDeviceStatus",
    ]),
    disableContent() {
      let txt = "设备未开启，暂不支持该操作";
      let num = Number(this.globalDeviceStatus);
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else if (num === 0) {
        txt = "设备离线，暂时无法操作";
      }
      return txt;
    }
  }
};
</script>