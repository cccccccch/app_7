<template>
  <div class="curtain-type">
    <title-bar :showRight="false" @goBack="goback">
      <template v-slot:title><p class="title title-bar">设备类型</p></template>
    </title-bar>
    <div class="main flex-ac-jb-dc">
      <div class="list flex-ac-jb" v-show="list && list.length">
        <div class="item flex-ac-jb-dc" v-for="(item, idx) of list" :key="idx" @click="onChooseItem(item)">
          <img :src="item.typeIconErr" class="pic" alt="" />
          <p class="name">{{ item.typeName }}</p>
          <span class="iconfont" :class="{ 'icon-check': item.id === chooseId }"></span>
        </div>
      </div>
      <div class="bot-btn flex-ac-jc" v-show="list && list.length" :class="{ active: !!chooseId && chooseId !== defaultTypeId }" @click="handleChangeType">
        <div v-show="isLoadingComfirm" class="loading-confirm">
          <loadingSvg color="#999" />
        </div>
        确认
      </div>
      <div class="loading-wrap" v-show="isLoadingList">
        <loadingMask />
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBar";
import { curtainBindTypeReq, deviceTypesListReq, deviceCateListByIdReq, endpointControlRep } from "../../../api/request";
import { mapGetters, mapActions } from "vuex";
import loadingMask from "../components/loading-mask.vue";
import loadingSvg from "../components/loading-svg.vue";
import { execNativeFunc } from "../../../utils/bridge";
import { EventBus } from "../eventbus/index";
export default {
  name: "CurtainType",
  data() {
    return {
      list: [],
      isLoadingList: false,
      chooseId: "",
      categoryId: "",
      isLoadingComfirm: false,
      defaultTypeId: ""
    };
  },
  methods: {
    ...mapActions(["deviceDetailAction"]),
    goback() {
      this.$router.back();
    },
    onChooseItem(item) {
      this.chooseId = item.id;
    },
    async getData() {
      this.isLoadingList = true;
      let result = await deviceCateListByIdReq({ productId: this.deviceDetail.deviceTypeId });
      if (result && !result.error) {
        const data = result.data.data;
        const id = data && data[0] && data[0].productExternalCategoryVoList && data[0].productExternalCategoryVoList[0] && data[0].productExternalCategoryVoList[0].id;
        if (!id) {
          this.isLoadingList = false;
          return;
        }
        this.categoryId = id;
        let res = await deviceTypesListReq({ externalCategoryId: id });
        this.isLoadingList = false;
        if (res && !res.error) {
          this.list = res.data.data || [];
        }
      } else {
        this.isLoadingList = false;
      }
    },
    async handleChangeType() {
      if (!this.chooseId || this.isLoadingComfirm || this.defaultTypeId === this.chooseId) return;
      let params = {
        categoryId: this.categoryId,
        deviceMac: this.deviceDetail.deviceMac,
        deviceTypeList: [this.chooseId],
        slotIndex: this.deviceDetail.endpointIndex
      };
      this.isLoadingComfirm = true;
      let result = await curtainBindTypeReq(params);
      this.isLoadingComfirm = false;
      if (result && !result.error) {
        let p = {
          cmdKey: "roll_curtains_set_attr",
          endpointId: this.globalDataId,
          cmdValue1: 6
        };
        await endpointControlRep(p);
        this.$Toast.show({ title: "绑定成功", postion: "middle" });
        EventBus.$emit("onBindType");
        this.deviceDetailAction();
        if (this.getCurtainMaxMinPoint !== 0b0011 && (this.globalDeviceStatus === 1 || this.globalDeviceStatus === 5)) {
          this.$router.push({ name: "CurtainCorrect", query: { slideWay: "left", isFromTypeChoose: true } });
        } else {
          this.goback();
        }
        EventBus.$emit("hideOptionPage");
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum
          }
        });
      } else {
        let msg = (result && result.error && result.error.msg) || "绑定失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    initData() {
      let has =
        this.deviceDetail &&
        this.deviceDetail.deviceBindInfoVoList &&
        this.deviceDetail.deviceBindInfoVoList[0] &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList[0];
      if (has && has.id) {
        this.defaultTypeId = has.id;
        this.chooseId = has.id;
      }
    }
  },
  mounted() {
    this.getData();
    this.initData();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "getCurtainMaxMinPoint", "globalDeviceStatus"])
  },
  components: {
    TitleBar,
    loadingMask,
    loadingSvg
  }
};
</script>
<style lang="less" scoped>
.curtain-type {
  background-color: #f0f0fd;
  width: 100vw;
  height: 100vh;
  .main {
    height: calc(100vh - 88px);
    position: relative;
    .list {
      height: calc(100% - 112px);
      overflow-y: auto;
      width: 100%;
      padding: 30px 40px;
      box-sizing: border-box;
      flex-wrap: wrap;
      align-content: flex-start;
      .item {
        width: 323px;
        height: 350px;
        background: #ffffff;
        box-shadow: 0px 30px 60px 0px rgba(0, 0, 0, 0.05);
        border-radius: 16px;
        box-sizing: border-box;
        padding: 60px 0 24px;
        margin-bottom: 24px;
      }
      .pic {
        width: 158px;
        height: 158px;
        background: #f1f1f3;
        border-radius: 40%;
      }
      .name {
        font-size: 32px;
        font-weight: bold;
        color: #2f2f4a;
      }
      .iconfont {
        height: 30px;
      }
      .icon-check {
        width: 30px;
        height: 30px;
        font-size: 20px;
        color: #fff;
        background-color: #6165c5;
        text-align: center;
        line-height: 30px;
        border-radius: 50%;
      }
    }
    .bot-btn {
      width: 100%;
      height: 112px;
      line-height: 112px;
      background-color: #fff;
      line-height: 112px;
      font-size: 32px;
      font-weight: bold;
      color: #6165c5;
      text-align: center;
      opacity: 0.5;
      .loading-confirm {
        width: 60px;
        height: 60px;
        margin-right: 10px;
      }
      &.active {
        opacity: 1;
        &:active {
          opacity: 0.8;
        }
      }
    }
    .loading-wrap {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
