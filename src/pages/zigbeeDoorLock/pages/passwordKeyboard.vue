<template>
  <div class="password-keyboard">
    <title-bar @goBack="goback" :showRight="false" :secondTitle="false">
      <template v-slot:title><p class="title">输入开锁密码</p></template>
    </title-bar>
    <div class="main">
      <div class="password-area">
        <p>请输入远程开锁密码</p>
        <div class="password-list">
          <span class="password-item" :class="{ active: passwords && passwords.length >= 1 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 2 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 3 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 4 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 5 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 6 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 7 }"></span>
          <span class="password-item" :class="{ active: passwords && passwords.length >= 8 }"></span>
        </div>
      </div>
      <p class="errorTxt" v-show="getDoorErrorTimes > 0">{{ errorTxt }}，剩余{{ 5 - getDoorErrorTimes }}次机会</p>
      <div class="keyboard-area">
        <div class="keyboard">
          <div class="item" @click.stop="onInput($event, 1)">1</div>
          <div class="item" @click.stop="onInput($event, 2)">2</div>
          <div class="item" @click.stop="onInput($event, 3)">3</div>
          <div class="item" @click.stop="onInput($event, 4)">4</div>
          <div class="item" @click.stop="onInput($event, 5)">5</div>
          <div class="item" @click.stop="onInput($event, 6)">6</div>
          <div class="item" @click.stop="onInput($event, 7)">7</div>
          <div class="item" @click.stop="onInput($event, 8)">8</div>
          <div class="item" @click.stop="onInput($event, 9)">9</div>
          <div class="item clear" @click.stop="onInput($event, null)">清空</div>
          <div class="item" @click.stop="onInput($event, 0)">0</div>
          <div class="item iconfont icon-backspace" @click.stop="onInput($event, -1)" @touchstart="onBackspaceStart" @touchend="onBackspaceEnd"></div>
        </div>
        <div class="keyboard-bot">
          <div class="remember" @click="clickRemember">
            <!-- <span class="box" :class="{ active: isRemember }"></span>
            <span class="txt">12小时内记住密码</span> -->
          </div>
          <div class="btn" :class="{ active: passwords.length === 8 }">
            <img class="loading-svg" v-show="isLoading" src="../../../static/images/device/doorlock/loading.svg" />
            <div class="iconfont icon-password_arrow" v-show="!isLoading" @click="inputEnd"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBardoor";
