<template>
  <div class="auth-management">
    <title-bar @goBack="goback" :showRight="false" :secondTitle="false">
      <template v-slot:title><p class="title title-bar">钥匙管理</p></template>
    </title-bar>
    <div class="main">
      <div class="nav">
        <div class="nav-item" :class="{ active: activeNav === 0 }" @click="onChangeNav(0)">数字密码</div>
        <div class="nav-item" :class="{ active: activeNav === 1 }" @click="onChangeNav(1)">指纹密码</div>
        <div class="nav-item" :class="{ active: activeNav === 2 }" @click="onChangeNav(2)">门卡密码</div>
      </div>
      <div class="scroll">
        <div class="list number" v-show="activeNav === 0">
          <!-- 数字密码 -- 普通密码 -->
          <div class="section" v-if="numberList && numberList.length">
            <p class="title">普通密码</p>
            <div class="cell" @click="goUserPassword(item, 'normal')" v-for="item of numberList" :key="item.id">
              <!-- 如果是本地创建（createUserId=9）且没有绑定用户，显示手指图案 -->
              <div class="avatar">
                <div class="iconfont icon-lock_num" v-if="item.createUserId === 9 && !item.bindUserId"></div>
                <!-- 如果有头像，就显示头像 -->
                <div class="img-bg" :style="{ 'background-image': item.userPicAbs ? `url(${item.userPicAbs})` : '' }" v-else-if="item.userPicAbs"></div>
                <!-- 如果不是本地创建（createUserId!=9）且绑定用户图片出错，显示默认头像 -->
                <img :src="defaultAvatar" v-else v-show="(item.createUserId !== 9 || item.bindUserId) && (item.hideAvatar || !item.userPicAbs)" class="pic" alt="" />
                <img :src="item.userPicAbs" v-if="item.userPicAbs" @error="onAvatarLoad(item, true)" class="pic-hidden" alt="" />
              </div>
              <div class="info">
                <p class="name">
                  {{ item | formatName(activeNav) }}
                  <span class="life" v-if="item.bindUserId === 9">管理员</span>
                  <span class="active-status" v-if="item.ifExpired === 4">未激活</span>
                </p>
                <div class="create">
                  <span class="way">{{ item.createUserId === 9 ? "门锁创建" : "APP创建" }}</span>
                  <span class="time">时间：{{ item.createTime | fTime }}</span>
                </div>
              </div>
              <span class="iconfont icon-right"></span>
            </div>
          </div>
          <!-- 数字密码 -- 临时密码 -->
          <div class="section" v-if="tempKeyList && tempKeyList.length">
            <p class="title">临时密码</p>
            <div class="cell temp" @click="goUserPassword(item, 'temp')" v-for="item of tempKeyList" :key="item.id">
              <!-- 如果是本地创建（createUserId=9）且没有绑定用户，显示手指图案 -->
              <div class="avatar">
                <div class="iconfont icon-lock_num" v-if="item.createUserId === 9 && !item.bindUserId"></div>
                <!-- 如果有头像，就显示头像 -->
                <div class="img-bg" :style="{ 'background-image': `url(${item.userPicAbs})` }" v-else-if="item.userPicAbs"></div>
                <!-- 如果不是本地创建（createUserId!=9）且绑定用户图片出错，显示默认头像 -->
                <img :src="defaultAvatar" v-else v-show="(item.createUserId !== 9 || item.bindUserId) && (item.hideAvatar || !item.userPicAbs)" class="pic" alt="" />
                <img :src="item.userPicAbs" @error="onAvatarLoad($event, item, true)" class="pic-hidden" alt="" />
              </div>
              <div class="info">
                <p class="name">
                  {{ item | formatName(activeNav) }}
                  <span class="life">{{ item.limitCount === -1 ? "无限次" : "一次" }}</span>
                  <span class="active-status" v-if="item.ifExpired === 4">未激活</span>
                </p>
                <div class="create">
                  <span class="way">{{ item.createUserId === 9 ? "门锁创建" : "APP创建" }}</span>
                  <span class="time">时间：{{ item.createTime | fTime }}</span>
                  <div>
                    <span class="way">有效期至</span>
                    <span class="time">{{ item.createTime | fTime }} - {{ item.effectTimeEnd | fTime }}</span>
                  </div>
                </div>
              </div>
              <span class="iconfont icon-right"></span>
            </div>
          </div>
          <div class="key-empty" v-if="!tempKeyList.length && !numberList.length">
            <img src="../../../static/images/device/doorlock/no_door_number_key.png" />
            <p>暂无数字密码</p>
          </div>
        </div>
        <div class="list number" v-show="activeNav === 1">
          <!--指纹密码 -->
          <div class="section" v-if="fingerList && fingerList.length">
            <p class="title">门锁指纹</p>
            <div class="cell finger" @click="clickUser(item, '0')" v-for="(item, idx) of fingerList" :key="idx">
              <span class="index">{{ item | formatName(activeNav) }}</span>
              <div class="info">{{ item.bindUserId ? item.bindUserName : "未关联" }}</div>
              <span class="iconfont icon-right" v-show="getLockAdmin"></span>
            </div>
          </div>
          <div class="key-empty" v-else>
            <img src="../../../static/images/device/doorlock/no_finger_key.png" />
            <p>暂无指纹密码</p>
          </div>
        </div>
        <div class="list number" v-show="activeNav === 2">
          <!--门锁密码 -->
          <div class="section" v-if="doorKeyList && doorKeyList.length">
            <p class="title">门锁门卡</p>
            <div class="cell finger" @click="clickUser(item, '1')" v-for="(item, idx) of doorKeyList" :key="idx">
              <span class="index">{{ item | formatName(activeNav) }}</span>
              <div class="info">{{ item.bindUserId ? item.bindUserName : "未关联" }}</div>
              <span class="iconfont icon-right" v-show="getLockAdmin"></span>
            </div>
          </div>
          <div class="key-empty" v-else>
            <img src="../../../static/images/device/doorlock/no_door_key.png" />
            <p>暂无门卡密码</p>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="showDelModal" title="温馨提示" :content="unbindContent" cancelText="取消" okText="确认" @on-ok="onDel" @on-cancel="onCancel" />
  </div>
