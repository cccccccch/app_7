<template>
  <div class="share-password">
    <title-bar @goBack="goback" :showRight="true" :secondTitle="false">
      <template v-slot:title><p class="title">分享临时密码</p></template>
      <template v-slot:right>
        <p class="title title-bar title-del" @click="showDelModal = true">删除</p>
      </template>
    </title-bar>
    <div class="main">
      <div class="info">
        <img src="../../../static/images/device/doorlock/share_password_bg.png" alt="" />
        <p class="num">
          <span>{{ passwordData.value }}</span>
          <span class="iconfont icon-copy" @click="onCopy"></span>
        </p>
        <p class="tips">{{ passwordData.passwordName }}</p>
        <div class="cell">
          <span class="name">密码状态</span>
          <div class="right">
            <span class="active-btn" @click="handleReactive" :class="{ active: keyDetail.ifExpired === 4 && !isReacting, disable: isReacting }">{{
              keyDetail.ifExpired === 4 ? "激活" : "已激活"
            }}</span>
          </div>
        </div>
        <div class="cell">
          <div class="name">次数</div>
          <div class="txt">{{ passwordData.num === 0 ? "无限次" : "1次" }}</div>
        </div>
        <div class="cell">
          <div class="name">结束时间</div>
          <div class="txt">{{ passwordData.time }}</div>
        </div>
      </div>
      <div class="bottom" v-if="globalAppVersion >= 20200">
        <div class="btn send" @click="onSendSMS(0)"><span class="iconfont icon-message"></span> 短信发送</div>
        <div class="btn send" @click="onSendSMS(1)"><span class="iconfont icon-weixin"></span> 微信发送</div>
      </div>
    </div>
    <Modal v-model="showDelModal" title="温馨提示" content="确定删除当前密码？" cancelText="取消" okText="确认" @on-ok="onDel" @on-cancel="onCancel" />
  </div>
