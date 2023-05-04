<template>
  <div class="doorLock" :class="{ offline: !isOnLine }">
    <titleBardoor @goBack="goback" :showRight="caniUse">
      <template v-slot:title>
        <p class="title title-bar">{{ deviceDetail.deviceName || "门锁" }}</p>
      </template>
    </titleBardoor>
    <div class="main" v-if="caniUse">
      <div class="low-power" v-if="blockText">{{ blockText }}</div>
      <div class="low-power" v-else-if="doorLockElectric <= 20">电量过低，请及时充电</div>
      <div class="lock-pic">
        <div class="signal">
          <door-signal :doorStatus="isActive" />
        </div>
        <img src="../../../static/images/device/doorlock/door_close.png" v-show="!isActive" class="pic" alt="" />
        <img src="../../../static/images/device/doorlock/door_open.png" v-show="isActive" class="pic" alt="" />
        <div class="handler">
          <door-handler :doorStatus="isActive" />
        </div>
        <div class="mask" v-CDTAP="tap"></div>
      </div>
      <div class="info" v-show="isOnLine">
        <span class="iconfont icon-door_electric"></span>
        <p class="electric">
          电量
          <span class="num">{{ doorLockElectric }}</span>
          <span class="percent">%</span>
        </p>
        <p class="tips" v-show="!isActive">长按开锁</p>
      </div>
      <div class="offline-status" v-show="!isOnLine">{{ onLineValue === 0 ? "设备离线" : onLineValue === 4 ? "设备离网" : onLineValue === 7 ? "设备配置中" : "" }}</div>
      <div class="bot" :class="{ 'flex-center': !isAdmin }">
        <div class="item" @click="goTempPassword">
          <span class="iconfont icon-temp_door_key"></span>
          <span class="name">临时密码</span>
        </div>
        <div class="item" @click="goDoorLog">
          <span class="iconfont icon-door_log"></span>
          <span class="name">用锁记录</span>
        </div>
        <div class="item" v-if="isAdmin">
          <span class="iconfont icon-door_add_password" @click="goCreatePassword()"></span>
          <span class="name">新增密码</span>
        </div>
      </div>
      <div class="arc-bg">
        <div class="bg"></div>
      </div>
    </div>
    <div class="main unsupport" v-if="!caniUse">
      <img src="../../../static/images/device/doorlock/unsupport.png" alt="" />
      <p>当前版本暂不支持该功能， 请更新到最新版</p>
    </div>
    <loading-modal v-show="isDoorLoading" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="memberUnsetPasswordModal" title="温馨提示" type="one" :content="unsetPasswordContent" @on-ok="goback" />
    <Modal v-model="adminUnsetPasswordModal" title="温馨提示" :dismiss="false" :content="unsetPasswordContent" cancelText="取消" okText="确认" @on-ok="onOk" @on-cancel="goback" />
  </div>
