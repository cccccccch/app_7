<template>
  <div class="home-main">
    <div style="position: relative">
      <div class="room-list">
        <div class="room-wrap stopMoveArea" ref="roomListArea" @touchstart="onStart" @touchmove="onMove" @touchend="onEnd">
          <div class="room-item" :class="{ active: curRoom.id === -1 }" @click="clickAll($event, -1)" v-if="hasCommonlyList">常用设备</div>
          <div class="room-item" :class="{ active: curRoom.id === 0 }" @click="clickAll($event, 0)">全部</div>
          <div class="room-item" :class="{ active: curRoom.id && curRoom.id === item.id }" v-for="(item, idx) of roomList" :key="idx" @click="clickRoom($event, item, idx)">{{ item.roomName }}</div>
        </div>
        <span class="menu iconfont icon-menu" @click="handleShowPop"></span>
      </div>
      <transition name="home-pop-show">
        <div class="pop home-pop-main" ref="popMain" v-show="showPop">
          <span @click="goToNative(6)">房间管理</span>
          <!-- <span>设备管理</span> -->
        </div>
      </transition>
      <div class="mask" v-show="showPop" @click="handleHidePop"></div>
    </div>
    <div class="cate-btn">
      <div class="category" @click="showDeviceTypeModal = true">
        <span class="cate-name">{{ curDeviceCate.name }}</span>
        <span class="iconfont icon-down"></span>
      </div>
      <device-type-modal v-model="showDeviceTypeModal" :roomId="curRoom.id" :cateId="curDeviceCate.id" @on-choose="onCateChoose" :cateList="deviceCateList" />
    </div>
    <div
      class="device-list device-list-scroll"
      :style="{ bottom: statusbarheight + 'px' }"
      :class="{ overflow: isStopScroll }"
      ref="deviceList"
      @touchstart="onTouchStart"
      @touchmove.stop="onTouchMove"
      @touchend="onTouchEnd"
      @scroll="onListScroll"
    >
      <!-- <div class="list-wrap" v-show="!isNetError">
        <template v-for="(item, idx) in homeDeviceList4Mqtt">
          <device-item v-if="item && !item._hidden" :key="idx" :showRoomName="curRoom.id === -1 || curRoom.id === 0" :detail="item" @onNavigateTo="onItemNavigate" />
        </template>
      </div> -->
      <div class="list-wrap" v-show="!isNetError">
        <template v-for="item in newHomeDeviceList4Mqtt">
          <device-item v-if="item.length==1 && item[0] && !item[0]._hidden " :key="item.dataId" :showRoomName="curRoom.id === -1 || curRoom.id === 0" :detail="item[0]" @onNavigateTo="onItemNavigate" />
          <MultiwindowingItem :okkkk="item.length"  v-if="item.length!=1 && item[1] && !item[1]._hidden " :key="item.dataId" :showRoomName="curRoom.id === -1 || curRoom.id === 0" :detailM="item" @onNavigateTo="onItemNavigate" />
        </template>
      </div>
      <div class="loading-wrap" v-show="isDeviceLoading">
        <loading-comp v-show="isDeviceLoading" maskColor="transparent" />
      </div>
      <div class="empty-wrap" v-show="!isNetError && (!homeDeviceList4Mqtt || !Object.keys(homeDeviceList4Mqtt).length) && !isDeviceLoading">
        <empty-comp />
      </div>
      <div class="netError-wrap" v-show="isNetError">
        <empty-comp :type="2" tips="网络连接失败，请点击重试" @on-click="handleRetry" />
      </div>
      <div class="loading-all" v-show="!isNetError && homeDeviceList4Mqtt && Object.keys(homeDeviceList4Mqtt).length && isDeviceLoadAll">已经到底了</div>
    </div>
  </div>
