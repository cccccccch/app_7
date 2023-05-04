<template>
  <div class="bind">
    <titleBarEq @goBack="goBack" @saveEq="saveEq(rowdata)" class="title-area" :showRighttext="true" :showRight="false">
      <template v-slot:title><span class="title">请选择绑定的设备</span></template>
    </titleBarEq>
    <div class="bodybing">
      <div class="seletitle">
        <div class="titletext" >全部</div>
        <van-icon @click="showroom = true" name="arrow-down" color="#000000" size="25" />
      </div>

      <div class="device-type-modal" v-if="showroom" @touchstart.stop @touchmove.stop @touchend.stop>
        <div class="mask"></div>
        <transition name="fade">
          <div class="main">
            <!-- <p class="name">
              <span class="text">楼层</span>
              <span class="iconfont icon-up"></span>
            </p>
            <div class="list">
              <span class="item" :class="{ active: cateId === 0 }">全部</span>

            </div> -->
            <p class="name">
              <span class="text">房间</span>
              <span class="iconfont icon-up" @click="showroom = false"></span>
              <!-- <span class="iconfont icon-up"></span> -->
            </p>
            <div class="list">
              <span class="item" :class="{ active: cateId === 0 }" @click="getlistall(0)">全部</span>
              <span class="item" :class="{ active: cateId === item.id }" v-for="(item, idx) of roomList" :key="idx" @click="getlistall(item.id)">{{ item.roomName }}</span>
            </div>
          </div>
        </transition>
      </div>

      <div class="flex">
        <div :class="{ active: isActive == 'all' }" @click="changecheck('all')" class="sele">全部</div>
        <div :class="{ active: isActive == 'light' }" @click="changecheck('light')" class="sele">灯组</div>
        <div :class="{ active: isActive == 'curtain' }" @click="changecheck('curtain')" class="sele">窗帘</div>
      </div>
      <div class="listflex">
        <div class="list" v-for="(d, i) in deviceList" :key="d.dataId" @click="checkitem(d, i)">
          <div>{{ d.goalDeviceRoomName }}</div>

          <img class="img" :src="d.typeIconUrlAbs" alt="" />
          <div class="text">{{ d.deviceName }}</div>
          <div class="checkimg">
            <img v-if="d.dataId === bingId" class="checkimg" src="../../../../src/assets/images/k05.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import titleBarEq from "../../../components/titleBar";