</template>
<script>
import { CDTAP } from "../../../directive/index";
import titleBardoor from "../components/titleBardoor";
import doorHandler from "../components/doorHandler";
import doorSignal from "../components/doorSignal";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters, mapMutations } from "vuex";
import { deviceDetailRep, verifyDoorPswReq, doorControlReq } from "../../../api/request";
import Modal from "../../../components/modals/modal/Modal";
import LoadingModal from "../components/loading-modal";
import { formatMQTTData } from "../../../utils/socketUtil";
import { EventBus } from "../eventbus/index";
export default {
  name: "DoorLock",
  data() {
    return {
      isActive: false,
      isOnLine: false,
      onLineValue: 0,
      isDoorLoading: false,
      deviceDetail: {},
      isAdmin: false, // 是否是管理员
      hasSetPassword: false, // 是否已设置密码
      deviceDisableModal: false,
      deviceDisableContent: "",
      doorLockElectric: "--",
      doorLockStatus: 1, // 门锁状态 0假锁，1上锁，2未锁, 暂不处理假锁状态（2021/12/03）
      doorAutoLockTime: 0, // 自动上锁时间 如果值是65535, 表示关闭自动上锁功能。
      doorAutoLockStatus: 0, // 自动上锁时间 如果值是65535, 表示关闭自动上锁功能。
      memberUnsetPasswordModal: false, // 非管理员未设置密码弹窗
      adminUnsetPasswordModal: false, // 管理员未设置密码弹窗
      unsetPasswordContent: "请先让管理员为您创建密码", // 请先在APP上创建开锁密码
      loadingTimer: null,
      upgradeContent: "",
      upgradeModal: false,
      blockText: "",
      doorBlockTimer: null,
      doorTimecountTimer: null // 门锁如果有试错的倒计时
    };
  },
  methods: {
    ...mapMutations([
      "setDoorErrorTimes",
      "setDoorErrorEndTime",
      "setDoorAutoLockTime",
      "setLockAdmin",
      "setPasswordForOpen",
      "setCreateDoorKeyResult",
      "setGlobalMac",
      "setDeviceDetail",
      "setGlobalDeviceStatus",
      "setDoorBlockSeconds"
    ]),
    goback() {
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    onUpgradeOk() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    onUpgradeCancel() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      } else {
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
    onOk() {
      this.goCreatePassword(true);
    },
    goDoorLog() {
      this.$router.push({ name: "DoorLog", query: { slideWay: "left" } });
    },
    checkUpgrade(data) {
      // 升级流程需要梳理
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
    },
    goCreatePassword(isAdminFirst) {
      if (!this.isOnLine) {
        this._showOfflineModal();
        return;
      }
      if (isAdminFirst === true) {
        // 注意，这里需要用true去判断，避免在别的地方传入了$event属性造成判断失误
        this.$router.push({ name: "CreatePassword", query: { slideWay: "left", isAdminFirst: !!isAdminFirst } });
      } else {
        if (!this.hasSetPassword) {
          return this.showUnsetModal();
        }
        this.$router.push({ name: "CreatePassword", query: { slideWay: "left", isAdminFirst: !!isAdminFirst } });
      }
    },
    handleRender(result) {
      const data = formatMQTTData(result);
      if (!data) return;
      if (typeof data.doorLockElectric === "number") {
        this.doorLockElectric = (data.doorLockElectric / 2) | 0;
      }
      if (typeof data.doorLockStatus === "number") {
        this.doorLockStatus = data.doorLockStatus;
        this.isActive = data.doorLockStatus === 2;
        if (this.isActive && this.isDoorLoading) {
          this.setOpenDoor(false, true);
        }
      }
      if (typeof data.doorAutoLockStatus === "boolean") {
        this.doorAutoLockStatus = data.doorAutoLockStatus;
      }
      if (typeof data.doorAutoLockTime === "number") {
        this.doorAutoLockTime = data.doorAutoLockTime;
        this.setDoorAutoLockTime(data.doorAutoLockTime);
      }
      if (typeof data.isOnLine === "boolean") {
        this.isOnLine = data.isOnLine;
        if (!data.isOnLine) {
          this.isActive = false;
          this.doorLockElectric = "--";
        }
      }
      if (typeof data.onLineValue === "number") {
        this.onLineValue = data.onLineValue;
        this.setGlobalDeviceStatus(data.onLineValue);
      }
      if (typeof data.doorOprateStatus === "boolean") {
        if (this.loadingTimer) {
          let title = data.doorLockStatus ? "开锁成功" : "开锁失败";
          this.$Toast.show({ title: title, postion: "middle" });
        } else {
          let title = data.doorLockStatus ? "开锁成功" : "开锁超时";
          this.$Toast.show({ title: title, postion: "middle" });
        }
        this.isDoorLoading = false;
        this.isActive = data.doorOprateStatus;
        this.loadingTimer && clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
    },
    showUnsetModal() {
      if (!this.isAdmin) {
        this.unsetPasswordContent = "请先让管理员为您创建密码";
        this.memberUnsetPasswordModal = true;
      } else {
        this.unsetPasswordContent = "请先在APP上创建开锁密码";
        this.adminUnsetPasswordModal = true;
      }
    },
    setBlockTimer() {
      if (this.getDoorBlockSeconds <= 0) {
        this.blockText = "";
        this.doorBlockTimer && clearInterval(this.doorBlockTimer);
        return;
      }
      this.blockText = `门锁已冻结，请${this.getDoorBlockSeconds}s后再次操作`;
      this.doorBlockTimer && clearInterval(this.doorBlockTimer);
      this.doorBlockTimer = setInterval(() => {
      
        let time = this.getDoorBlockSeconds - 1;
        this.setDoorBlockSeconds(time);
        if (time <= 0) {
          this.blockText = "";
          this.doorBlockTimer && clearInterval(this.doorBlockTimer);
          return;
        }
        this.blockText = `门锁已停用，请${this.getDoorBlockSeconds}s后再次尝试`;
      }, 1000);
    },
    // 处理门锁开锁错误次数
    handleErrorTime(data) {
      let times = data.openErrorCount || 0;
      let time = data.openErrorSeconds || 0;
      this.setDoorErrorTimes(times);
      time = time > 0 ? new Date().getTime() + time * 1000 : 0;
      this.setDoorErrorEndTime(time);
      this.doorTimecountTimer && clearTimeout(this.doorTimecountTimer);
      if (Number(data.openErrorSeconds) > 0) {
        this.doorTimecountTimer = setTimeout(() => {
          if (this.getDoorErrorTimes <= 0) {
            this.doorTimecountTimer && clearTimeout(this.doorTimecountTimer);
            return;
          }
          this.setDoorErrorTimes(0);
          this.setDoorErrorEndTime(0);
        }, time * 1000);
      }
    },
    setOpenDoor(isLoading, showToast) {
      this.isDoorLoading = isLoading;
      if (showToast) {
        this.$Toast.show({ title: "开锁成功", postion: "middle" });
        this.isActive = true;
        this.loadingTimer && clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (isLoading) {
        this.loadingTimer = setTimeout(() => {
          this.isDoorLoading = false;
          this.$Toast.show({ title: "开锁超时", postion: "middle", duration: 2500 });
          this.isActive = false;
          this.loadingTimer && clearTimeout(this.loadingTimer);
          this.loadingTimer = null;
          this.getData();
        }, 30000);
      } else {
        this.loadingTimer && clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
    },
    async handleOpenDoor(password) {
      let params = { cmdKey: "lockOnOff", cmdValue1: 1, endpointId: this.globalDataId };
      if (password) {
        params.password = password;
      }
      let result = await doorControlReq(params);
      if (result && !result.error) {
        this.setOpenDoor(true);
      } else {
        let msg = (result && result.error && result.error.msg) || "开锁失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async goTempPassword() {
      if (!this.isOnLine) {
        return this._showOfflineModal();
      }
      if (!this.hasSetPassword) {
        return this.showUnsetModal();
      }
      if (this.getDoorBlockSeconds > 0) {
        return this.$Toast.show({ title: `门锁已停用，请${this.getDoorBlockSeconds}s后再次尝试`, postion: "middle" });
      }
      let needInput = await this.verifyPassword("rootPwd");
      if (needInput) {
        this.$router.push({ name: "PasswordKeyboard", query: { slideWay: "left", type: "temp" } });
      } else {
        this.$router.push({ name: "TempPassword", query: { slideWay: "left" } });
      }
    },
    async tap(isLongTap) {
      if (!this.isOnLine) {
        return this._showOfflineModal();
      }
      if (!this.hasSetPassword) {
        this.showUnsetModal();
      }
      if (this.getDoorBlockSeconds > 0) {
        return this.$Toast.show({ title: `门锁已停用，请${this.getDoorBlockSeconds}s后再次尝试`, postion: "middle" });
      }
      if (isLongTap) {
        let needInput = await this.verifyPassword("keyPwd");
        if (needInput) {
          this.$router.push({ name: "PasswordKeyboard", query: { slideWay: "left", type: "open" } });
        } else {
          this.handleOpenDoor();
        }
      }
    },
    async verifyPassword(type) {
      // commPwdTypeEnum:临时密码传 rootPwd， 开锁传keyPwd
      let result = await verifyDoorPswReq({ endpointId: this.globalDataId, commPwdTypeEnum: type });
      // false需要输入密码， true不需要输入
      return result && !result.error && result.data && !result.data.data;
    },
    async getData(isFirst) {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      if (result && !result.error && result.data && result.data.data) {
        this.setGlobalMac(result.data.data.deviceMac || "");
        this.setDeviceDetail(result.data.data);
        this.deviceDetail = result.data.data || {};
        isFirst && this.checkUpgrade(result.data.data); // 升级流程需要梳理
        this.isAdmin = result.data.data.doorLock && !!result.data.data.doorLock.ifAdmin;
        this.setLockAdmin(this.isAdmin);
        this.hasSetPassword = result.data.data.doorLock && result.data.data.doorLock.ifHasPassword;
        this.handleRender(result.data.data);
        this.handleErrorTime(result.data.data.doorLock || {});
        if (result.data.data.doorLock && typeof result.data.data.doorLock.blockSeconds === "number") {
          this.setDoorBlockSeconds(result.data.data.doorLock.blockSeconds);
          result.data.data.doorLock.blockSeconds > 0 && this.setBlockTimer();
        }
        if (!this.isOnLine) {
          this._showOfflineModal();
        } else {
          if (!this.hasSetPassword) {
            this.showUnsetModal();
          }
        }
      } else {
        this.$Toast.show({ title: "数据错误", postion: "middle" });
        setTimeout(() => {
          execNativeFunc("onNavigateTo", { type: 0 });
        }, 1000);
      }
    }, // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
    }
  },
  mounted() {
    if (this.globalAppVersion && this.globalAppVersion >= 20100) {
      this.getData(true);
    } else {
      this.isActive = true;
      this.isOnLine = true;
    }
    window.WINGTO_H5.onPageChange = data => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if (result.type == 2) {
              this.doorBlockTimer && clearTimeout(this.doorBlockTimer);
            }
            //  app回到前台
            if (result.type == 3) {
              this.getData();
            }
          }
        } catch (error) {}
      }
    };
    EventBus.$on("onCodeError", () => {
      this.setBlockTimer();
    });
  },
  directives: { CDTAP },
  activated() {
    if (this.passwordForOpen) {
      this.handleOpenDoor(this.passwordForOpen);
      this.setPasswordForOpen("");
    }
    if (this.isAddDoorKeySuccess) {
      this.$Toast.show({ title: "新增成功", postion: "middle" });
      this.setCreateDoorKeyResult(false);
      if (!this.hasSetPassword) {
        // 如果设置密码成功，则认为hasSetPassword为true
        this.hasSetPassword = true;
        this.memberUnsetPasswordModal = false;
        this.adminUnsetPasswordModal = false;
      }
      this.getData();
    }
  },
  beforeDestroy() {
    this.doorBlockTimer && clearInterval(this.doorBlockTimer);
  },
  watch: {
    globalMattData(newV, oldV) {
      for (let i = 0; i < newV.length; i++) {
        this.handleRender(newV[i]);
      }
    }
  },
  computed: {
    ...mapGetters([
      "getDoorErrorTimes",
      "globalAppVersion",
      "passwordForOpen",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "globalDeviceType",
      "isAddDoorKeySuccess",
      "getDoorBlockSeconds"
    ]),
    caniUse() {
      return this.globalAppVersion && this.globalAppVersion >= 20100;
    }
  },
  components: { titleBardoor, doorHandler, doorSignal, LoadingModal, Modal }
};
</script>
<style lang="less" scoped>
.doorLock {
  position: relative;
  height: 100vh;
  width: 100vw;
  background: #fbfbfc;
  display: flex;
  flex-direction: column;
  &.offline {
    .main {
      opacity: 0.5;
    }
  }
  .title {
    flex: 1;
    height: 88px;
    &.title-bar {
      text-align: center;
      line-height: 88px !important;
      color: #2f2f4a !important;
      font-size: 40px;
      display: inline-block;
      width: 100%;
    }
  }
  .main {
    width: 100%;
    box-sizing: border-box;
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 80px;
    &.unsupport {
      justify-content: center;
      align-items: center;
      > img {
        width: 492px;
        height: 360px;
      }
      > p {
        font-size: 28px;
        color: #2f2f4a;
        opacity: 0.6;
        margin-top: 30px;
        width: 12em;
        text-align: center;
        line-height: 40px;
      }
    }
    .low-power {
      font-size: 26px;
      color: #ff453a;
      position: absolute;
      left: 50%;
      top: 36px;
      transform: translateX(-50%);
      width: 80%;
      text-align: center;
    }
    .lock-pic {
      padding-top: 110px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      position: relative;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      .pic {
        width: 168px;
        height: 554px;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
      }
      .signal {
        position: absolute;
        width: 64px;
        height: 64px;
        left: 50%;
        top: 70px;
        transform: translate(64px);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
      }
      .handler {
        position: absolute;
        left: 50%;
        top: 413px;
        width: 182px;
        height: 48px;
        transform: translateX(-12px);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
      }
      .mask {
        position: absolute;
        left: 35%;
        right: 30%;
        top: 10%;
        bottom: 0;
        z-index: 3;
      }
    }
    .info {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 70px;
      position: relative;
      z-index: 2;
      flex: 1;
      .iconfont {
        font-size: 36px;
        color: #2f2f4a;
        opacity: 0.79;
      }
      .electric {
        font-size: 44px;
        font-weight: bold;
        color: #2f2f4a;
        vertical-align: middle;
        line-height: 1;
        margin: 10px 0;
        .percent {
          font-size: 32px;
        }
        .num {
          font-size: 64px;
          margin: 0 8px;
        }
      }
      .tips {
        font-size: 32px;
        color: #2f2f4a;
        opacity: 0.6;
      }
    }
    .offline-status {
      font-size: 44px;
      font-weight: bold;
      color: #2f2f4a;
      text-align: center;
      flex: 1;
      padding-top: 120px;
    }
    .bot {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 128px;
      box-sizing: border-box;
      position: relative;
      z-index: 2;
      &.flex-center {
        justify-content: center;
        .item {
          &:first-child {
            margin-right: 72px;
          }
        }
      }
      .item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .iconfont {
          border-radius: 40px;
          width: 100px;
          height: 100px;
          line-height: 100px;
          text-align: center;
          font-size: 54px;
          color: #2f2f4a;
          background: #ffffff;
          box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.08);
          margin-bottom: 18px;
        }
        .txt {
          font-size: 34px;
        }
        .name {
          font-size: 26px;
          color: #2f2f4a;
        }
      }
    }
    .arc-bg {
      position: absolute;
      left: 0;
      right: 0;
      width: 100vw;
      overflow: hidden;
      top: 544px;
      bottom: 0;
      z-index: 0;
      .bg {
        position: absolute;
        top: 0;
        width: 400vw;
        height: 300vw;
        border-radius: 50%;
        left: -150vw;
        background: linear-gradient(180deg, rgba(176, 177, 228, 0.13) 0%, rgba(176, 177, 228, 0) 100%);
      }
    }
  }
}
</style>