</template>
<script>
import TitleBar from "../components/titleBardoor";
import { mapGetters } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
import { lockKeyDetailReq, lockKeyActiveReq, delLockKeyReq } from "../../../api/request";
import Modal from "../../../components/modals/modal/Modal";
export default {
  name: "SharePassword",
  data() {
    return {
      passwordData: {},
      isReacting: false,
      queryActiveStatusTimer: null,
      keyDetail: {
        ifExpired: 4
      },
      showDelModal: false
    };
  },
  methods: {
    goback() {
      this.$router.push({ name: "DoorLock", query: { slideWay: "right" } });
    },
    onCopy() {
      let value = this.setShareText();
      let copyNode = document.createElement("input");
      copyNode.value = value;
      copyNode.className = "copyNode";
      copyNode.setAttribute("readonly", "readonly");
      document.body.appendChild(copyNode);
      copyNode.select(); // 选择对象
      const result = document.execCommand("Copy"); // 执行浏览器复制命令
      document.body.removeChild(copyNode);
      if (result) {
        this.$Toast.show({ title: "复制成功", postion: "middle", duration: 1500 });
      }
    },
    onSendSMS(type) {
      if (type === 0) {
        execNativeFunc("sendMsgToSMS", { content: this.setShareText() });
      } else if (type === 1) {
        execNativeFunc("sendMsgToWechat", { content: this.setShareText() });
      }
    },
    setShareText() {
      let year = this.passwordData.time.split(".")[0];
      let month = this.passwordData.time.split(".")[1];
      let day = this.passwordData.time.split(".")[2].split(" ")[0];
      let t = this.passwordData.time.split(".")[2].split(" ")[1];
      let n = Number(this.passwordData.num) === 1 ? "一次" : "无限次";
      let txt = `【云图智能】您的临时密码为${this.passwordData.value}，次数为${n}，有效期至${year}年${month}月${day}日${t}。请妥善保管临时密码，感谢~`;
      return txt;
    },
    onCancel() {
      this.showDelModal = false;
    },
    async onDel() {
      let result = await delLockKeyReq({ id: this.passwordData.keyId });
      if (result && !result.error) {
        this.$Toast.show({ title: "删除成功", postion: "middle" });
        this.goback();
      } else {
        let msg = (result && result.error && result.error.msg) || "删除失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async queryActiveStatus(time = 4000) {
      this.queryActiveStatusTimer && clearTimeout(this.queryActiveStatusTimer);
      let that = this;
      this.queryActiveStatusTimer = setTimeout(() => {
        lockKeyDetailReq({ id: that.passwordData.keyId }).then(result => {
          that.isReacting = false;
          if (result && !result.error) {
            that.keyDetail.ifExpired = result.data.data ? result.data.data.ifExpired : 4;
          }
        });
      }, time);
    },
    async handleReactive() {
      if (this.isReacting || this.keyDetail.ifExpired !== 4) return;
      this.isReacting = true;
      this.$Toast.show({ title: "指令已下发", postion: "middle" });
      let param = { id: this.passwordData.keyId };
      let result = await lockKeyActiveReq(param);
      if (!result || result.error) {
        this.isReacting = false;
        let msg = (result && result.error && result.error.msg) || "指令下发失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      } else {
        this.queryActiveStatus();
      }
    }
  },
  created() {
    this.passwordData = this.$route.query;
    this.queryActiveStatus(1500);
  },
  computed: {
    ...mapGetters(["globalAppVersion", "deviceDetail"])
  },
  components: { TitleBar, Modal }
};
</script>
<style lang="less" scoped>
.share-password {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  background: #f0f0fd;
  .title {
    flex: 1;
    text-align: center;
    height: 88px;
    line-height: 88px !important;
    font-size: 40px;
    &.title-del {
      font-size: 32px;
      font-weight: bold;
      color: #ff453a !important;
      padding: 0;
    }
  }
  .main {
    padding-top: 30px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    .info {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background: #fff;
      padding: 70px 0 0;
      > img {
        width: 204px;
        height: 186px;
        margin-bottom: 46px;
      }
      .num {
        height: 86px;
        line-height: 86px;
        font-size: 60px;
        font-weight: bold;
        color: #2f2f4a;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        .iconfont {
          position: absolute;
          color: #6165c5;
          font-weight: 400;
          font-size: 40px;
          width: 80px;
          text-align: center;
          right: -80px;
          top: 0;
        }
      }
      .tips {
        font-size: 32px;
        font-weight: bold;
        color: #2f2f4a;
        opacity: 0.6;
        margin-top: 12px;
        margin-bottom: 100px;
      }
    }
    .cell {
      width: 100%;
      height: 128px;
      display: flex;
      box-sizing: border-box;
      padding: 0 40px 0 52px;
      align-items: center;
      justify-content: space-between;
      color: #5e5e83;
      position: relative;
      &::after {
        position: absolute;
        bottom: 0;
        left: 52px;
        right: 0;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border: none;
        }
      }
      .name {
        font-size: 32px;
        font-weight: bold;
        color: #2f2f4a;
      }
      .txt {
        font-size: 28px;
        color: #5e5e83;
      }
      .right {
        font-size: 28px;
        color: #5e5e83;
        .active-btn {
          border-radius: 10px;
          font-size: 26px;
          color: #5e5e83;
          padding: 18px 0 18px 29px;
          &.active {
            padding: 18px 42px;
            color: #fff;
            background-color: #6165c5;
          }
          &.disable {
            padding: 18px 29px;
            background-color: #f1f1f3;
          }
        }
      }
    }
    .bottom {
      margin-bottom: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      box-sizing: border-box;
      padding: 0 40px;
      justify-content: space-between;
      margin-bottom: 30px;
      .send {
        width: 320px;
        height: 104px;
        line-height: 104px;
        color: #fff;
        border-radius: 16px;
        background: #6165c5;
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .iconfont {
        font-size: 30px;
        margin-right: 10px;
        &.icon-weixin {
          font-size: 44px;
        }
      }
    }
  }
}
</style>
