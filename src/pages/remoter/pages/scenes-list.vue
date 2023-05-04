<template>
  <div class="scenes-list">
<!--    <title-bar @goBack="goBack" :showRighttext='true' class="title-area">-->
<!--    <template v-slot:left><span class="title">选择要绑定的场景</span></template>    &lt;!&ndash;     v-show="bindSceneId != '' "  &ndash;&gt;-->
<!--    <template v-slot:title><span class="unbind-btn" v-show="bindSceneId > 0" @click="unbindModal = true">解除绑定</span></template>-->
<!--    </title-bar>-->
    <title-bar @goBack="goBack" :showRighttext='true'  class="title-area">
      <template v-slot:title><span class="title">选择要绑定的场景</span></template>
      <template v-slot:right><span class="unbind-btn" v-show="bindSceneId > 0" @click="unbindModal = true">解除绑定</span></template>
    </title-bar>

    <div class="main scenes-list-main">
      <div class="scene-item" v-for="(item, idx) of sceneList" @click="onChooseScene(item)" :key="idx">
        <img :data-src="getImgUrl(item)" class="scene-bg lazy-image" />
        <div class="scene-info">
          <p class="scene-name">{{ item.sceneName }}</p>
          <p class="device-num">{{ item.deviceCount }}台设备</p>
        </div>
        <span class="iconfont icon-check" v-show="item.sceneId === bindSceneId"></span>
      </div>
      <div class="empty-wrap" v-show="!sceneList || !sceneList.length">
        <empty :type="3" tips="暂时没有任何场景" />
      </div>
      <div class="loadend" v-show="!isLoading && sceneList && sceneList.length > 0">已经全部加载完毕</div>
    </div>
    <Modal v-model="unbindModal" title="温馨提示" content="解除绑定后开关将不能控制该情景" okText="确认" @on-ok="onConfirm" />
  </div>