</template>
<script>
import { homeRoomListRep, mostUsedDeviceRep, roomDeviceRep, deviceCategoryRep, endpointControlRep } from "../../../api/request";
import { throttle, deviceMacShowInApp } from "../../../utils/index";
import deviceItem from "./deviceItem";
import loadingComp from "../../../components/Loading";
import deviceTypeModal from "./deviceTypeModal";
import emptyComp from "../../../components/status/empty";
import { mapGetters, mapMutations, mapActions } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
import MultiwindowingItem from "./MultiwindowingItem.vue";
export default {
  name: "home-main",
  props: {
    isPrevent: {
      type: Boolean,
      default() {
        return false;
      },
    },
    roomId: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      outData:[],
      newHomeDeviceList4Mqtt:[],
      isTop: false,
      scrollTop: 0,
      isStopScroll: false,
      isLoading: false,
      startY: 0,
      roomList: [],
      roomCateMap: {},
      lastTimeStamp: 0,
      roomPage: {
        pageNum: 1,
        pageSize: 200,
      },
      isDeviceLoading: false,
      isDeviceLoadAll: false,
      devicePage: {
        currentPage: 1,
        pageSize: 30,
      },
      curRoom: { id: -1 },
      showDeviceTypeModal: false,
      deviceCateList: [],
      curDeviceCate: {
        name: "所有设备",
        id: 0,
      },
      listBoxHeight: 0,
      listBoxScrollHeight: 0,
      isNetError: false,
      showPop: false,
      statusbarheight: window.__WINGTO__.statusbarheight,
      roomScrollData: {
        startX: 0,
        startY: 0,
      },
      hasCommonlyList: false, // 是否有常用列表
    };
  },
  methods: {
    ...mapMutations(["setDeviceList", "setNavigateType", "setDelDeviceItem", "setNavigateRoomList"]),
    ...mapActions(["getRoomEnvironmentData", "deviceItemDetailAction"]),
    SETNEWDATA(res, page) {
      if (!res.length&&page.currPage!=1) return;
      if(page&&page.currPage!=1){
        res = [...this.outData,...res]
      }
      this.outData = res
      const Arr = [];
      res.forEach((item) => {
        if (!Arr.includes(item.deviceMac)) {
          Arr.push(item.deviceMac);
        }
      });
      const NewArr = [];
      Arr.forEach((val, index) => {
        let VArr = res.filter((Rval) => Rval.deviceMac == val);
        NewArr.push(VArr);
      });
      if(page&&page.currPage!=1){
        NewArr.forEach((v)=>{
          this.newHomeDeviceList4Mqtt.push(v)
        })
      }else{
        this.newHomeDeviceList4Mqtt = NewArr;
      }
    },
    onStart(e) {
      let target = e.changedTouches[0];
      this.roomScrollData.startX = target.clientX;
      this.roomScrollData.startY = target.clientY;
    },
    onMove(e) {
      let target = e.changedTouches[0];
      let moveX = target.clientX - this.roomScrollData.startX;
      let moveY = target.clientY - this.roomScrollData.startY;
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.$emit("stopDrap", true);
      }
    },
    onEnd() {
      this.$emit("stopDrap", false);
    },
    handleShowPop() {
      this.showPop = true;
    },
    handleHidePop() {
      this.showPop = false;
      this.showDeviceTypeModal = false;
    },
    // 跳转前记录滚动条位置
    onItemNavigate(data) {
      const top = this.$refs.deviceList.scrollTop;
      this.scrollTop = top;
    },
    // 设置滚动条位置
    setScroll() {
      document.querySelector(".device-list-scroll").scrollTop = this.scrollTop;
    },
    goToNative(type) {
      this.setNavigateType({ type });
      if (type === 6) {
        this.handleHidePop();
      }
      execNativeFunc("onNavigateTo", { type: type });
    },
    // 切换设备的分类
    onCateChoose(item) {
      if (this.curDeviceCate.id === item.id) return;
      this.roomCateMap[this.curRoom.id].id = item.id;
      this.roomCateMap[this.curRoom.id].name = item.name;
      this.curDeviceCate = item;
      this.devicePage.currentPage = 1;
      if (this.curRoom && this.curRoom.id >= 0) {
        this.getRoomDeviceList(true);
      } else {
        this.getMostUseDevice(true);
      }
    },
    // 点击常用设备或者全部分类
    clickAll(e, idx) {
      this.clickRoom(e, { id: idx }, idx - 1);
    },
    // 点击切换房间
    clickRoom(e, item, idx) {
      if (item.id === this.curRoom.id) return;
      this.getRoomEnvironmentData({ roomId: item.id });
      this.curRoom = item || {};
      this.$emit("update:roomId", item.id);
      this.devicePage = {
        currentPage: 1,
        pageSize: 30,
      };
      this.curDeviceCate = {
        name: this.roomCateMap[this.curRoom.id].name,
        id: this.roomCateMap[this.curRoom.id].id,
      };
      this.setDeviceList({ list: [], isClear: true });
      if (item.id < 0) {
        this.getMostUseDevice(true);
      } else {
        this.getRoomDeviceList(true);
      }
      this.getDeviceCate();
      let target = e.target;
      let rect = target.getBoundingClientRect();
      let roomListArea = this.$refs.roomListArea;
      let boxRect = roomListArea.getBoundingClientRect();
      let itemRect1 = roomListArea.children[0].getBoundingClientRect();
      let itemRect2 = roomListArea.children[1].getBoundingClientRect();
      let marginWidth = itemRect2.left - itemRect1.right;
      let scrollLeft = 0;
      let index = idx + (this.hasCommonlyList ? 2 : 1); // 注意这里的index值， 因为房间列表点击直接执行clickRoom方法，idx值是从0开始，但是在实际的列表中的位置是与idx不一样的

      for (let i = 0, len = roomListArea.children.length || 0; i < len; i++) {
        if (i > index) break;
        let itemRect = roomListArea.children[i].getBoundingClientRect();
        if (i !== index) {
          scrollLeft += itemRect.width + marginWidth;
        } else {
          scrollLeft += itemRect.width / 2;
        }
      }
      scrollLeft = scrollLeft - boxRect.left - boxRect.width / 2;
      this._scrollTo(scrollLeft);
    },
    // 点击房间滚动到中间
    _scrollTo(scrollLeft) {
      this.$refs.roomListArea.scrollTo({
        left: scrollLeft < 0 ? 0 : scrollLeft,
        behavior: "smooth",
      });
    },
    onTouchStart(e) {
      this.startY = e.changedTouches[0].clientY;
      let scrollTop = this.$refs.deviceList.scrollTop;
      this.isTop = scrollTop <= 0;
      this.isStopScroll = false;
      this.$emit("on-stopScroll", { event: e, flag: false });
      this.listBoxHeight = this.$refs.deviceList.getBoundingClientRect().height || 0;
      this.listBoxScrollHeight = this.$refs.deviceList.scrollHeight || 0;
    },
    onTouchMove(e) {
      let target = e.changedTouches[0];
      let y = e.changedTouches[0].clientY - this.startY;
      let scrollTop = this.$refs.deviceList.scrollTop;
      if (y > 0 && scrollTop <= 0) {
        this.isStopScroll = true;
        this.$emit("on-stopScroll", { event: e, flag: true });
      }
      if (this.isPrevent) {
        this.$emit("on-move", e);
        y <= 0 && e.preventDefault();
      } else {
        if (this.isTop && y > 0) {
          this.$emit("on-move", e);
        }
      }
    },
    // 触摸结束
    onTouchEnd(e) {
      this.$emit("on-end", e);
      this.isStopScroll = false;
      this.$emit("on-stopScroll", { event: e, flag: false });
    },
    // 设备列表区域滚动
    listScroll(e) {
      let scrollTop = e.target.scrollTop;
      if (!this.isDeviceLoading && !this.isDeviceLoadAll && this.listBoxScrollHeight > 0 && this.listBoxHeight > 0 && this.listBoxScrollHeight - this.listBoxHeight - scrollTop < 200) {
        if (this.curRoom.id >= 0) {
          this.isDeviceLoading = true;
          this.devicePage.currentPage += 1;
          this.getRoomDeviceList();
        } else {
          this.isDeviceLoadAll = true;
        }
      }
    },
    handleRetry() {
      if (this.curRoom.id < 0) {
        this.getMostUseDevice(true);
      } else {
        this.getRoomDeviceList(true);
      }
    },
    // 检查房间的改变，如果房间删除或者转移了，那么需要获取新的数据
    checkRoomChange() {
      if (this.curRoom.id <= 0) return;
      let isChange = true;
      for (let item of this.roomList) {
        if (item.id === this.curRoom.id) {
          isChange = false;
          break;
        } else {
          isChange = true;
        }
      }
      if (!isChange) return;
      this.curRoom.id = 0;
      this.$emit("update:roomId", 0);
      this.resetData();
    },
    // 发送指令到服务器
    async handleExecCmd(params, item) {
      let { data, error } = await endpointControlRep(params);
      if (!data || error) {
        item._DeviceOn = !item._DeviceOn;
        this.$Toast.show({ title: "执行出错" });
      }
    },
    // 获取房间列表
    async getRoomList(isClear = false, isReload = false) {
      try {
        this.isLoading = true;
        this.lastTimeStamp = new Date().getTime();
        let { data, error } = await homeRoomListRep();
        this.isLoading = false;
        if (data && !error) {
          let roomList = isClear ? data.data || [] : this.roomList.concat(data.data || []);
          let has = -1;
          for (let i = 0, len = roomList.length; i < len; i++) {
            if (!isReload) {
              this.roomCateMap[roomList[i].id] = this.roomCateMap[roomList[i].id] || { name: "所有设备", id: 0 };
            }
            if (roomList[i].stateEnum === "hidden") {
              has = i;
            }
          }
          if (!isReload) {
            this.roomCateMap[0] = this.roomCateMap[0] || { name: "所有设备", id: 0 };
            this.roomCateMap[-1] = { name: "所有设备", id: 0 };
          }
          if (has >= 0) {
            let params = {
              pageSize: 20,
              currentPage: 1,
              roomId: roomList[has].id,
            };
            let result = await roomDeviceRep(params);
            if (!result || !result.data.data.length) {
              roomList.splice(has, 1);
            }
            this.roomList = roomList;
            this.checkRoomChange();
          } else {
            this.roomList = roomList;
            this.checkRoomChange();
          }
        }
      } catch (error) {
        this.isLoading = false;
      } finally {
        this.isLoading = false;
        this.setRequestTime();
      }
      console.log(this.roomList, "111111111111111111111111触发存储");
      this.setNavigateRoomList(this.roomList);
    },
    // 获取房间设备列表
    async getRoomDeviceList(isClear, isRestoreScrollPos = false) {
      try {
        let params = {
          pageSize: this.devicePage.pageSize,
          currentPage: this.devicePage.currentPage,
        };
        if (this.curRoom && this.curRoom.id > 0) {
          params.roomId = this.curRoom.id;
        }
        if (this.curDeviceCate && this.curDeviceCate.id > 0) {
          params.categoryId = this.curDeviceCate.id;
        }
        this.isDeviceLoading = true;
        this.isNetError = false;
        let { data, error } = await roomDeviceRep(params);
        if (data && !error) {
          let list = [];
          if (Array.isArray(data.data)) {
            data.data.map((v) => {
              v["_hidden"] = !deviceMacShowInApp.includes(v.zigbeeTypeEnum);
            });
            if (!data.data.length) {
              if (this.devicePage.currentPage > 1) {
                this.devicePage.currentPage -= 1;
                this.isDeviceLoadAll = true;
              }
            } else {
              this.isDeviceLoadAll = false;
              isClear && this.$refs.deviceList && (this.$refs.deviceList.scrollTop = 0);
              list = data.data;
            }
          }
          this.SETNEWDATA(list,data.page)
          this.setDeviceList({ list, isClear });
        } else {
          error && error.msg && this.$Toast.show({ title: error.msg, position: "middle" });
          this.SETNEWDATA([])
          this.setDeviceList({ list: [], isClear });
          if (error && error.code && (error.code >= 500 || error.code < 0)) {
            this.isNetError = true;
          }
        }
      } catch (error) {
        this.isDeviceLoading = false;
      } finally {
        this.isDeviceLoading = false;
        this.setRequestTime();
        isRestoreScrollPos && this.setScroll();
      }
    },
    // 获取常用设备
    async getMostUseDevice(isClear, isReload = false) {
      try {
        this.isDeviceLoading = true;
        this.isNetError = false;
        let params = {
          pageSize: this.devicePage.pageSize,
          pageNum: this.devicePage.currentPage,
        };
        if (this.curDeviceCate && this.curDeviceCate.id > 0) {
          params.productCategoryId = this.curDeviceCate.id;
        }
        let { data, error } = await mostUsedDeviceRep(params);
        this.isDeviceLoading = false;
        if (data && !error) {
          let list = [];
          if (Array.isArray(data.data)) {
            data.data.map((v) => {
              if (!deviceMacShowInApp.includes(v.zigbeeTypeEnum)) {
                v["_hidden"] = true;
              }
            });
            list = data.data;
          }
          if (list.length && !isReload) {
            this.hasCommonlyList = true;
            this.setDeviceList({ list, isClear });
          } else {
            this.hasCommonlyList = list.length;
            this.setDeviceList({ list: [], isClear: true });
            this.$nextTick(() => {
              if (!isReload) {
                this.curRoom.id = 0;
              }
              this.curDeviceCate.id = (this.roomCateMap && this.roomCateMap[this.curRoom.id] && this.roomCateMap[this.curRoom.id].id) || 0;
              this.curDeviceCate.name = (this.roomCateMap && this.roomCateMap[this.curRoom.id] && this.roomCateMap[this.curRoom.id].name) || "所有设备";
              this.devicePage.currentPage = 1;
              this.getDeviceCate();
              this.getRoomDeviceList();
            });
          }
        } else {
          error && error.msg && this.$Toast.show({ title: error.msg, position: "middle" });
          this.setDeviceList({ list: [], isClear });
        }
      } catch (error) {
        this.isDeviceLoading = false;
        console.error(error);
      } finally {
        this.isDeviceLoading = false;
        this.setRequestTime();
        this.setScroll();
      }
    },
    async checkMostUseList() {
      let result = await mostUsedDeviceRep();
      this.hasCommonlyList = result && result.data && result.data.data && result.data.data.length;
      if (!this.hasCommonlyList && this.curRoom.id === -1) {
        this.curRoom.id = 0;
        this.curDeviceCate = {
          name: this.roomCateMap[this.curRoom.id].name,
          id: this.roomCateMap[this.curRoom.id].id,
        };
        this.getRoomDeviceList(true);
      }
    },
    // 获取设备分类
    async getDeviceCate(tag) {
      try {
        this.isLodingCate = true;
        let params = { usageType: "app" };
        if (this.curRoom && this.curRoom.id > 0) {
          params.roomId = this.curRoom.id;
        }
        if (this.curRoom.id === -1) {
          params.ifMostUsed = 1;
        }
        let { data, error } = await deviceCategoryRep(params);
        if (data && !error) {
          this.deviceCateList = data.data || [];
          let has = false;
          for (let item of this.deviceCateList) {
            if (item.id === this.roomCateMap[this.curRoom.id].id) {
              has = true;
              break;
            }
          }
          if (!has && this.roomCateMap[this.curRoom.id].id !== 0) {
            this.roomCateMap[this.curRoom.id].id = 0;
            this.roomCateMap[this.curRoom.id].name = "所有设备";
            this.curDeviceCate.id = 0;
            this.curDeviceCate.name = "所有设备";
            this.getRoomDeviceList(true);
          }
        } else {
          this.deviceCateList = [];
        }
      } catch (error) {
        this.isLodingCate = false;
      } finally {
        this.isLodingCate = false;
        this.setRequestTime();
      }
    },
    getData(isReload = false, isReloadMost = false, isRestoreScrollPos = false) {
      //isReloadMost 是否是要检查常用列表有没有数据， 有数据则显示常用列表
      if (isReloadMost && this.curRoom.id !== -1) {
        this.checkMostUseList();
      } else {
        this.devicePage = {
          currentPage: 1,
          pageSize: 30,
        };
        if (this.curRoom.id < 0) {
          this.getMostUseDevice(true, false);
        } else {
          this.getRoomDeviceList(true, isRestoreScrollPos);
          isReload && this.checkMostUseList();
          this.getDeviceCate(true);
        }
        this.getRoomList(true, isReload);
      }
      this.requestTimer = setTimeout(() => {
        this.$emit("loadDone");
        this.requestTimer && clearTimeout(this.requestTimer);
      }, 10000);
    },
    resetData() {
      this.scrollTop = 0;
      this.setDeviceList({ list: [], isClear: true });
      this.roomList = [];
      this.roomPage = {
        pageNum: 1,
        pageSize: 200,
      };
      this.isDeviceLoadAll = false;
      this.devicePage = {
        currentPage: 1,
        pageSize: 30,
      };
      this.curRoom = { id: -1 };
      this.deviceCateList = [];
      this.curDeviceCate = {
        name: "所有设备",
      };
      this.$nextTick(() => {
        this.getData();
      });
    },
    setRequestTime() {
      if (!this.isLodingCate && !this.isDeviceLoading && !this.isLoading) {
        this.$emit("loadDone");
      }
    },
    delDeviceItem(data) {
      if (!data || !data.dataId) return;
      if (this.curRoom.id <= 0) {
        // 如果是常用列表和全部，需要额外判断
        data.isUsuallyOrAll = true;
        this.deviceItemDetailAction(data);
        return;
      }
      for (let key in this.homeDeviceList4Mqtt) {
        if (Number(this.homeDeviceList4Mqtt[key].dataId) === Number(data.dataId)) {
          // P1S和P6的删除要删除附属继电器
          // 开关类要删除相同mac的开关
          if (
            this.homeDeviceList4Mqtt[key].zigbeeTypeEnum == "P1S" ||
            this.homeDeviceList4Mqtt[key].zigbeeTypeEnum == "P6" ||
            this.homeDeviceList4Mqtt[key].zigbeeTypeEnum == "P6Pro" ||
            this.homeDeviceList4Mqtt[key].zigbeeTypeEnum == "OnOffSwitch"
          ) {
            let keys = [];
            for (let subKeys in this.homeDeviceList4Mqtt) {
              if (this.homeDeviceList4Mqtt[subKeys].dataId !== data.dataId && this.homeDeviceList4Mqtt[subKeys].deviceMac === this.homeDeviceList4Mqtt[key].deviceMac) {
                keys.push(subKeys);
              }
            }
            if (keys.length) {
              for (let k of keys) {
                this.setDelDeviceItem(this.homeDeviceList4Mqtt[k]);
              }
            }
          }

          this.setDelDeviceItem(this.homeDeviceList4Mqtt[key]);
          break;
        }
      }
    },
  },
  computed: {
    ...mapGetters(["homeDeviceList4Mqtt", "homeAreaId"]),
  },
  watch: {
    homeAreaId(newV, oldV) {
      if (newV && newV !== oldV && oldV) {
        this.curDeviceCate = {
          name: "所有设备",
          id: 0,
        };
        this.curRoom = { id: -1 };
        this.roomCateMap = {};
        this.getRoomList(true);
        this.getMostUseDevice(true);
        this.getDeviceCate();
      }
    },
    homeDeviceList4Mqtt(newV, oldV) {
      let len = newV && Object.keys(newV).length;
      // 没有数据且设备分类不是所有的时候，需要检查所有分类里有没有数据，如果没有，跳到全部房间
      if (!len && !oldV) {
        if (this.curRoom.id === -1) {
          this.curDeviceCate.id = 0;
          this.curDeviceCate.name = "所有设备";

          this.getMostUseDevice(true);
        }
      }
    },
  },
  created() {
    this.getRoomList(true);
    this.getMostUseDevice(true);
    this.getDeviceCate();
    this.onListScroll = throttle(this.listScroll, 50);
    let that = this;
    window.WINGTO_H5.onH5DataChannel = (data) => {
      if (typeof data !== "string") return;
      try {
        let result = JSON.parse(data);
        console.log("onH5DataChannel:-->", result);
        if (result.type === 0) {
          // type: 0, 说明设备在常用列表有变化
          if (that.curRoom.id !== -1) {
            that.checkMostUseList();
          } else {
            that.getData(true, false, true);
          }
        } else if (result.type === 1 || result.type === 2) {
          that.getData(true, false, true);
        } else if (result.type === 3) {
          result.params && that.deviceItemDetailAction(result.params);
        } else if (result.type === 4) {
          result.params && that.delDeviceItem(result.params);
        }
        execNativeFunc("onDataChannel", null);
      } catch (error) {}
    };
  },
  mounted() {
    const node = document.querySelector(".room-wrap.stopMoveArea");
    let that = this;
    let timer = null;
    node.addEventListener("scroll", (e) => {
      that.$emit("scroll-x", true);
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        that.$emit("scroll-x", false);
        timer && clearTimeout(timer);
        timer = null;
      }, 300);
    });
  },
  beforeDestroy() {
    this.requestTimer && clearTimeout(this.requestTimer);
  },
  components: {
    deviceItem,
    deviceTypeModal,
    loadingComp,
    emptyComp,
    MultiwindowingItem
  },
};
</script>