</template>
<script>
import { lockKeyListReq, lockKeyUpdReq } from "../../../api/request";
import TitleBar from "../components/titleBardoor";
import { mapGetters, mapMutations } from "vuex";
import Modal from "../../../components/modals/modal/Modal";
import defaultAvatar from "../../../static/images/default_avatar.png";
export default {
  data() {
    return {
      defaultAvatar: defaultAvatar,
      activeNav: 0,
      numberList: [],
      fingerList: [],
      doorKeyList: [],
      tempKeyList: [],
      showDelModal: false,
      delItemData: null,
      unbindContent: "确认解除指纹关系吗？",
    };
  },
  methods: {
    ...mapMutations(["setChangeLinkUser"]),
    goback() {
      // 因为是keepalive，所以退出当前页面这里要清除数据
      this.resetData();
      this.$router.back();
    },
    resetData() {
      this.numberList = [];
      this.doorKeyList = [];
      this.fingerList = [];
      this.tempKeyList = [];
      this.activeNav = 0;
      this.showDelModal = false;
    },
    onError(e) {
      console.error(e);
    },
    onAvatarLoad(e, item, isHide) {
      console.error(e);
      if (isHide) {
        this.$set(item, "hideAvatar", true);
      }
    },
    async onDel() {
      let result = await lockKeyUpdReq({ bindUserId: 0, id: this.delItemData.id, ifForce: 0 });
      if (result && !result.error) {
        this.showDelModal = false;
        let msg = "解绑成功";
        this.$Toast.show({ title: msg, postion: "middle" });
        this.getData();
      } else {
        let msg = (result && result.error && result.error.msg) || "解绑失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    onCancel() {
      this.showDelModal = false;
    },
    goUserPassword(item, type) {
      this.$router.push({ name: "UserPassword", query: { slideWay: "left", id: item.id, type } });
    },
    clickUser(item, type) {
      if (!this.getLockAdmin) return;
      // 已绑定就弹窗， 未绑定直接跳转
      if (item.bindUserId > 0) {
        this.showDelModal = true;
        this.unbindContent = type === "0" ? "确认解除指纹关系吗？" : "确认解除门卡关系吗？";
        this.delItemData = item;
      } else {
        this.goLinkUser(item);
      }
    },
    goLinkUser(item) {
      this.$router.push({ name: "LinkUser", query: { slideWay: "left", id: item.bindUserId, lockId: item.id } });
    },
    onChangeNav(value) {
  
      if (this.activeNav !== value) {
        this.activeNav = value;
        this.getData(value);
      }
    },
    async getData(nav) {
      let result = await lockKeyListReq({ endpointId: this.globalDataId, ifForce: false });
      if (result && !result.error && result.data && result.data.data) {
        if (nav === 0) {
          this.numberList = this._setLoadImgStatus(result.data.data.foreverNumber);
          this.tempKeyList = this._setLoadImgStatus(result.data.data.tmpNumber);
  
        } else if (nav === 1) {
          this.fingerList = this._setLoadImgStatus(result.data.data.foreverFinger);
       
        } else if (nav === 2) {
          this.doorKeyList = this._setLoadImgStatus(result.data.data.doorCard);
      
        } else {
          this.numberList = [];
          this.doorKeyList = [];
          this.fingerList = [];
          this.tempKeyList = [];
          this.$nextTick(() => {
            this.numberList = this._setLoadImgStatus(result.data.data.foreverNumber);
            this.doorKeyList = this._setLoadImgStatus(result.data.data.doorCard);
            this.fingerList = this._setLoadImgStatus(result.data.data.foreverFinger);
            this.tempKeyList = this._setLoadImgStatus(result.data.data.tmpNumber);
          });
        }
      }
    },
    _setLoadImgStatus(newList, oldList) {
      if (!oldList) return newList;
      if (!newList) return [];
      for (let item of newList) {
        if (!item.userPicAbs) {
          item["hideAvatar"] = true;
        }
      }
      return JSON.parse(JSON.stringify(newList));
    },
  },
  filters: {
    formatName(item, activeNav) {
      if (activeNav !== 0) {
        if (item.createUserId && item.createUserId !== 9) {
          return item.bindUserName;
        }
        return "钥匙" + item.hxjKeyId;
      } else {
        return item.bindUserName || "钥匙" + item.hxjKeyId;
      }
    },
    fTime(t) {
      if (!t) return "-";
      let times = t.split(":");
      return times[0] + ":" + times[1];
    },
  },
  activated() {
    // 因为这个页面是keep-alive的，所以当没有数据的时候认为是重新进入
    // 退出到上一页的时候要清除这里的数据

    this.getData(this.activeNav);
    if (this.getChangeLinkUser) {
      this.setChangeLinkUser(false);
    }
  },
  computed: {
    ...mapGetters(["globalDataId", "getChangeLinkUser", "getLockAdmin"]),
  },
  components: { TitleBar, Modal },
};
</script>
<style lang="less" scoped>
.auth-management {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  background: #f0f0fd;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
  .title {
    flex: 1;
    height: 88px;
    &.title-bar {
      text-align: center;
      line-height: 88px !important;
      color: #2f2f4a !important;
      font-size: 40px;
      display: inline-block;
    }
  }
  .main {
    // flex: 1;
    width: 100vw;
    // overflow: hidden;
    display: flex;
    flex-direction: column;
    .nav {
      height: 108px;
      line-height: 108px;
      width: 100%;
      background-color: #fff;
      padding-left: 40px;
      box-sizing: border-box;
      display: flex;
      .nav-item {
        font-size: 32px;
        color: #c0c0cd;
        margin-right: 32px;
        font-weight: 400;
        &.active {
          font-size: 34px;
          font-weight: bold;
          color: #2f2f4a;
        }
      }
    }
    .scroll {
      flex: 1;
      // height: 1250px;
      // overflow-y: auto;
    }
    .list {
      width: 100%;
      height: 100%;
      .section {
        margin-top: 30px;
        background: #fff;
      }
      .title {
        height: 60px;
        line-height: 60px;
        font-size: 28px;
        padding-left: 40px;
        color: #5e5e83;
      }
      .cell {
        height: 160px;
        display: flex;
        box-sizing: border-box;
        padding: 0 40px;
        align-items: center;
        justify-content: space-between;
        color: #5e5e83;
        position: relative;
        &.temp {
          height: 200px;
          .avatar {
            margin-bottom: 32px;
          }
        }
        &::after {
          position: absolute;
          bottom: 0;
          left: 40px;
          right: 0;
          content: "";
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        &:last-child {
          &::after {
            border: none;
          }
        }
        &.finger {
          .info {
            margin-bottom: 0;
            text-align: right !important;
            padding-right: 12px;
            font-size: 28px;
            font-weight: 400;
            color: #5e5e83;
          }
          &.iconfont {
            color: #5e5e83;
          }
        }
        .index {
          font-size: 30px;
          font-weight: bold;
          color: #2f2f4a;
        }
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          flex: 0 0 60px;
          text-align: center;
          line-height: 60px;
          font-size: 30px;
          color: #fff;
          overflow: hidden;
          position: relative;
          background-color: transparent;
          .iconfont {
            background-color: #6165c5;
          }
          .img-bg {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-size: cover;
          }
          .pic {
            position: absolute;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: #fff;
          }
          .pic-hidden {
            opacity: 0;
            width: 0;
            position: absolute;
            z-index: -1;
            height: 0;
          }
        }
        .info {
          flex: 1;
          padding-left: 20px;
        }
        .name {
          font-size: 32px;
          font-weight: bold;
          color: #2f2f4a;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          height: 40px;
          .life,
          .active-status {
            background-color: #6165c5;
            color: #fff;
            height: 30px;
            border-top-left-radius: 16px;
            border-bottom-right-radius: 16px;
            line-height: 31px;
            font-size: 24px;
            padding: 0 12px;
            font-weight: 400;
            margin-left: 12px;
          }
          .active-status {
            background-color: #f1f1f3;
            color: #5e5e83;
          }
        }
        .create {
          line-height: 1.2;
        }
        .way {
          font-size: 28px;
          margin-right: 20px;
        }
        .time {
          font-size: 24px;
        }
        .iconfont {
          font-size: 30px;
        }
      }
    }
    .key-empty {
      width: 100%;
      height: 100%;
      display: flex;
      margin-top: 30%;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      > img {
        width: 492px;
        height: 360px;
      }
      > p {
        font-size: 32px;
        margin-top: 40px;
        color: #5e5e83;
      }
    }
  }
}
</style>
