<template>
  <div class="navBar">
    <div class="left" @click="goToNative(7)">
      <p class="home-area-name" v-show="familyData && familyData.familyName">{{ familyData.familyName }}·{{ areaData.name }}</p>
      <span class="iconfont icon-right"></span>
    </div>
    <div class="right">
      <div class="unread" :class="{ notice: hasUnRead }">
        <img src="../../../assets/svgs/notice.svg" @click="goToNative(9)" alt="" />
      </div>
      <span class="iconfont icon-add" @click="handleShowPop"></span>
      <transition name="navBar-pop-show">
        <div class="pop" v-show="showPop">
          <span @click="goToNative(4)">扫一扫</span>
          <span @click="goToNative(5)">添加设备</span>
        </div>
      </transition>
      <div class="mask" v-show="showPop" @click="hidePop"></div>
    </div>
  </div>
</template>
<script>
import { mapMutations } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
import { familyAndAreaListRep, appMsgUnreadCountRep } from "../../../api/request";
export default {
  name: "navBar",
  data() {
    return {
      showPop: false,
      familyData: {},
      areaData: {},
      hasUnRead: false,
    };
  },
  methods: {
    ...mapMutations(["setNavigateType", "setHomeAreaId"]),
    handleShowPop() {
      this.showPop = true;
      this.$emit("showPop", true);
    },
    hidePop() {
      this.showPop = false;
      this.$emit("showPop", false);
    },
    goToNative(type) {
      this.setNavigateType({ type });
      execNativeFunc("onNavigateTo", { type: type });
      this.hidePop();
    },
    async getData() {
      this.getMsgCount();
      let { data, error } = await familyAndAreaListRep();
      this.$emit("loadDone");
      if (data && !error) {
        let list = data.data || [];
        let family = null;
        let area = null;
        if (list.length) {
          for (let item of list) {
            if (item.ifDefaultEnum === "yes") {
              family = item;
              break;
            }
          }
        }
        if (family) {
          for (let item of family.familyAreaVoList) {
            if (item.ifDefaultEnum === "yes") {
              area = item;
              break;
            }
          }
        }
        this.familyData = family;
        this.areaData = area;
        this.setHomeAreaId(area.id);
      }
    },
    async getMsgCount() {
      let result = await appMsgUnreadCountRep();
      if (result && !result.error && result.data.data) {
        this.hasUnRead = result.data.data.notify + result.data.data.warn > 0;
      }
    },
  },
  created() {
    this.getData();
  },
};
</script>
<style lang="less" scoped>
.navBar {
  position: relative;
  z-index: 3;
  height: 88px;
  width: 100%;
  line-height: 88px;
  box-sizing: border-box;
  padding: 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  .left {
    font-size: 36px;
    font-weight: bold;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    flex: 1;
    max-width: 75%;
    .home-area-name {
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .iconfont {
      font-size: 30px;
      margin-left: 8px;
      width: 40px;
      height: 40px;
      line-height: 40px;
    }
  }
  .right {
    position: relative;
    display: flex;
    align-items: center;
    padding-right: 12px;
    .unread {
      position: relative;
      width: 40px;
      height: 40px;
      font-size: 30px;
      line-height: 40px;
      &.notice {
        &::after {
          position: absolute;
          right: 6px;
          top: 2px;
          content: " ";
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ff453a;
        }
      }
      > img {
        width: 40px;
        height: 40px;
        display: inline-block;
      }
    }
    .iconfont {
      margin-left: 50px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      font-size: 30px;
      &.icon-add {
        font-size: 38px;
      }
    }
    .pop {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 240px;
      background-color: #fff;
      z-index: 10;
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.02);
      border-radius: 40px;
      font-size: 32px;
      color: #2f2f4a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      > span {
        text-align: center;
        line-height: 120px;
        &:first-child {
          border-bottom: 2px solid rgba(0, 0, 0, 0.05);
        }
        &:active {
          background-color: rgba(240, 240, 240, 0.5);
        }
      }
    }
    .mask {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9;
    }
  }
}
</style>
<style lang="less">
.navBar-pop-show-enter-active,
.navBar-pop-show-leave-active {
  transition: all 0.2s;
}
.navBar-pop-show-enter,
.navBar-pop-show-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
