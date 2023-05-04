<template>
  <div class="device-room">
    <title-bar @goBack="goBack" class="title-area" @saveEq='onchooseFinish' :showRighttext='true'>
      <template v-slot:title><span class="title">设备房间</span></template>
      <!-- <template v-slot:right><span class="btn" @click="onchooseFinish">完成</span></template> -->
    </title-bar>
    <div class="main">
      <p class="tips">选择要将设备移入的所在房间</p>
      <div class="list">
        <p class="cur-room">当前所在房间：{{ roomName }}</p>
        <div class="list-item" v-for="(item, idx) of roomList" :key="idx" @click="onSelectRoom(item)">
          <span>{{ item.roomName }}</span>
          <span class="iconfont icon-check" v-show="item.id === selectId"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import titleBar from "../../components/titleBar";
import { homeRoomListRep, updDeviceRoomRep } from "../../api/request";
import { mapGetters, mapActions, mapMutations } from "vuex";
import { execNativeFunc } from "../../utils/bridge";
export default {
  name: "deviceRoom",
  data() {
    return {
      roomList: [],
      selectId: "",
      oriSelected: "" // 最开始的房间id
    };
  },
  methods: {
    ...mapActions(["deviceDetailAction"]),
    ...mapMutations(["setDeviceDataModify", "setDeviceDelFromCurHomeList"]),
    onSelectRoom(item) {
      this.selectId = item.id;
    },
    goBack() {
      this.$router.back();
    },
    async onchooseFinish() {
      if (this.selectId === this.globalFamilyId || !this.selectId) {
        this.goBack();
      } else {
        let { data, error } = await updDeviceRoomRep({
          dataId: this.globalDataId,
          roomId: this.selectId,
          dataTypeEnum: this.deviceDetail.dataTypeEnum
        });
        if (data && !error) {
          this.deviceDetailAction();
          this.goBack();
          execNativeFunc("onDataChannel", {
            type: this.oriSelected === this.selectId ? 3 : 2,
            params: {
              dataId: this.globalDataId,
              dataTypeEnum: this.deviceDetail.dataTypeEnum
            }
          });
          this.setDeviceDelFromCurHomeList(this.oriSelected !== this.selectId);
        } else {
          this.selectId = this.deviceDetail.goalDeviceRoomId;
          this.$Toast.show({ title: (error && error.errorMsg) || "修改失败" });
        }
      }
    },
    async getRoomList() {
      let { data, error } = await homeRoomListRep({ familyId: this.globalFamilyId, contanisDevice: false });
      if (data && !error) {
        this.roomList = data.data || [];
      } else {
        this.$Toast.show({ title: error.errorMsg || "获取列表失败" });
      }
    }
  },
  created() {
    this.getRoomList();
    this.selectId = this.deviceDetail.goalDeviceRoomId;
    this.oriSelected = this.deviceDetail.goalDeviceRoomId;
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalFamilyId", "globalDataId"]),
    roomName() {
      let name = "";
      for (let item of this.roomList) {
        if (item.id === this.selectId) {
          name = item.roomName;
          break;
        }
      }
      return name;
    }
  },
  components: {
    titleBar
  },
  deactivated() {
    this.selectId = "";
  },
  activated() {
    this.getRoomList();
    this.selectId = this.deviceDetail.goalDeviceRoomId;
  }
};
</script>
<style lang="less" scoped>
.device-room {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2f2f6;
  .title-area {
    flex: 0 0 88px;
    height: 88px;
    .title {
      font-size: 36px;
      font-weight: 600;
      color: #000000;
    }
    .btn {
      font-size: 30px;
      font-weight: bold;
      color: #4289ff;
    }
  }
  .main {
    flex: 1;
    overflow-y: auto;
    .tips {
      height: 112px;
      line-height: 112px;
      font-size: 30px;
      font-weight: 400;
      text-align: center;
      color: #959495;
    }
    .list {
      width: 100%;
      background: #ffffff;
      margin-bottom: 40px;
      .cur-room {
        height: 112px;
        line-height: 112px;
        font-size: 32px;
        font-weight: 400;
        color: #ff425d;
        padding: 0 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .list-item {
        border-top: 2px solid rgba(0, 0, 0, 0.02);
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 112px;
        box-sizing: border-box;
        padding: 0 40px;
        font-size: 32px;
        font-weight: 400;
        color: #121212;
        .iconfont {
          color: #4289ff;
          font-size: 32px;
        }
      }
    }
  }
}
</style>