import { execNativeFunc } from "../../../utils/bridge";
import { mapMutations, mapGetters } from "vuex";
import { checkDoorLockPswReq, deviceDetailRep } from "../../../api/request";
import { EventBus } from "../eventbus/index";
export default {
  name: "PasswordKeyboard",
  data() {
    return {
      passwords: [],
      isRemember: false,
      backspaceswaitTimer: null,
      backspacestartTimer: null,
      nextRouteWay: null,
      isLoading: false,
      errorTxt: "密码错误",
      doorTimecountTimer: null
    };
  },
  methods: {
    ...mapMutations(["setPasswordForOpen", "setDoorBlockSeconds", "setDoorErrorTimes", "setDoorErrorEndTime"]),
    goback() {
      this.$router.go(-1);
      this.passwords = [];
    },
    setCodeError() {
      this.passwords = [];
      if (this.getDoorErrorTimes >= 5) return;
      this.setDoorErrorTimes(this.getDoorErrorTimes + 1);
    },
    async inputEnd() {
      if (this.passwords.length !== 8 || this.isLoading) return;
      let params = {
        cacheSecond: this.isRemember ? 43200 : 0,
        endpointId: this.globalDataId,
        pwdValue: this.passwords.join(""),
        commPwdTypeEnum: this.nextRouteWay === "temp" ? "rootPwd" : "keyPwd" // keyPwd 用于开锁传参， rootPwd：用于创建临时密码
      };
      this.isLoading = true;
      let result = await checkDoorLockPswReq({ params });
      this.isLoading = false;
      if (result && !result.error) {
        if (this.nextRouteWay === "temp") {
          this.$router.push({ name: "TempPassword", query: { slideWay: "left" } });
        } else {
          this.setPasswordForOpen(this.passwords.join(""));
          this.goback();
        }
      } else {
        this.passwords = [];
        if (result && result.error && result.error.code) {
          this.getDetail();
          if (result.error.code === "5001") {
            this.setDoorBlockSeconds(result.error.msg);
            this.$Toast.show({ title: `门锁已停用，请${this.getDoorBlockSeconds}s后再次尝试`, postion: "middle", duration: 2500 });
            EventBus.$emit("onCodeError");
            this.goback();
          } else if (result.error.code === "665") {
            let msg = (result && result.error && result.error.msg) || "验证密码失败";
            this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
          } else if (result.error.code === "5") {
            let msg = (result && result.error && result.error.msg) || "验证密码失败";
            this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
          } else {
            this.setCodeError();
          }
        } else {
          let msg = (result && result.error && result.error.msg) || "验证密码失败";
          this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
        }
      }
    },
    onInput(e, value) {
      if (this.passwords.length >= 8 && value >= 0 && value !== null) return;
      execNativeFunc("onVibrate", 30);
      if (typeof value === "number" && value !== -1) {
        this.passwords.push(value);
      } else if (value === null) {
        this.passwords = [];
      } else if (value === -1 && this.passwords.length) {
        this.passwords.splice(-1);
      }
    },
    onBackspaceStart() {
      if (!this.passwords.length) return;
      this.backspaceswaitTimer = setTimeout(() => {
        this.backspacestartTimer = setInterval(() => {
          if (this.passwords.length) {
            execNativeFunc("onVibrate", 30);
            this.passwords.splice(-1);
          }
        }, 100);
      }, 360);
    },
    onBackspaceEnd() {
      this.backspaceswaitTimer && clearInterval(this.backspaceswaitTimer);
      this.backspacestartTimer && clearInterval(this.backspacestartTimer);
    },
    clickRemember() {
      // this.isRemember = !this.isRemember;
    },
    // 处理门锁开锁错误
    handleErrorTime() {
      let now = new Date().getTime();
      let time = this.getDoorErrorEndTime - now;
      this.doorTimecountTimer && clearTimeout(this.doorTimecountTimer);
      if (time <= 0) {
        this.setDoorErrorTimes(0);
        this.setDoorErrorEndTime(0);
        return;
      }
      if (Number(this.getDoorErrorEndTime) > 0) {
        this.doorTimecountTimer = setTimeout(() => {
          this.setDoorErrorTimes(0);
          this.setDoorErrorEndTime(0);
        }, time);
      }
    },
    async getDetail(isFirst) {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      if (result && !result.error && result.data && result.data.data) {
        let doorlock = result.data.data.doorLock;
        if (doorlock) {
          if (doorlock.blockSeconds > 0) {
            this.setDoorBlockSeconds(doorlock.blockSeconds);
            this.$Toast.show({ title: `门锁已停用，请${this.getDoorBlockSeconds}s后再次尝试`, postion: "middle", duration: 2500 });
            EventBus.$emit("onCodeError");
            isFirst && this.goback();
          } else if (doorlock.openErrorCount >= 0) {
            this.setDoorBlockSeconds(doorlock.blockSeconds);
            this.setDoorErrorTimes(doorlock.openErrorCount);
            let time = doorlock.openErrorSeconds || 0;
            time = time > 0 ? new Date().getTime() + time * 1000 : 0;
            this.setDoorErrorEndTime(time);
            this.handleErrorTime();
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(["globalDataId", "getDoorBlockSeconds", "getDoorErrorTimes", "getDoorErrorEndTime", "globalDeviceType"])
  },
  components: { TitleBar },
  activated() {
    this.nextRouteWay = this.$route.query.type;
  },
  mounted() {
    this.nextRouteWay = this.$route.query.type;
    this.getDetail(true);
  },
  beforeDestroy() {
    this.backspaceswaitTimer && clearInterval(this.backspaceswaitTimer);
    this.backspacestartTimer && clearInterval(this.backspacestartTimer);
    this.doorTimecountTimer && clearTimeout(this.doorTimecountTimer);
  }
};
</script>
<style lang="less" scoped>
.password-keyboard {
  .title {
    flex: 1;
    text-align: center;
    font-size: 40px;
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
    .password-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 42px;
      > p {
        font-size: 40px;
        font-weight: bold;
        color: #2f2f4a;
        margin-bottom: 32px;
      }
      .password-list {
        display: flex;
        align-items: center;
        justify-content: center;
        .password-item {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid rgba(47, 47, 74, 0.3);
          box-sizing: border-box;
          margin-right: 30px;
          &:last-child {
            margin-right: 0;
          }
          &.active {
            background: #2f2f4a;
            border: none;
          }
        }
      }
    }
    .errorTxt {
      text-align: center;
      font-size: 26px;
      color: #ff453a;
    }
    .keyboard-area {
      width: 100%;
      box-sizing: border-box;
      padding: 0 96px 80px;
      .keyboard {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 96px;
        .item {
          width: 146px;
          height: 146px;
          border-radius: 50px;
          text-align: center;
          line-height: 146px;
          font-size: 62px;
          color: #2f2f4a;
          background: #f3f3f3;
          margin-top: 32px;
          outline: none;
          overflow: hidden;
          -webkit-tap-highlight-color: #6165c5;
          &.clear {
            font-size: 32px;
            font-weight: bold;
          }
          &.iconfont {
            font-size: 56px;
          }
          &:active {
            color: #fff;
            background-color: #6165c5;
          }
        }
      }
      .keyboard-bot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .remember {
          display: flex;
          justify-content: center;
          align-items: center;
          .box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 8px;
            border: 2px solid #4289ff;
            position: relative;
            &.active {
              &::before {
                content: "";
                width: 16px;
                height: 16px;
                border-radius: 6px;
                background-color: #4289ff;
              }
            }
          }
          .txt {
            font-size: 28px;
            font-weight: bold;
            color: #2f2f4a;
            margin-left: 8px;
          }
        }
        .iconfont {
          font-size: 28px;
          line-height: 110px;
        }
        .btn {
          display: flex;
          align-content: center;
          justify-content: center;
          width: 145px;
          height: 110px;
          background: #6165c5;
          border-radius: 36px;
          text-align: center;
          font-size: 28px;
          color: #fff;
          opacity: 0.3;
          &.active {
            opacity: 1;
          }
        }
        .loading-svg {
          width: 60px;
          height: 60px;
          display: inline-block;
          margin-top: 25px;
          animation: roll 2s ease-in-out infinite;
        }
        @keyframes roll {
          0% {
            transform: rotate(0);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }
    }
  }
}
</style>