import { deviceListRep, homeRoomListRep, deviceListlightRep, indexBindSceneRep,bindDeviceKxReq } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "BindEq",
  data() {
    return {
      isActive: "all",
      deviceList: [],
      cateId: 0,

      roomList: [],
      roomCateMap: {},
      showroom: false,
      deviceDetail: {},
      bingId: "",
      rowdata: {},
      roomId:'',
    };
  },
  created() {
    this.getlistcurtain('all');
    this.getRoomList();
    this.deviceDetail = this.$route.query;
    this.bingId = this.deviceDetail.knobeBindEndpoint.dataId || '';
    console.log(this.deviceDetail, "设备");
  },

  methods: {
    getlistall(val){
      this.cateId = val;
      this.roomId = val !== 0 ? val : ""
      this.getlistcurtain(this.isActive);
    },
    async saveEq(row) {

      let { data, error } = await bindDeviceKxReq({
        sourceDataId: this.deviceDetail.dataId,
        sourceDataTypeEnum: "endpoint",
        targetDataId: row.dataId,
        targetDataTypeEnum: row.dataTypeEnum,
              //  deviceIndex: this.deviceDetail.endpointIndex,
      });
      if (data && !error) {
          this.$router.push({ name: "onOffSwitch", query: { slideWay: "left" } });
        
      }
    },
    // onChoose(item) {
    //   this.cateId = item.id;
    // },
    // 获取房间列表

    async getRoomList(row) {
      try {
        // this.isLoading = true;

        let { data, error } = await homeRoomListRep();
        // this.isLoading = false;
        if (data && !error) {
          this.roomList = data.data;
          console.loh("this.roomListthis.roomList", this.roomList);
        }
      } catch (error) {}
    },
    changecheck(value) {
      this.isActive = value;
      this.getlistcurtain(value);
    },
    // ...mapMutations(["setOnOffSwithDeviceStatus"]),
    async getlistcurtain(value) {
      if (value === "all") {
        let result = await deviceListRep({ iconBackground: "black", zigbeeTypeEnum: "WindowCover",roomId:this.roomId });
        let result2 = await deviceListlightRep({roomId:this.roomId});
        var windowarr = result.data.data;
        var lightarr = result2.data.data;

        lightarr.forEach((element) => {
          windowarr.push(element);
        });
        this.deviceList = windowarr;
      } else if (value === "light") {
        let result2 = await deviceListlightRep({roomId:this.roomId});
        this.deviceList = result2.data.data;
      } else {
        let result = await deviceListRep({ iconBackground: "black", zigbeeTypeEnum: "WindowCover",roomId:this.roomId });
        this.deviceList = result.data.data;
      }
    },
    goBack() {
      this.$router.back();
    },
    checkitem(d, i) {
      this.rowdata = d;
      this.bingId = d.dataId;
    },
  },

  watch: {},

  computed: {},
  components: {
    titleBarEq,
  },
};
</script>
<style lang="less" scoped>
.bind {
  background: #f0f0fd;

  .title-area {
    position: relative;
    flex: 0 0 88px;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: 600;
      color: #000000;
    }
  }
  .bodybing {
    padding: 40px 40px 0 40px;
    .device-type-modal {
      position: absolute;
      top: 160;
      right: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 0 40px 0;
      z-index: 9;
      .mask {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .main {
        width: 100%;
        padding: 40px 40px 60px 40px;
        background: #fff;
        box-sizing: border-box;
        border-radius: 40px;
        z-index: 2;
        .name {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          font-size: 32px;

          .text {
            color: #2f2f4a;
            opacity: 0.3;
            font-weight: 500;
          }
          .iconfont {
            font-size: 32px;
            color: #444464;
            opacity: 1;
          }
        }
        .list {
          max-height: 392px;
          overflow-y: auto;
          .item {
            display: inline-block;
            padding: 26px 34px;
            background: #f1f1f3;
            border-radius: 10px;
            font-size: 26px;
            font-weight: 400;
            color: #5e5e83;
            margin-right: 24px;
            margin-bottom: 24px;
            &.active {
              background-color: #6165c5;
              color: #fff;
            }
          }
        }
      }
      .fade-enter-active {
        transition: all 0.2s ease-in-out;
      }
      .fade-leave-active {
        transition: all 0.2s ease-in-out;
      }
      .fade-enter,
      .fade-leave-to {
        transform: scale(0.8);
        opacity: 0;
      }
    }
    .listflex {
      display: flex;
      flex-wrap: wrap;
      justify-content: left;
      flex-direction: row;
      justify-content: space-between;
      align-content: space-between;
      .list {
        background: #ffffff;
        box-shadow: 0px 30px 60px rgba(0, 0, 0, 0.05);
        border-radius: 16px;
        width: 323px;
        height: 364px;
        margin-top: 20px;
        box-sizing: border-box;
        padding: 20px 20px;
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        line-height: 32px;
        /* identical to box height, or 133% */
        color: #5e5e83;
        .img {
          width: 158px;
          height: 158px;
          margin-left: 60px;
          margin-top: 20px;
        }
        .checkimg {
          width: 30px;
          height: 30px;
          text-align: center;
          margin: auto;
        }
        .text {
          text-align: center;
          font-family: "PingFang SC";
          font-style: normal;
          font-weight: 500;
          font-size: 28px;
          line-height: 32px;
          /* identical to box height, or 100% */
          height: 65px;
          text-align: center;
          margin-top: 10px;
        }
      }
    }

    .flex {
      display: flex;
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 32px;
      line-height: 100%;
      color: #c0c0cd;
      flex: none;
      order: 1;
      flex-grow: 0;
      padding-top: 50px;

      box-sizing: border-box;
      .sele {
        padding-right: 40px;
      }
      .sele.active {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 100%;
        /* identical to box height, or 32px */

        color: #2f2f4a;

        /* Inside auto layout */

        flex: none;
        order: 0;
        flex-grow: 0;
      }
    }
    .seletitle {
      width: 670px;
      height: 100px;
      display: flex;
      justify-content: space-between;
      background: #fcfcff;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.02);
      border-radius: 50px;
      padding: 0 40px;
      box-sizing: border-box;
      align-items: center;
      .titletext {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 32px;
        line-height: 100px;
        /* identical to box height, or 100% */

        color: #2f2f4a;
      }
    }
  }
}
</style>
