<template>
  <div class="device-options" :class="{ active: showAnimation }">
    <transition name="opt-slide-two">
      <div class="options-normal" v-if="showAnimation">
        <p class="title">常规</p>
        <div class="cell" @click="clickCell('deviceName')">
          <div class="left">设备名称</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.deviceName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell" @click="goDeviceRoom">
          <div class="left">设备房间</div>
          <div class="right">
            <span class="tips name">{{ deviceDetail.goalDeviceRoomName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>

         <div class="cell" @click="goScenePage">
          <div class="left">场景</div>
          <div class="right" v-if="deviceDetail.ownedCount > 0">
            <span class="tips">{{ deviceDetail.ownedCount }}个</span>
            <span class="iconfont icon-right"></span>
          </div>
          <div class="right" v-else>
            <span class="tips">无</span>
          </div>
        </div>
        <div class="cell" @click="goFeedback">
          <div class="left">问题反馈</div>
          <div class="right">
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell">
          <div class="left">添加到常用设备</div>
          <div class="right ">
            <i-switch @onClickSwitch="clickUsually" v-model="isUsually" />
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-three">
      <div class="options-info" v-if="showAnimation">
        <p class="title">信息</p>
        <div class="cell">
          <div class="left">型号</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.deviceTypeCode }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">MAC地址</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.deviceMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">所属网关MAC地址</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.parentMac || "-" }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="left">SN码</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.snCode || "-" }}</span>
          </div>
        </div>
        
        <div class="cell">
          <div class="left">UDID</div>
          <div class="right">
            <span class="tips">{{ deviceDetail.bindUdid || "-" }}</span>
          </div>
        </div>
        <div class="cell" @click="goVersion">
          <div class="left" :class="{ active: deviceDetail.hasNewVersion }">
            软件版本
          </div>
          <div class="right">
            <span class="tips">V{{ deviceDetail.softVersion }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="opt-slide-four">
      <div class="del-btn" v-if="showAnimation" @click="clickDel">删除设备</div>
    </transition>
    <div
      class="device-name-modal"
      @touchmove.stop.prevent
      @click.stop="forceFocus"
      v-show="nameModal"
    >
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click.stop="clickCancel">取消</span>
          <span class="name">修改设备名称</span>
          <span class="comfirm" @click.stop="onComfirm">确定</span>
        </div>
        <div style="position: relative">
          <input
            class="input-area"
            ref="inputArea"
            v-model="deviceName"
            :maxlength="20"
            autofocus
            type="text"
          />
          <span
            class="iconfont icon-close"
            v-show="deviceName"
            @click="deviceName = ''"
          ></span>
        </div>
        <div class="tips">
          <span>支持中/英文/数字/符号</span>
          <span>{{ (deviceName && deviceName.length) || 0 }}/20</span>
        </div>
      </div>
    </div>
    <Modal
      v-model="delModal"
      title="删除设备"
      content="设备删除后将从您的家庭中移除，确定要删除吗"
      @on-ok="onDel"
    />
  </div>
</template>
<script>
import iSwitch from "@/components/switch";
import {
  deviceInfoUpdRep,
  deviceDelRep,
  endpointControlRep,
  addUsuallyRep,
  removeUsuallyRep,
} from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "@/components/modals/modal/Modal";
import { execNativeFunc } from "@/utils/bridge";
import { emojiReg } from "@/utils/reg";
export default {
  name: "DeviceOptionsFloorHeating",
  components: {
    Modal,
    iSwitch,
  },
  props: {
    isShow: {
      type: Boolean,
    },
  },
  data() {
    return {
      showAnimation: false,
      switchStatus: false,
      isUsually: false,
      nameModal: false,
      deviceName: "",
      delModal: false,
      switchTimer: 0,
    };
  },
  methods: {
    ...mapMutations(["setDeviceDetail", "setDeviceDataModify"]),
    goDeviceRoom() {
      this.$router.push({ name: "DeviceRoom", query: { slideWay: "left" } });
    },
    goVersion() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    goFeedback() {
      if (!this.deviceDetail) {
        this.$Toast.show({ title: "参数错误" });
        return;
      }
      execNativeFunc("onNavigateTo", { type: 2, data: this.deviceDetail });
    },
    goScenePage() {
      if (this.deviceDetail.ownedCount <= 0) return;
      this.$router.push({ name: "ScenePage", query: { slideWay: "left" } });
    },
    clickDel() {
      this.delModal = true;
    },
    clickChangeName() {
      this.nameModal = true;
      this.deviceName = this.deviceDetail.deviceName;
      this.$nextTick(() => {
        this.forceFocus();
      });
    },
    clickCancel() {
      this.deviceName = this.deviceDetail.deviceName;
      this.nameModal = false;
    },
    clickCell(cellName) {
      if (cellName === "deviceName") {
        this.clickChangeName();
      }
    },
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      this.$refs.inputArea.focus();
    },
    async onComfirm(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
      if (emojiReg.test(this.deviceName)) {
        this.$Toast.show({
          title: "设备名称只支持中文、英文、数字、符号",
          postion: "bottom",
        });
        this.forceFocus();
        return;
      }
      if (!this.deviceName || this.deviceName.length > 20) {
        this.$Toast.show({ title: "请输入设备名称", postion: "bottom" });
        this.forceFocus();
        return;
      }
      let { data, error } = await deviceInfoUpdRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
        deviceName: this.deviceName,
      });
      if (data && !error) {
        let detail = this.deviceDetail;
        detail.deviceName = this.deviceName;
        this.setDeviceDetail(detail);
        this.clickCancel();
        // this.setDeviceDataModify(true);
        execNativeFunc("onDataChannel", { type: 3, params: {
          dataId: this.globalDataId, 
          dataTypeEnum: this.deviceDetail.dataTypeEnum
        } }); 
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    clickUsually() {
      if (this.isUsually) {
        this.addToUsually();
      } else {
        this.removeUsually();
      }
    },
    async removeUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device",
      };
      let { data, error } = await removeUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = false;
        this.setDeviceDetail(data);
        execNativeFunc("onDataChannel", { type: 0 });
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    async addToUsually() {
      let params = {
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum || "device",
      };
      let { data, error } = await addUsuallyRep(params);
      if (data && !error) {
        let data = this.deviceDetail || {};
        data.ifMostUsed = true;
        this.setDeviceDetail(data);
        execNativeFunc("onDataChannel", { type: 0 });
      } else {
        this.isUsually = !this.isUsually;
        this.$Toast.show({ title: "设置失败" });
      }
    },
    async onDel() {
      let { data, error } = await deviceDelRep({
        dataId: this.deviceDetail.dataId,
        dataTypeEnum: this.deviceDetail.dataTypeEnum,
      });
      if (error) {
        this.$Toast.show({ title: error.msg });
      } else {
        this.$Toast.show({ title: "操作成功" });
        execNativeFunc("onDataChannel", {
          type: 4,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
          },
        });
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
  },
  mounted() {
    this.showAnimation = this.isShow;
    this.switchStatus = this.childMode;
    this.isUsually = this.deviceDetail.ifMostUsed;
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "childMode"]),
  },
  watch: {
    deviceDetail(newV) {
      if (newV) {
        this.deviceName = this.deviceDetail.deviceName;
        this.switchStatus = this.childMode;
        this.isUsually = this.deviceDetail.ifMostUsed;
      }
    },
    isShow() {
      this.showAnimation = this.isShow;
    },
  },
};
</script>
<style lang="less" scoped>
@import "../../../common/css/device-option.less"; 
</style>
