<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: Benjamin Chiu
 * @Date: 2021-07-05 16:13:57
 * @LastEditors: Benjamin Chiu
 * @LastEditTime: 2021-09-07 15:46:13
-->
<template>
  <Modal
    v-model="netStatusModal"
    title="温馨提示"
    type="one"
    :content="modalContent"
  />
</template>
<script>
import Modal from "./Modal";
import { mapGetters } from "vuex";
export default {
  name: "NetStatusErrorModal",
  components: {
    Modal,
  },
  data() {
    return {
      netStatusModal: false,
      netStatus: {
        0: "offline",
        1: "online",
        4: "offNetwork",
        5: "online",
        7: "binding",
        binding: "入网中",
        online: "在线",
        offline: "离线",
        offNetwork: "离网",
      },
      modalContent: "",
    };
  },
  computed: {
    ...mapGetters(["deviceDetail"]),
  },
  methods: {
    checkNetStatus() {
      if (this.deviceDetail.deviceStateEnum !== "online") {
        let txt = `设备${
          this.netStatus[this.deviceDetail.deviceStateEnum]
        }，暂时无法操作`;
        if (this.netStatus[this.deviceDetail.deviceStateEnum] === "入网中") {
          txt = "设置配置中，请稍等片刻";
        }
        this.modalContent = txt;
        this.netStatusModal = true;
      } else {
        this.netStatusModal = false;
      }
    }
  },
  watch: {
    // deviceDetail() {
    //   debugger
    //   this.checkUpgrade();
    // },
  },
};
</script>