<template>
  <div class="scenePage">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">设备所在场景</span></template>
    </title-bar>
    <div class="main">
      <div class="scene-item" v-for="(item, idx) of list" :key="idx" v-show="!isLoading">
        <p class="room-name">{{ item.roomName || "" }}</p>
        <img :src="item.sceneIconAbs" alt="" class="scene-bg" />
        <div>
          <p class="name">{{ item.sceneName }}</p>
          <p class="nums">{{ item.deviceCount }}台设备</p>
        </div>
      </div>
      <div v-show="isLoading" class="loading-wrap">
        <loading-comp maskColor="transparent" color="rgba(0,0,0,0.2)" />
      </div>
    </div>
  </div>
</template>
<script>
import titleBar from "../../components/titleBar";
import { deviceHasScenesRep } from "../../api/request";
import { mapGetters } from "vuex";
import loadingComp from "../../components/Loading";
export default {
  name: "scenePage",
  data() {
    return {
      list: [],
      isLoading: false,
    };
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    async getData() {
      this.isLoading = true;
      let { data, error } = await deviceHasScenesRep({ endpointId: this.deviceDetail.dataId });
      this.isLoading = false;
      if (data && !error) {
        this.list = data.data || [];
      }
    },
  },
  created() {
    this.getData();
  },
  computed: {
    ...mapGetters(["deviceDetail"]),
  },
  components: { titleBar, loadingComp },
};
</script>
<style lang="less" scoped>
.scenePage {
  background: #f2f2f6;
  display: flex;
  flex-direction: column;
  .title-area {
    flex: 0 0 88px;
    height: 88px;
    .title {
      font-size: 42px;
    }
  }
  .main {
    width: 100%;
    flex: 1;
    max-height: calc(100% - 88px);
    overflow-y: auto;
    .scene-item {
      position: relative;
      width: 100%;
      height: 340px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      .room-name {
        position: absolute;
        left: 40px;
        top: 40px;
        right: 75px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 32px;
        color: #ffffff;
        z-index: 3;
      }
      > img {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        top: 0;
        bottom: 0;
        height: 100%;
        z-index: 1;
      }
      > div {
        position: relative;
        z-index: 2;
        font-size: 36px;
        font-weight: bold;
        color: #ffffff;
        > p {
          text-align: center;
        }
        .nums {
          font-size: 28px;
          font-weight: 400;
          color: #ffffff;
          margin-top: 16px;
          opacity: 0.6;
        }
      }
    }
    .loading-wrap {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
