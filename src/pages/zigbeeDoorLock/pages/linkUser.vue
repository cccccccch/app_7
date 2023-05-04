<template>
  <div class="link-user">
    <title-bar @goBack="goback" :showRight="true" :secondTitle="false">
      <template v-slot:title>
        <p class="title title-bar">关联用户</p>
      </template>
      <template v-slot:right>
        <span class="confirm-btn" @click="clickConfirm" v-show="selectId">确定</span>
      </template>
    </title-bar>
    <div class="main">
      <div class="user" v-for="(item, idx) of userList" :key="idx" @click="clickUser(item)">
        <div class="pic">
          <img :src="item.userPic" v-show="!item._hidden && item.userPic" @error="onError($event, item)" class="avatar" alt />
          <img v-show="!item.userPic || item._hidden" class="iconfont icon-lock_num" src="../../../static/images/default_avatar.png" />
        </div>
        <p class="name">{{ item.nickName }}</p>
        <span class="check iconfont icon-check1" :class="{ active: item.id === selectId }"></span>
      </div>
    </div>
    <div class="empty-area" v-show="isFirstLoading || (!isLoading && !userList.length)">
      <loading-comp color="rgba(0,0,0,0.1)" :showMask="false" v-show="isFirstLoading && !userList.length" />
      <div class="empty" v-show="!isLoading && !userList.length && !isFirstLoading">
        <img src="../../../static/images/device/doorlock/door_log_empty.png" alt />
        <p>当前列表为空</p>
      </div>
    </div>
  </div>
</template>
<script>
import { memberListReq, lockKeyUpdReq } from "../../../api/request";
import TitleBar from "../components/titleBardoor";
import { mapMutations } from "vuex";
import loadingComp from "../../../components/Loading";
export default {
  name: "LinkUser",
  data() {
    return {
      isFirstLoading: false,
      isLoading: false,
      selectId: "",
      userList: [],
      selectUser: null,
      routerParams: {},
      type: "",
      lockId: 0,
    };
  },
  methods: {
    ...mapMutations(["setNormalDoorKeyData", "setChangeLinkUser"]),
    goback() {
      if (this.type === "add") {
        // 从门锁页面
        let params = { ...this.routerParams };
        if (this.selectUser) {
          params = { ...params, selectUser: this.selectUser };
        }
        this.setNormalDoorKeyData(params);
      }
      this.$router.back();
    },
    onError(e, item) {
      item._hidden = true;
    },
    async clickConfirm() {
      if (this.type === "add") {
        // 从门锁页面
        this.goback();
      } else {
        // 从密码详情页进入
        let result = await lockKeyUpdReq({ bindUserId: this.selectId, id: this.lockId, ifForce: 0 });
        if (result && !result.error) {
          this.setChangeLinkUser(true);
          this.goback();
        } else {
          let msg = (result && result.error && result.error.msg) || "关联新用户失败";
          this.$Toast.show({ title: msg, postion: "middle" });
        }
      }
    },
    clickUser(item) {
      this.selectId = item.id;
      this.selectUser = item;
    },
    async getData() {
      this.isLoading = true;
      let result = await memberListReq();
      this.isLoading = false;
      this.isFirstLoading = false;
      if (result && !result.error) {
        let list = result.data.data || [];
        list.map((v) => {
          v._hidden = false;
        });
        this.userList = list;
      }
    },
  },
  created() {
    this.isFirstLoading = true;
    this.type = this.$route.query.type;
    this.selectId = Number(this.$route.query.id);
    this.lockId = Number(this.$route.query.lockId);
    this.routerParams = this.$route.params;
    this.selectUser = this.$route.params.selectUser;
    this.getData();
  },
  components: { TitleBar, loadingComp },
};
</script>
<style lang="less" scoped>
.link-user {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  .title {
    flex: 1;
    height: 88px;
    &.title-bar {
      text-align: center;
      line-height: 88px !important;
      color: #2f2f4a !important;
      display: block;
    }
  }
  .confirm-btn {
    position: absolute;
    right: 20px;
    top: 30px;
    // transform: translateY(50%);
    font-size: 30px;
    font-weight: bold;
    color: #4289ff;
    width: 2.1em;
  }
  .main {
    flex: 1;
    overflow-y: auto;
    padding: 30px 0;
    .user {
      height: 128px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      box-sizing: border-box;
      position: relative;
      background-color: #fff;
      &::after {
        position: absolute;
        left: 40px;
        right: 0;
        bottom: 0;
        content: " ";
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      &:last-child {
        &::after {
          border: none;
        }
      }
    }
    .pic {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }
      .iconfont {
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: 60px;
        background: #6165c5;
        display: inline-block;
        border-radius: 50%;
        color: #fff;
        font-size: 36px;
      }
    }
    .name {
      flex: 1;
      font-size: 30px;
      font-weight: bold;
      color: #2f2f4a;
      margin-left: 36px;
    }
    .check {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 1px solid #979797;
      box-sizing: border-box;
      line-height: 46px;
      text-align: center;
      background: #fff;
      font-size: 28px;
      color: #fff;
      &.active {
        border: none;
        background: #6165c5;
      }
    }
  }
  .empty-area {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .empty {
      > img {
        width: 438px;
        height: 310px;
      }
      p {
        font-size: 28px;
        color: #2f2f4a;
        text-align: center;
        opacity: 0.6;
      }
    }
  }
}
</style>