</template>
<script>
import { sceneListRep, bindSceneRep,endpointControlRep,indexBindSceneRep } from "../../../api/request";
import LazyImage from "../../../utils/lazyImage";
import titleBar from "../../../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import empty from "../../../components/status/empty";
import { mapGetters,mapMutations } from "vuex";
import { execNativeFunc } from "../../../utils/bridge";
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
      isLoading: false,
      originList: [],
      sourceDataId:"",
      deviceIndex:"",
      roomId:""
    };
  },
  methods: {
    ...mapMutations([ 
      "setOnOffSwitchElectrifyStatus"
    ]),
    getImgUrl(data) {
      let url = data.sceneIconAbs || "";
      if (data.pictureHasUrlVoList && data.pictureHasUrlVoList.length) {
        for (let item of data.pictureHasUrlVoList) {
          if (item.sizeTypeEnum === "vertical") {
            url = item.url;
            break;
          }
        }
      }
      return url;
    },
    goBack() {
      this.$router.back();
    },
    onConfirm() {
      this.handleUnbind();
    },
    async handleUnbind() {
      let { data, error } = await indexBindSceneRep({ endpointId: this.curEndpointId, sceneId: -1,sourceDataId:this.sourceDataId,sourceDataTypeEnum:"endpoint",deviceIndex: this.deviceIndex, });
      if (data && !error) {
        this.bindSceneId = "";
        // execNativeFunc("onDataChannel", {
        //   type: 3,
        //   params: {
        //     dataId: this.globalDataId,
        //     dataTypeEnum: this.deviceDetail.dataTypeEnum,
        //   },
        // });

        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.globalDeviceType,
          },
        });
        this.goBack();
      } else {
        this.$Toast.show({ title: (error && error.msg) || "解绑失败" });
      }
    },
    async onChooseScene(item) {
      this.bindSceneId = item.sceneId;
      //alert("onChooseScene:this.deviceIndex="+this.deviceIndex);
      let { data, error } = await indexBindSceneRep({ deviceIndex: this.deviceIndex, sceneId: item.sceneId,sourceDataId:this.sourceDataId,sourceDataTypeEnum:"endpoint" });
      if (data && !error) {
        execNativeFunc("onDataChannel", {
          type: 3,
          params: {
            dataId: this.globalDataId,
            dataTypeEnum: this.globalDeviceType,
          },
        });
        // if(this.onOffSwitchElectrifyStatus !== 255) {
        //    const cmdKey = 'set_startup_memory'
        //   const params = {
        //     endpointId: this.globalDataId,
        //     cmdKey: cmdKey, 
        //   }; 
        //   let { error } = await endpointControlRep(params);
        //   if(!error) {
        //       this.setOnOffSwitchElectrifyStatus(255)
        //   } 
        //   // this.$Toast.show({ title: "设备关联场景后继电器状态将切换为断电记忆，且不可进行配置" });
        // }
        
        // this.goBack();
          // this.$router.push({ name: "remoter", query: {  slideWay: "left" } });
      } else {
        this.$Toast.show({ title: (error && error.msg) || "绑定失败" });
      }
    },
    async getData() {
      this.isLoading = true
      let query = { typeEnum: "appOperate" }
      if(this.roomId){
        query.roomId = this.roomId
      }
      let { data, error } = await sceneListRep(query);
      if (data && !error) {
        let list = data.data || [];
        this.sceneList = list.splice(0, 10);
        let timer = setTimeout(() => { 
          this.sceneList = this.sceneList.concat(list);
          this.$nextTick(() => {
            this.isLoading = false
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
    this.deviceIndex = this.$route.query.deviceIndex;
    console.log("activated",this.$route.query.bindId,this.bindSceneId,this.$route.query.deviceIndex,this.deviceIndex)
    let list = this.originList || [];
    this.isLoading = true
    let timer = setTimeout(() => {
      this.sceneList = this.sceneList.concat(list);
      this.$nextTick(() => {
        this.isLoading = false
        new LazyImage(".lazy-image", ".scenes-list-main");
      });
      timer && clearTimeout(timer);
    }, 500);
  },

  //------ remoter 传参数过来，调用此方法
  watch: {
    $route(to, from) {
      this.bindSceneId = Number(this.$route.query.bindId || "");
      this.sourceDataId =  Number(this.$route.query.sourceDataId || "")
      //alert("this.$route.query.deviceIndex:"+this.$route.query.deviceIndex)
      this.deviceIndex = this.$route.query.deviceIndex;
      this.getData();
    },
  },
  ////-------- 这个只在第一次才执行，后面不在执行
  created() {
    this.roomId = Number(this.$route.query.roomId ||"")
    console.log(this.roomId,'rID');
    this.bindSceneId = Number(this.$route.query.bindId || "");
    this.sourceDataId =  Number(this.$route.query.sourceDataId || "")
    this.deviceIndex = this.$route.query.deviceIndex;
    this.getData();
  },
  computed: {
    ...mapGetters(["curEndpointId", "globalDeviceType",'globalDataId','onOffSwitchElectrifyStatus']),
  },
  
  components: {
    titleBar,
    Modal,
    empty,
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
    box-sizing: border-box;
    padding-left: 40px;
    .scene-item {
      position: relative;
      width: 320px;
      height: 380px;
      background-size: cover;
      display: inline-block;
      overflow: hidden;
      margin-right: 30px;
      margin-bottom: 30px;
      border-radius: 20px;
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
      .scene-info {
        position: absolute;
        width: 100%;
        z-index: 2;
        bottom: 0;
        left: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%);
        box-sizing: border-box;
        padding: 20px;
        .scene-name {
          font-size: 32px;
          font-weight: bold;
          line-height: 1.2;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .device-num {
          margin-top: 16px;
          line-height: 1;
          font-size: 28px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.8);
        }
      }
      .iconfont {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background-color: #6165c5;
        text-align: center;
        line-height: 46px;
        font-size: 21px;
        transform: translate(-50%, -50%);
      }
    }
    .empty-wrap {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loadend {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2F2F4A;
      padding-right: 40px;
      padding-bottom: 24px;
      font-size: 28px;
      font-weight: bold;
    }
  }
}
</style>