<style lang="less" scoped>
.home-main {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #000;
  padding: 20px 0 0;
  border-radius: 40px 40px 0 0;
  background-color: #f0f0fd;
  display: flex;
  flex-direction: column;
  .room-list {
    position: relative;
    height: 60px;
    width: 100%;
    flex: 0 0 60px;
    line-height: 60px;
    overflow-y: hidden;
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    box-sizing: border-box;
    .room-wrap {
      width: 100%;
      height: 80px;
      white-space: nowrap;
      overflow-x: auto;
      flex: 1;
      .room-item {
        display: inline-block;
        margin-right: 32px;
        font-size: 32px;
        font-weight: 400;
        color: #c0c0cd;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        max-width: 240px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        &.active {
          font-size: 36px;
          font-weight: bold;
          color: #2f2f4a;
        }
      }
    }
    .menu {
      margin-top: 10px;
      width: 70px;
      height: 42px;
      line-height: 42px;
      border-radius: 22px;
      text-align: center;
      font-size: 30px;
      color: #2f2f4a;
      background: rgba(57, 60, 132, 0.12);
      margin-left: 40px;
    }
  }
  .pop {
    position: absolute;
    top: 0;
    right: 48px;
    width: 280px;
    height: 120px;
    background-color: #fff;
    z-index: 10;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.02);
    border-radius: 40px;
    font-size: 32px;
    color: #2f2f4a;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    outline: none;
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
    background: rgba(0, 0, 0, 0.5);
    z-index: 9;
  }
  .cate-btn {
    position: relative;
    width: 100%;
    padding: 0 40px;
    height: 100px;
    flex: 0 0 100px;
    box-sizing: border-box;
    margin: 40px 0;
    .category {
      width: 100%;
      height: 100px;
      background-color: #fff;
      border-radius: 50px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      font-size: 32px;
      font-weight: 400;
      color: #2f2f4a;
      .iconfont {
        font-size: 36px;
      }
    }
  }
  .device-list {
    position: absolute;
    left: 0;
    top: 260px;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    &.overflow {
      overflow: hidden;
    }
    .list-wrap {
      width: 100%;
      padding: 0 40px;
      -moz-column-count:2; /* Firefox */
       -webkit-column-count:2; 
       column-count: 2;
       column-gap: 2;
      // display: flex;
      // justify-content: space-between;
      // flex-wrap: wrap;
      box-sizing: border-box;
      // align-content: flex-start;
      > div.device-item {
        margin-bottom: 30px;
      }
    }
    .loading-wrap,
    .loading-all {
      height: 80px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      font-size: 24px;
      color: #c0c0cd;
    }
    .empty-wrap,
    .netError-wrap {
      height: 100%;
      box-sizing: border-box;
      padding-top: 100px;
    }
  }
}
</style>

<style lang="less">
.home-pop-show-enter-active,
.home-pop-show-leave-active {
  transition: all 0.2s;
}
.home-pop-show-enter,
.home-pop-show-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
