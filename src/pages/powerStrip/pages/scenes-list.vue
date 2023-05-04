<template>
  <div class="scenes-list">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">选择要绑定的情景</span></template>
      <template v-slot:right><span class="unbind-btn" v-show="bindSceneId" @click="unbindModal = true">解除绑定</span></template>
    </title-bar>
    <div class="main scenes-list-main">
      <div class="scene-item" v-for="(item, idx) of sceneList" @click="onChooseScene(item)" :key="idx">
        <img :data-src="item.sceneIconAbs" class="scene-bg lazy-image" />
        <span class="room-name">{{ item.roomName }}</span>
        <div class="scene-info">
          <p class="scene-name">{{ item.sceneName }}</p>
          <p class="device-num">{{ item.deviceCount }}台设备</p>
          <span class="iconfont icon-check" v-show="item.sceneId === bindSceneId"></span>
        </div>
      </div>
    </div>
    <Modal v-model="unbindModal" title="温馨提示" content="解除绑定后开关将不能控制该情景" okText="确认" @on-ok="onConfirm" />
  </div>
</template>
<script>
import { sceneListRep, bindSceneRep } from "../../../api/request";
import LazyImage from "../../../utils/lazyImage";
import titleBar from "../../../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import { mapGetters } from "vuex";
export default {
  name: "scenes-list",
  data() {
    return {
      sceneList: [],
      bindSceneId: "",
      page: {
        curPage: 1,
      },
      unbindModal: false,
      originList: [],
    };
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    onConfirm() {
      this.handleUnbind();
    },
    async handleUnbind() {
      let { data, error } = await bindSceneRep({ endpointId: this.curEndpointId, sceneId: -1 });
      if (data && !error) {
        this.bindSceneId = "";
        this.goBack();
      } else {
        this.$Toast.show({ title: (error && error.msg) || "解绑失败" });
      }
    },
    async onChooseScene(item) {
      this.bindSceneId = item.sceneId;
      let { data, error } = await bindSceneRep({ endpointId: this.curEndpointId, sceneId: item.sceneId });
      if (data && !error) {
        this.goBack();
      } else {
        this.$Toast.show({ title: (error && error.msg) || "绑定失败" });
      }
    },
    async getData() {
      let { data, error } = await sceneListRep({ typeEnum: "appOperate" });
      if (data && !error) {
        let list = data.data || [];
        this.sceneList = list.splice(0, 10);
        let timer = setTimeout(() => {
          this.sceneList = this.sceneList.concat(list);
          this.$nextTick(() => {
            new LazyImage(".lazy-image", ".scenes-list-main");
          });
          timer && clearTimeout(timer);
        }, 300);
      }
    },
  },
  deactivated() {
    this.bindSceneId = "";
    this.originList = this.sceneList.splice(10, this.sceneList.length);
    this.sceneList = this.sceneList.splice(0, 10);
  },
  activated() {
    this.bindSceneId = Number(this.$route.query.bindId || "");
    let list = this.originList || [];
    let timer = setTimeout(() => {
      this.sceneList = this.sceneList.concat(list);
      this.$nextTick(() => {
        new LazyImage(".lazy-image", ".scenes-list-main");
      });
      timer && clearTimeout(timer);
    }, 500);
  },
  created() {
    this.bindSceneId = Number(this.$route.query.bindId || "");
    this.getData();
  },
  computed: {
    ...mapGetters(["curEndpointId"]),
  },
  components: {
    titleBar,
    Modal,
  },
};
</script>
<style lang="less" scoped>
.scenes-list {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
  .title-area {
    flex: 0 0 88px;
    .title {
      font-size: 36px;
      font-weight: 600;
      color: #000000;
    }
    .unbind-btn {
      font-size: 30px;
      font-weight: bold;
      color: #4289ff;
    }
  }
  .main {
    color: #fff;
    flex: ~"0 0 calc(100% - 88px)";
    overflow-y: auto;
    .scene-item {
      position: relative;
      width: 100vw;
      height: 56vw;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      overflow: hidden;
      &::after {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        z-index: 1;
        content: "";
        background-color: rgba(0, 0, 0, 0.2);
      }
      .scene-bg {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
      }
      .room-name {
        position: absolute;
        left: 40px;
        top: 40px;
        font-size: 32px;
        font-weight: 400;
        z-index: 2;
      }
      .scene-info {
        position: relative;
        width: 100%;
        z-index: 2;
        .scene-name {
          text-align: center;
          font-size: 40px;
          font-weight: bold;
          line-height: 1;
        }
        .device-num {
          margin-top: 10px;
          line-height: 1;
          text-align: center;
          font-size: 28px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.8);
        }

        .iconfont {
          position: absolute;
          left: 50%;
          bottom: -70px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgb(179, 15, 15);
          text-align: center;
          line-height: 32px;
          font-size: 16px;
          transform: translateX(-50%);
        }
      }
    }
  }
}
</style>
