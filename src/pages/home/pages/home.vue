<template>
  <div class="home-box" :style="{ height: homePageHeight }" :class="{ ios: platform === 'ios' }">
    <img src="../../../static/images/home/sunny.png" v-show="weatherImgType === 1" class="weather-banner" alt="" />
    <img src="../../../static/images/home/cloud.png" v-show="weatherImgType === 2" class="weather-banner" alt="" />
    <img src="../../../static/images/home/raining.png" v-show="weatherImgType === 3" class="weather-banner" alt="" />
    <img src="../../../static/images/home/snow.png" v-show="weatherImgType === 4" class="weather-banner" alt="" />
    <img src="../../../assets/images/network_error.png" class="not-show" alt="" />
    <img src="../../../assets/images/empty.png" class="not-show" alt="" />
    <div :style="{ height: systemStatusBarH }"></div>
    <div class="home-page">
      <div class="head" ref="head" :style="{ 'z-index': isShowNavPop ? '99' : '9' }">
        <nav-bar ref="navBarComp" @showPop="showPop" @loadDone="onFamilyDone" />
        <div class="weather-wrap">
          <weather-comp ref="weatherComp" :roomId="roomId" />
        </div>
      </div>
      <div class="logding-wrap" :class="{ trans: loadMotionData.isTouchEnd }" :style="{ transform: `translateY(${loadMotionData.moveY}px)` }">
        <home-svg-loading :distance="loadMotionData.moveY" :loading="loadMotionData.isLoading" />
      </div>
      <!-- <div class="logding-wrap" :class="{ trans: false }" :style="{ transform: `translateY(60px)` }">
        <home-svg-loading :distance="loadMotionData.moveY" :loading="loadMotionData.isLoading" />
      </div> -->
      <div
        class="main-content"
        :class="{ trans: loadMotionData.isTouchEnd }"
        :style="{ top: `${loadMotionData.moveY}px` }"
        @touchstart="onLoadTouchStart"
        @touchmove="onLoadTouchMove"
        @touchend="onLoadTouchEnd"
      >
      <!-- <div
        class="main-content"
        :class="{ trans: false }"
        :style="{ top: `60px` }"
        @touchstart="onLoadTouchStart"
        @touchmove="onLoadTouchMove"
        @touchend="onLoadTouchEnd"
      > -->
        <div ref="sceneList">
          <scenes-list-comp @loadDataDone="onSceneDataDone" ref="sceneListComp" />
        </div>
        <div
          class="content"
          :class="{ active: isTouchEnd}"
          :style="{ top: motionData.moveTop !== '' && motionData.moveTop !== null && motionData.moveTop !== undefined ? motionData.moveTop + 'px' : '' }"
          ref="content"
          @touchmove.stop="onTouchMove"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <!-- //首页 -->
          <home-main-comp ref="homeMainComp" :roomId.sync="roomId" @stopDrap="stopDrap" @loadDone="loadEnd" @on-move="onMove" @on-stopScroll="onStopScroll" @on-end="onEnd" :isPrevent="!isFolder" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import navBar from "../components/NavBar";
