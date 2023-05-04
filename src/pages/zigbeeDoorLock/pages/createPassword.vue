<template>
  <div class="create-password" @click="handleClickOutSide">
    <title-bar @goBack="goback" :showRight="false" :secondTitle="false">
      <template v-slot:title><p class="title">新增密码</p></template>
    </title-bar>
    <div class="main">
      <div class="cell">
        <span>密码</span>
        <input type="number" ref="number" :value="password" @input="onPassword" @keyup="onKeyUp" @blur="onBlur" placeholder="请输入8位数字密码" />
      </div>
      <div class="cell" v-if="!isAdminFirst">
        <span>关联用户</span>
        <div class="right" @click="goLinkUser">
          <span>{{ (this.selectUser && this.selectUser.nickName) || "未关联" }}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>
      <div class="cell">
        <span>备注名</span>
        <div class="right">
          <input type="text" v-model.trim="name" maxlength="15" placeholder="请输入密码备注名称" />
        </div>
      </div>
      <div class="bot">
        <btn :isLoading="isLoading" :disable="isDisable" @onClick="handleSave">保存</btn>
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBardoor";
import { lockKeyAddReq, queryKeyExistReq } from "../../../api/request";
import Btn from "../components/loading-btn";
import { mapMutations, mapGetters } from "vuex";
export default {
  name: "CreatePassword",
  data() {
    return {
      password: "",
      name: "",
      isLoading: false,
      selectUser: null,
      isAdminFirst: false // 是否是管理员第一次设置密码
    };
  },
  methods: {
    ...mapMutations(["setNormalDoorKeyData", "setCreateDoorKeyResult"]),
    goback() {
      // 退到上一页记得要setNormalDoorKeyData清空
      this.setNormalDoorKeyData(null);
      this.$router.back();
    },
    goLinkUser() {
      this.$router.push({
        name: "LinkUser",
        query: { slideWay: "left", type: "add", id: (this.selectUser && this.selectUser.id) || "" },
        params: { password: this.password, selectUser: this.selectUser,name:this.name }
      });
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
    handleClickOutSide(e) {},
    async handleSave() {
      this.isLoading = true;
      let result = await queryKeyExistReq({ endpointId: this.globalDataId, numberPwd: this.password });
      if (result && !result.error) {
        this.saveKey();
      } else {
        this.isLoading = false;
        let msg = (result && result.error && result.error.msg) || "创建失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async saveKey() {
      let params = {
        endpointId: this.globalDataId,
        ifForever: true,
        pwdTypeEnum: "appRemote",
        pwdValue: this.password,
        relationUserId: this.selectUser.id,
        name: this.name
      };
      let result = await lockKeyAddReq(params);
      this.isLoading = false;
      if (result && !result.error) {
        this.setCreateDoorKeyResult(true);
        this.goback();
      } else {
        this.setCreateDoorKeyResult(false);
        let msg = (result && result.error && result.error.msg) || "创建失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    }
  },
  created() {
    let isAdminFirst = this.$route.query.isAdminFirst;
    if (this.addNormalDoorKeyData) {
      // console.log(this.addNormalDoorKeyData,'哪里来的')
      this.selectUser = this.addNormalDoorKeyData.selectUser;
      this.password = this.addNormalDoorKeyData.password || "";
      this.name = this.addNormalDoorKeyData.name || "";
    }
    if (typeof isAdminFirst === "boolean" && isAdminFirst) {
      this.selectUser = { id: this.globalUserId };
      this.isAdminFirst = isAdminFirst;
    }
  },
  computed: {
    ...mapGetters(["addNormalDoorKeyData", "globalDataId", "globalUserId"]),
    isDisable() {
      return !this.password || this.password.length !== 8 || ((!this.selectUser || !this.selectUser.id) && !this.isAdminFirst) || !this.name;
    }
  },
  components: { TitleBar, Btn }
};
</script>
<style lang="less" scoped>
.create-password {
  background-color: #f0f0fd;
  -webkit-tap-highlight-color: transparent;
  .title {
    flex: 1;
    text-align: center;
    font-size: 40px;
  }
  .main {
    position: relative;
    height: 100%;
    .cell {
      width: 100%;
      height: 128px;
      display: flex;
      align-items: center;
      background: #fff;
      margin-top: 30px;
      justify-content: space-between;
      > span {
        width: 30%;
        flex: 0 0 30%;
        padding-left: 52px;
        box-sizing: border-box;
        font-weight: bold;
      }
      > input {
        height: 100%;
        line-height: 128px;
        outline: none;
        text-decoration: none;
        font-size: 28px;
        color: #5e5e83;
        flex: 1;
        box-sizing: border-box;
        padding-right: 40px;
        border: none;
        text-align: right;
      }
      .right {
        padding-right: 40px;
        font-size: 28px;
        color: #5e5e83;
        flex: 1;
        justify-content: flex-end;
        display: flex;
        .iconfont {
          margin-left: 12px;
        }
        > input {
          width: 100%;
          height: 128px;
          line-height: 128px;
          font-size: 28px;
          color: #5e5e83;
          border: none;
          outline: none;
          text-align: right;
          box-sizing: border-box;
        }
      }
    }
    .bot {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 80px;
      left: 0;
      right: 0;
    }
  }
}
</style>
