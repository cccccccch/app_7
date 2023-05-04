<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: Benjamin Chiu
 * @Date: 2021-07-02 14:27:11
 * @LastEditors: Benjamin Chiu
 * @LastEditTime: 2021-09-07 15:51:01
-->
<template>
    <Modal
      v-model="upgradeModal"
      title="升级提醒"
      :content="upgradeContent"
      cancelText="暂不升级"
      okText="立即升级"
      @on-ok="onUpgradeOk"
      @on-cancel="onUpgradeCancel"
      :dismiss="true"
    />
</template>
<script>
import Modal from "./Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters } from "vuex";
export default {
    name: 'UpgradeModal',
    components: {
        Modal
    },
    data() {
        return {
            upgradeModal: false,
            netStatus: {
                0: "offline",
                1: "online",
                4: "offNetwork",
                5: "online",
                7: "binding",
                binding: "入网中",
                online: "在线",
                offline: "离线",
                offNetwork: "离网"
            },
            upgradeContent: "发现新版本",
        }
    },
    computed: {
        ...mapGetters([
            "deviceDetail"
          ]),
    },
    methods: {
        checkUpgrade() {
          if (
            this.deviceDetail.deviceStateEnum === "online" &&
            this.deviceDetail.ifUpgradeAble &&
            this.deviceDetail.hasNewVersion
          ) {
            if (this.deviceDetail.upgradeType === 0 || this.deviceDetail.upgradeType === 2) {
              this.upgradeContent = this.deviceDetail.versionDesc || this.upgradeContent;
              this.upgradeModal = true;
            }
          }
        },
        onUpgradeOk() {
          if(this.deviceDetail.upgradeType !== 2) {
            this.upgradeModal = false
          }
          execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
        },
        onUpgradeCancel() {
          if (this.deviceDetail.upgradeType !== 2) {
            this.upgradeModal = false;
          } else {
            execNativeFunc("onNavigateTo", { type: 0 });
          }
        }
    },
    watch: {
        // deviceDetail() {
        //     this.checkUpgrade()
        // }
    }
}
</script>