import weatherComp from "../components/Weather";
import scenesListComp from "../components/ScenesList";
import homeMainComp from "../components/homeMain";
import homeSvgLoading from "../components/loading";
import { mapGetters, mapMutations, mapActions } from "vuex";
export default {
  name: "Home",
  data() {
    return {
      roomId: -1,
      isFolder: false,
      isTouchEnd: false,
      onTouching: false,
      isStopDrap: false,
      motionData: {
        top: null,
        moveTop: null,
        startY: 0,
        maxY: 0, // 最大下拉距离
        minY: 0, // 最小顶部距离
      },
      loadMotionData: {
        moveY: 0,
        startY: 0,
        endY: 0,
        isLoading: false,
        isTouchEnd: false,
      },
      hasSceneList: false,
      sceneListLen: 0,
      isDeviceListStopScroll: false,
      isSkipLoad: false,
      isShowNavPop: false,
      homePageHeight: "100vh",
      systemStatusBarH: window.__WINGTO__.statusbarheight + "px",
      platform: window.__WINGTO__.platform,
      weatherCode2Bg: {
        100: 1,
        103: 1,
        153: 1,
        150: 1,
        101: 2,
        102: 2,
        104: 2,
        154: 2,
        300: 3,
        301: 3,
        302: 3,
        303: 3,
        304: 3,
        305: 3,
        306: 3,
        307: 3,
        308: 3,
        309: 3,
        310: 3,
        311: 3,
        312: 3,
        313: 3,
        314: 3,
        315: 3,
        316: 3,
        317: 3,
        318: 3,
        399: 3,
        350: 3,
        351: 3,
        400: 4,
        401: 4,
        402: 4,
        403: 4,
        404: 4,
        405: 4,
        406: 4,
        407: 4,
        408: 4,
        409: 4,
        410: 4,
        499: 4,
        456: 4,
        457: 4,
        500: 0,
        501: 0,
        502: 0,
        503: 0,
        504: 0,
        507: 0,
        508: 0,
        509: 0,
        510: 0,
        511: 0,
        512: 0,
        513: 0,
        514: 0,
        515: 0,
        900: 0,
        901: 0,
        999: 0,
      },
      weatherImgType: 0,
      loadStatus: {
        main: false,
        family: false,
        scenes: false,
      },
    };
  },
  methods: {
    ...mapActions(["deviceItemDetailAction"]),
    ...mapMutations(["setNavigateType"]),

    showPop(flag) {
      this.isShowNavPop = flag;
    },
    onStopScroll({ event, flag }) {
      if (flag && !this.isDeviceListStopScroll) {
        this.isDeviceListStopScroll = true;
        this.onLoadTouchStart(event);
      }
      if (!flag) {
        this.isDeviceListStopScroll = false;
      } else {
        !this.isFolder && this.onLoadTouchMove(event);
      }
    },
    onLoadTouchStart(e) {
      this.loadMotionData.isLoading = false;
      const target = e.changedTouches[0];
      this.loadMotionData.startY = target.clientY;
      this.loadMotionData.isTouchEnd = false;
    },
    onLoadTouchMove(e) {
      this.loadMotionData.isTouchEnd = false;
      const target = e.changedTouches[0];
      let moveY = this.loadMotionData.endY + (target.clientY - this.loadMotionData.startY);
      if (moveY <= 0) {
        moveY = 0;
        this.isSkipLoad = !!this.sceneListLen;
        this.onTouchStart(e);
      } else if (moveY >= 60) {
        moveY = 60;
      }
      this.loadMotionData.moveY = moveY;
    },
    onLoadTouchEnd(e) {
      this.loadMotionData.isTouchEnd = true;
      this.loadMotionData.endY = this.loadMotionData.moveY;
      this.loadMotionData.isLoading = true;
      this.isSkipLoad = false;
      if (this.loadMotionData.endY <= 40) {
        this.loadEnd();
      } else {
        this.loadMotionData.endY = 60;
        this.loadMotionData.moveY = 60;
        this.handleReload();
      }
    },
    onEnd(e) {
      this.onTouchEnd(e);
    },
    onMove(e) {
      this.onTouchMove(e);
    },
    onTouchStart(e) {
      if (this.isFolder && !this.sceneListLen && this.loadMotionData.moveY > 0 && !this.isSkipLoad) {
        // 没有情景列表
        this.onLoadTouchStart(e);
        return;
      }
      this.onTouching = true;
      this.isTouchEnd = false;
      const target = e.changedTouches[0];
      this.motionData.startY = target.clientY;
      this.isFolder = this.motionData.moveTop <= this.motionData.minY;
    },
    onTouchMove(e) {
      if (this.isStopDrap) return;
      const target = e.changedTouches[0];
      let moveY = this.motionData.top + target.clientY - this.motionData.startY;
      if (!this.isSkipLoad) {
        if ((this.isFolder && !this.sceneListLen) || this.loadMotionData.moveY > 0) {
          this.onLoadTouchMove(e);
          return;
        } else if (!this.isFolder && !!this.sceneListLen) {
          this.onLoadTouchMove(e);
        }
      }
      this.onTouching = true;
      if (moveY > this.motionData.maxY) {
        moveY = this.motionData.maxY;
      } else if (moveY < this.motionData.minY) {
        moveY = this.motionData.minY;
      }
      this.motionData.moveTop = moveY;
    },
    onTouchEnd(e) {
      this.isTouchEnd = true;
      this.onTouching = false;
      if (this.motionData.top >= this.motionData.maxY) {
        // 还没有推上去
        if (this.motionData.moveTop < this.motionData.maxY - 20) {
          this.motionData.moveTop = this.motionData.minY;
          this.motionData.top = this.motionData.minY;
          this.isFolder = true;
        } else {
          this.motionData.moveTop = this.motionData.maxY;
          this.motionData.top = this.motionData.maxY;
          this.isFolder = false;
        }
      } else if (this.motionData.top <= this.motionData.minY) {
        // 已经推下去
        if (this.motionData.moveTop > this.motionData.minY + 20) {
          this.motionData.moveTop = this.motionData.maxY;
          this.motionData.top = this.motionData.maxY;
          this.isFolder = true;
        } else {
          this.motionData.moveTop = this.motionData.minY;
          this.motionData.top = this.motionData.minY;
          this.isFolder = false;
        }
      }
      this.isSkipLoad = false;
    },
    initRect(isReload) {
      let len = this.sceneListLen;
      if ((len && this.motionData.maxY === 0) || (!len && this.motionData.maxY > 0) || !isReload) {
        const sceneList = this.$refs.sceneListComp.$el.getBoundingClientRect();
        this.motionData.maxY = len ? sceneList.height + 20 : 0;
        this.motionData.minY = 0;
        this.motionData.top = this.motionData.maxY;
        this.motionData.moveTop = len ? sceneList.height + 20 : 0;
      }
    },
    onSceneDataDone(len, isReload) {
      this.hasSceneList = !!len;
      this.isFolder = !len;
      this.sceneListLen = len;
      this.$nextTick(() => {
        this.initRect(isReload);
      });
      this.loadStatus.scenes = false;
      this.setLoadStatus();
    },
    onFamilyDone() {
      this.loadStatus.family = false;
      this.setLoadStatus();
    },
    loadEnd() {
      this.loadStatus.main = false;
      this.setLoadStatus();
    },
    handleReload(isForce = false) {
      if (this.navigateType === 8 && !isForce) return; // 跳转的是设备详情页
      if ((this.loadStatus.main || this.loadStatus.scenes || this.loadStatus.family) && !isForce) return;
      this.loadStatus.main = true;
      this.loadStatus.scenes = true;
      this.loadStatus.family = true;
      this.loadMotionData.isTouchEnd = true;
      this.$refs.homeMainComp.getData(true);
      this.$refs.homeMainComp.scrollTop = 0;
      this.$refs.sceneListComp.getData(true);
      this.$refs.weatherComp.getData();
      this.$refs.navBarComp.getData();
    },
    setLoadStatus(isForce) {
      if (!isForce) {
        if (this.loadStatus.main || this.loadStatus.scenes || this.loadStatus.family) return;
        if (!this.loadMotionData.isTouchEnd) return;
      }
      this.loadMotionData.endY = 0;
      this.loadMotionData.moveY = 0;
      this.loadMotionData.isLoading = false;
    },
    stopDrap(flag) {
      this.isStopDrap = flag;
    },
    addEvenListener() {
      let that = this;
      window.WINGTO_H5.onPageChange = function (data) {
        // console.log("断点页面变化", data);
        if (data) {
          try {
            let result = JSON.parse(data);
            if (result && result.type == 1) {
              // console.log("有问题是因为这个吗");
              that.setNavigateType(0);
              that.$refs.homeMainComp.getRoomList(true);
              if (result.curtain) {
                that.$refs.homeMainComp.getRoomDeviceList(true);
              }

              // that.$refs.homeMainComp.getData(false, true);
              that.$refs.navBarComp.getData();
              that.$refs.weatherComp.getData();
            }
          } catch (error) {}
        }
        that.$refs.navBarComp.hidePop();
        that.$refs.homeMainComp.handleHidePop();
      };
      window.WINGTO_H5.onDataRefresh = function (data) {
        if (data) {
          try {
            let result = JSON.parse(data);

            if (result) {
              if (result.type === 0) {
                that.handleReload(true);
                that.$refs.homeMainComp.getData(true, false, true);
              } else if (result.type === 1) {
                that.$refs.sceneListComp.getData(true);
              } else if (result.type === 2 || result.type === 3) {
                that.$refs.homeMainComp.getData();
              } else if (result.type === 4) {
                that.$refs.sceneListComp.getData();
                that.$refs.weatherComp.getData();
                that.$refs.navBarComp.getData();
                that.$refs.homeMainComp.resetData();
              } else if (result.type === 5) {
                that.$refs.homeMainComp.getData(false, true, true);
              } else if (result.type === 6) {
                if (result.params && result.params.type === 0) {
                  that.deviceItemDetailAction(result.params);
                } else if (result.params && result.params.type === 1) {
                  that.$refs.homeMainComp.delDeviceItem(result.params);
                }
              }
            }
          } catch (error) {}
        }
      };
    },
  },
  watch: {
    homeAreaId(newV) {
      if (newV) {
        this.setLoadStatus(true);
      }
    },
    roomEnvironmentInfo(newV) {
      if (!newV) return;
      // console.log(newV,)
      this.weatherImgType = this.weatherCode2Bg[Number(newV.code)] || 0;
    },
  },
  mounted() {
    this.initRect();
    this.addEvenListener();
  },
  created() {
    this.homePageHeight = window.innerHeight + "px";
  },
  computed: {
    ...mapGetters(["navigateType", "roomEnvironmentInfo", "homeAreaId"]),
  },
  components: {
    navBar,
    weatherComp,
    scenesListComp,
    homeMainComp,
    homeSvgLoading,
  },
};
</script>
<style lang="less" scoped>
.home-box {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #393c84;
  .weather-banner {
    position: absolute;
    right: 0;
    top: 0;
    width: 432px;
    height: 252px;
    z-index: 9;
  }
  .not-show {
    position: absolute;
    z-index: -1;
    width: 1px;
    height: 1px;
  }
}
.home-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
  .head {
    position: relative;
    z-index: 9;
    width: 100%;
    .weather-wrap {
      margin-top: 30px;
      margin-bottom: 40px;
    }
    &::after {
      position: absolute;
      left: 40%;
      top: 50%;
      right: 40%;
      bottom: 0;
      content: " ";
      background: #393c84;
      z-index: -1;
      border-top-right-radius: 40px;
      border-top-left-radius: 40px;
    }
  }
  .main-content {
    position: relative;
    z-index: 9;
    flex: 1;
    &.trans {
      transition: all 0.2s ease-in-out;
    }
  }
  .logding-wrap {
    position: absolute;
    top: 110px;
    left: 0;
    width: 100%;
    height: 100px;
    z-index: 8;
    &.trans {
      transition: all 0.2s ease-in-out;
    }
  }
  .content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 6;
    &.active {
      transition: top 0.2s ease-in-out;
    }
  }
}
</style>
