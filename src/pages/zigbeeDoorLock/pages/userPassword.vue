<template>
  <div class="user-password">
    <title-bar @goBack="goback" :showRight="keyType === 'temp'" :secondTitle="false">
      <template v-slot:title>
        <p class="title title-bar">{{ keyType === "normal" ? "普通密码" : keyType === "doorkey" ? "门卡密码" : keyType === "finger" ? "指纹密码" : "临时密码" }}</p>
      </template>
      <template v-slot:right>
        <p class="title title-bar title-del" @click="showDelModal = true">删除</p>
      </template>
    </title-bar>
    <div class="main">
      <div class="info">
        <div class="avatar ">
          <span class="iconfont icon-lock_num" v-show="!keyDetail.loadAvatar && keyDetail.createUserId === 9 && !keyDetail.bindUserId"></span>
          <img :src="keyDetail.userPicAbs" @load="onAvatarLoad(keyDetail, true)" v-show="!!keyDetail.loadAvatar" class="pic" alt="" />
          <img :src="defaultAvatar" v-show="!keyDetail.loadAvatar && (keyDetail.createUserId !== 9 || keyDetail.bindUserId)" class="pic" alt="" />
        </div>
        <div class="cell" v-show="keyDetail.createUserId !== 9" @click="onChangePwd">
          <span class="title">{{ keyType !== "temp" ? "密码" : "临时密码" }}</span>
          <div class="right">
            <span class="txt">{{ keyDetail.pwdValue }}</span>
            <span class="iconfont icon-right" v-if="keyType === 'normal'"></span>
          </div>
        </div>
        <div class="cell">
          <span class="title">密码状态</span>
          <div class="right">
            <span class="active-btn" @click="handleReactive" :class="{ active: keyDetail.ifExpired === 4 && !isReacting, disable: isReacting }">{{
              keyDetail.ifExpired === 4 ? "激活" : "已激活"
            }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType !== 'temp'">
          <span class="title">关联用户</span>
          <div class="right" @click="goLinkUser(keyDetail)">
            <span class="txt">{{ keyDetail.bindUserName || "未关联" }}</span>
            <span class="iconfont icon-right" v-if="getLockAdmin && keyDetail.bindUserId !== 9"></span>
          </div>
        </div>
        <div class="cell" v-show="keyType === 'temp'">
          <span class="title">次数</span>
          <div class="right">
            <span class="txt">{{ keyDetail.limitCount === -1 ? "无限次" : "一次" }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType !== 'temp'">
          <span class="title">用户类型</span>
          <div class="right">
            <span class="txt">{{ keyDetail.bindUserId === 9 ? "管理员" : "普通用户" }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType !== 'temp'">
          <span class="title">创建途径</span>
          <div class="right">
            <span class="txt">{{ keyDetail.createUserId === 9 ? "门锁创建" : "APP创建" }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType === 'normal'">
          <span class="title">创建时间</span>
          <div class="right">
            <span class="txt">{{ keyDetail.createTime | fTime }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType === 'temp'">
          <span class="title">结束时间</span>
          <div class="right">
            <span class="txt">{{ keyDetail.effectTimeEnd | fTime }}</span>
          </div>
        </div>
        <div class="cell" v-if="keyType === 'temp'">
          <span class="title">创建者</span>
          <div class="right">
            <span class="txt">{{ keyDetail.createUserName || "-" }}</span>
          </div>
        </div>
        <div class="cell" v-if="(keyType === 'normal' && keyDetail.createUserId !== 9) || keyType === 'temp'" @click="disRemark(keyDetail.keyName)">
          <span class="title">备注名</span>
          <div class="right">
            <span class="txt">{{ keyDetail.keyName }}</span>
            <span class="iconfont icon-right"></span>
          </div>
        </div>
        <div class="cell">
          <span class="title">编号</span>
          <div class="right">
            <span class="txt">{{ keyDetail.hxjKeyId }}</span>
          </div>
        </div>
      </div>
      <div class="bottom" :class="{ between: keyType === 'temp' }">
        <div class="btn del" v-if="keyType === 'normal' && keyDetail.bindUserId && keyDetail.bindUserId !== 9 && keyDetail.createUserId !== 9" @click="clickDel">删除</div>
        <div class="btn send" v-if="keyType === 'temp' && globalAppVersion >= 20200" @click="onSendSMS(0)"><span class="iconfont icon-message"></span>短信发送</div>
        <div class="btn send" v-if="keyType === 'temp' && globalAppVersion >= 20200" @click="onSendSMS(1)"><span class="iconfont icon-weixin"></span>微信发送</div>
      </div>
    </div>
    <!-- 修改密码弹窗 -->
    <div class="change-password" v-show="changePwdModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click="clickCancel">取消</span>
          <span class="name">修改密码</span>
          <span class="comfirm" @click="onComfirm">确定</span>
        </div>
        <div style="position:relative">
          <input type="number" class="input-area" ref="number" :value="password" @input="onPassword" @keyup="onKeyUp" autofocus @blur="onBlur" placeholder="请输入8位数字密码" />
        </div>
      </div>
    </div>
    <!-- 修改备注弹窗 -->
    <div class="change-password" v-show="changeRemarkModal">
      <div class="mask"></div>
      <div class="main">
        <div class="nav">
          <span class="cancel" @click="disRemark">取消</span>
          <span class="name">修改备注</span>
          <span class="comfirm" @click="setRemark">确定</span>
        </div>
        <div style="position:relative">
          <input type="name" class="input-area" ref="name" v-model="keyDetail.name" autofocus />
        </div>
      </div>
    </div>
    <Modal v-model="showDelModal" title="温馨提示" content="确定删除当前密码？" cancelText="取消" okText="确认" @on-ok="onDel" @on-cancel="onCancel" />
    <Modal v-model="showUnBindModal" title="温馨提示" content="当前用户已关联，是否要解绑？" cancelText="取消" okText="确认" @on-ok="onUnbindUser" @on-cancel="showUnBindModal = false" />
  </div>
</template>
<script>
import TitleBar from "../components/titleBardoor";
import { lockKeyDetailReq, delLockKeyReq, lockKeyUpdReq, lockKeyActiveReq } from "../../../api/request";
import { mapMutations, mapGetters } from "vuex";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import defaultAvatar from "../../../static/images/default_avatar.png";
export default {
  name: "UserPassword",
  data() {
    return {
      defaultAvatar: defaultAvatar,
      keyType: "",
      keyId: "",
      keyDetail: {name:""},
      showDelModal: false,
      changePwdModal: false,
      changeRemarkModal: false,
      password: "",
      isReacting: false,
      queryActiveStatusTimer: null,
      showUnBindModal: false
    };
  },
  methods: {
    ...mapMutations(["setChangeLinkUser"]),
    goback() {
      this.$router.back(-1);
      // console.log('1223333333333333')
        //  this.$router.push({ name: "AuthManagement", query: { slideWay: "left" } });
    },
    clickCancel() {
      this.password = this.keyDetail.pwdValue;
      this.changePwdModal = false;
    },
    async onComfirm() {
      if (this.password.length !== 8) {
        this.$Toast.show({ title: "请输入8位数字密码", postion: "bottom" });
        return;
      }
      this.isReacting = true;
      let result = await lockKeyUpdReq({ id: this.keyId, ifForce: 0, pwdValue: this.password });
      if (result && !result.error) {
        this.$Toast.show({ title: "修改成功，请等待写入门锁", postion: "middle" });
        this.changePwdModal = false;
        this.keyDetail.pwdValue = this.password;
        this.keyDetail.ifExpired = 4;
        this.queryActiveStatus();
      } else {
        this.isReacting = false;
        let msg = (result && result.error && result.error.msg) || "修改失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    onPassword(e) {
      let data = e.data;
      if (
        data !== " " &&
        data !== "" &&
        (data === "0" || data === "1" || data === "2" || data === "3" || data === "4" || data === "5" || data === "6" || data === "7" || data === "8" || data === "9")
      ) {
        let value = e.target.value.replace(/[^\d]/g, "");
        if (("" + value).length > 8) {
          this.$refs.number.value = this.password || "";
          return;
        }
        this.password = value;
      } else {
        this.onKeyUp(e);
      }
    },
    onKeyUp(e) {
      if (e.keyCode === 8) {
        if (this.password.length) {
          let v = this.password.substring(0, this.password.length - 1);
          this.$refs.number.value = v;
          this.password = v;
        }
      } else {
        this.$refs.number.value = this.password || "";
      }
    },
    onBlur(e) {
      this.$refs.number.value = this.password || "";
    },
    onChangePwd() {
      if (this.keyType !== "normal" || this.keyType === "temp") return;
      this.password = this.keyDetail.pwdValue;
      this.changePwdModal = true;
      this.$nextTick(() => {
        this.$refs.number.focus();
      });
    },
    disRemark(name) {
      this.changeRemarkModal = !this.changeRemarkModal;
      if (!!name) {
        this.keyDetail.name = this.keyDetail.keyName;
      }
    },
    async setRemark() {
      let params = {
        id: this.keyDetail.id,
        name: this.keyDetail.name ? this.keyDetail.name : ' '
      };
   
      let result = await lockKeyUpdReq(params);
      if (result && !result.error) {
        this.keyDetail.keyName = params.name;
        this.disRemark();
      } else {
        let msg = (result && result.error && result.error.msg) || "修改备注失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    onAvatarLoad(item, isSuccess) {
      if (isSuccess) {
        this.$set(item, "loadAvatar", true);
      }
    },
    onCancel() {
      this.showDelModal = false;
    },
    clickDel() {
      this.showDelModal = true;
    },
    goLinkUser(item) {
      if (!this.getLockAdmin || item.bindUserId === 9) return;
      if (!item.bindUserId) {
        this.$router.push({ name: "LinkUser", query: { slideWay: "left", id: item.bindUserId, lockId: item.id } });
      } else {
        this.showUnBindModal = true;
      }
    },
    onSendSMS(type) {
      if (type === 0) {
        execNativeFunc("sendMsgToSMS", { content: this.setShareText() });
      } else if (type === 1) {
        execNativeFunc("sendMsgToWechat", { content: this.setShareText() });
      }
    },
    async onUnbindUser() {
      this.showUnBindModal = false;
      let result = await lockKeyUpdReq({ id: this.keyId, bindUserId: 0, name: "" });
      if (result && !result.error) {
        // 刷新
        this.getData();
      } else {
        let msg = (result && result.error && result.error.msg) || "解绑失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async onDel() {
      let result = await delLockKeyReq({ id: this.keyId });
      if (result && !result.error) {
        this.$Toast.show({ title: "删除成功", postion: "middle" });
        this.setChangeLinkUser(true);
        this.goback();
      } else {
        let msg = (result && result.error && result.error.msg) || "删除失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async getData() {
      let result = await lockKeyDetailReq({ id: this.keyId });
      if (result && !result.error) {
        this.keyDetail = result.data.data || {};
      } else {
        let msg = (result && result.error && result.error.msg) || "获取详情失败";
        this.$Toast.show({ title: msg, postion: "middle" });
        let timer = setTimeout(() => {
          this.goback();
          timer && clearTimeout(timer);
        }, 2000);
      }
    },
    async queryActiveStatus() {
      this.queryActiveStatusTimer && clearTimeout(this.queryActiveStatusTimer);
      let that = this;
      this.queryActiveStatusTimer = setTimeout(() => {
        lockKeyDetailReq({ id: that.keyId }).then(result => {
          that.isReacting = false;
          if (result && !result.error) {
            that.keyDetail.ifExpired = result.data.data ? result.data.data.ifExpired : 4;
          }
        });
      }, 4000);
    },
    async handleReactive() {
      if (this.isReacting || this.keyDetail.ifExpired !== 4) return;
      this.isReacting = true;
      this.$Toast.show({ title: "指令已下发", postion: "middle" });
      let result = await lockKeyActiveReq({ id: this.keyDetail.id });
      if (!result || result.error) {
        this.isReacting = false;
        let msg = (result && result.error && result.error.msg) || "指令下发失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      } else {
        this.queryActiveStatus();
      }
    },
    setShareText() {
      let year = this.keyDetail.effectTimeEnd.split("-")[0];
      let month = this.keyDetail.effectTimeEnd.split("-")[1];
      let day = this.keyDetail.effectTimeEnd.split("-")[2].split(" ")[0];
      let t = this.keyDetail.effectTimeEnd.split("-")[2].split(" ")[1];
      let n = Number(this.keyDetail.limitCount) === 1 ? "一次" : "无限次";
      let txt = `【云图智能】您的临时密码为${this.keyDetail.pwdValue}，次数为${n}，有效期至${year}年${month}月${day}日${t}。请妥善保管临时密码，感谢~`;
      return txt;
    }
  },
  computed: {
    ...mapGetters(["getLockAdmin", "globalAppVersion"])
  },
  filters: {
    fTime(t) {
      if (!t) return "-";
      let times = t.split(":");
      return times[0] + ":" + times[1];
    }
  },
  created() {
    this.keyId = this.$route.query.id;
    this.keyType = this.$route.query.type || "temp";
    this.getData();
  },
  deactivated() {
    this.queryActiveStatusTimer && clearTimeout(this.queryActiveStatusTimer);
    this.isReacting = false;
  },
  beforeDestroy() {
    this.queryActiveStatusTimer && clearTimeout(this.queryActiveStatusTimer);
    this.isReacting = false;
  },
  components: { TitleBar, Modal }
};
</script>
<style lang="less" scoped>
.user-password {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
  .title {
    &.title-bar {
      flex: 1;
      display: inline-block;
      height: 88px;
      text-align: center;
      line-height: 88px !important;
      color: #2f2f4a !important;
      font-size: 40px;
    }
    &.title-del {
      font-size: 32px;
      font-weight: bold;
      color: #ff453a !important;
      padding: 0;
    }
  }
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    margin-top: 30px;
    .info {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #fff;
      margin-bottom: 80px;
    }
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 50px 0 60px;
      background: #fff;
      width: 140px;
      overflow: hidden;
      height: 140px;
      border-radius: 50%;
      > span {
        width: 140px;
        height: 140px;
        font-size: 70px;
        line-height: 140px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        background-color: #6165c5;
        color: #fff;
      }
      > img {
        max-height: 140px;
      }
    }
    .cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 40px 0 52px;
      box-sizing: border-box;
      height: 128px;
      line-height: 128px;
      position: relative;
      background: #fff;
      &::after {
        position: absolute;
        left: 40px;
        right: 0;
        bottom: 0;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border: none;
        }
      }
      .title {
        font-size: 30px;
        font-weight: bold;
        color: #2f2f4a;
      }
      .right {
        font-size: 28px;
        color: #5e5e83;
        .iconfont {
          margin-left: 12px;
          font-size: 30px;
          vertical-align: top;
        }
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
      .del {
        width: 490px;
        height: 104px;
        background: #ffffff;
        border-radius: 52px;
        line-height: 104px;
        color: #ff453a;
        text-align: center;
      }
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
      }
      .iconfont {
        font-size: 30px;
        margin-right: 10px;
        &.icon-weixin {
          font-size: 44px;
        }
      }
      &.between {
        justify-content: space-between;
        margin-bottom: 30px;
      }
    }
  }
  .change-password {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }
    .main {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      height: 280px;
      background: #fff;
      border-top-left-radius: 50px;
      border-top-right-radius: 50px;
      box-sizing: border-box;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .input-area {
        width: 100%;
        height: 112px;
        background-color: #f1f1f1;
        font-size: 32px;
        color: #121212;
        line-height: 112px;
        border: none;
        outline: none;
        border-radius: 16px;
        padding: 0 80px 0 40px;
        box-sizing: border-box;
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 30px;
        font-weight: bold;
        color: #959495;
        .name {
          font-size: 32px;
          color: #121212;
        }
        .comfirm {
          color: #4289ff;
        }
      }
    }
    .icon-close {
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
