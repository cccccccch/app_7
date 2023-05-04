<template>
  <div id="onOffSwitchGroup" :class="{ active: isLightOn, offline: onLineValue !== 1 }">
    <TitleBarOnOffSwitchGroup :title="deviceDetail.deviceName" @handleScheduleTaskResult='handleScheduleTaskResult' @goBack="goback" optionType="light" />
    <!-- 开关 -->
    <div class="default" v-show="!isSence">
      <img src="../../../assets/images/light.png" class="light-img" alt="" />
      <img src="../../../assets/images/light_bot.png" class="light-img-bot" alt="" />
      <div class="light-box-wrap">
        <div class="light-box"></div>
      </div>
      <div class="bot-area">
        <div class="status">{{ isLightOn ? "ON" : "OFF" }}</div>
        <div class="switch-btn iconfont icon-switch" @click="clickSwitch"></div>
      </div>
    </div> 
    
    <!-- 情景 -->
    <div class="bind" v-show="isSence">
      <div class="light-pic-wrap">
        <img class="light-pic" src="../../../assets/images/switch-light.png" alt="" />
      </div>
      <div class="bot-area">
        <div class="add-btn-area" @click="clickBindScene" v-show="!isBindSence">
          <div class="add-btn iconfont icon-add"></div>
          <p class="add-tip">绑定智能</p>
        </div>
        <div class="bind-item-area" @click="onExecScene" v-CDTAP="handleLongPressSence" v-show="isBindSence">
          <span class="iconfont icon-scene-btn"></span>
        </div>
        <div class="switch-btn iconfont icon-switch" @click="clickSwitch" v-show="onOffSwithDeviceStatus !== 5"></div>
        <div class="scene-name" v-show="deviceDetail && deviceDetail.bindSceneName">
          <p class="name">{{ deviceDetail.bindSceneName }}</p>
          <p class="tip">点击执行智能，长按换绑智能</p>
        </div>
      </div>
    </div>
    <div class="loading-wrap" v-show="isLoading || isSceneLoading">
      <loadingComp :maskColor="isSceneLoading ? 'transparent' : ''" />
    </div>
    <Modal v-model="statusData.show" title="温馨提示" type="one" :content="statusData.content" okText="确认" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
  </div>
</template>
<script>
const DAY_MILES = 24 * 60 * 60 * 1000 // 单位天毫秒
const HOUR_MILES = 24 * 60 * 60 * 1000 // 单位小时毫秒
const MINUTE_MILES = 60 * 1000 // 单位分钟毫秒
import TitleBarOnOffSwitchGroup from "../components/titleBar";
import loadingComp from "../../../components/Loading";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters, mapMutations } from "vuex";
import { deviceDetailRep, groupDeviceListRep , endpointControlRep, execSceneRep, getDeviceScheduleTaskListRep } from "../../../api/request";
import { formatMQTTData } from "../../../utils/socketUtil";
import Modal from "../../../components/modals/modal/Modal";
// K051 K052 K053 TP玻璃开关 1 - 3
import { CDTAP } from "../../../directive/index"; 
// 1位
export default {
  name: "onOffSwitchGroup",
  directives: { CDTAP },
  data() {
    return {
      isDefault: false,
      isLightOn: false,
      onLineValue: 0,
      isOnLine: false,
      deviceDetail: {},
      isLoading: false,
      isSceneLoading: false,
      touchSceneData: {
        startTime: 0,
        endTime: 0,
        isMove: false,
        timer: null
      },
       latestTask: {
        time: 0,
        desc: "",
        operation: "关闭"
      },
      statusData: {
        content: "",
        show: false
      },
      isSceneType: false, // 是否是转情景的设备
      upgradeModal: false,
      upgradeContent: "发现新版本",
      hasNoticeUpgrade: false,
      hasNoticeDisable: false
    };
  },
  methods: {
    ...mapMutations([
      "setLightStatus",
      "setGlobalDeviceStatus",
      "setcurEndpointId",
      "setGlobalMac",
      "setDeviceDetail",
      "setChildMode",
      "setOnOffSwithDeviceStatus",
      "setOnOffSwitchMotorStrength",
      "setOnOffSwitchElectrifyStatus"
    ]),  
    ...mapMutations({  
      setOnOffSwtichScheduleTask: "schedule/setScheduleTask", 
      setOnOffSwtichNeedRefreshState: "schedule/setNeedRefreshState",
      setOnOffSwtichTimingDesc: "schedule/setTimingDesc",
    }),
    goback() {
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    handleLongPressSence(isLongPress) {
      if (isLongPress) {
        execNativeFunc("onVibrate", 50);
        this.onNavigateToBindScene();
      }
    },
    clickBindScene() {
      if (!this.isOnLine) {
        // if (!this.isOnLine || (this.isSceneType && !this.isLightOn)) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      this.onNavigateToBindScene();
    },
    onNavigateToBindScene() {
      this.setcurEndpointId(this.deviceDetail.dataId);
      this.$router.push({ name: "scenesList", query: { bindId: this.deviceDetail.bindSceneId, slideWay: "left" } });
    },
    handleRender(mData) {
   
      if (typeof mData.isLightOn === "boolean") {
        this.isLightOn = mData.isLightOn;
      }
      if (typeof mData.onLineValue === "number") {
        this.onLineValue = mData.onLineValue;
        this.setGlobalDeviceStatus(mData.onLineValue);
      }
      if (typeof mData.motorStrength === "number") {
        this.setOnOffSwitchMotorStrength(mData.motorStrength);
      }
      if (typeof mData.electrifyStatus === "number") {
        this.setOnOffSwitchElectrifyStatus(mData.electrifyStatus);
      }
      if (typeof mData.isOnLine === "boolean") {
        this.isOnLine = mData.isOnLine;
        if (!this.isOnLine) {
          this.isLightOn = false;
        } else {
          // ??
          // if (this.deviceDetail.ifSceneConvertedEnum === "yes") {
          //   this.isLightOn = true;
          // }
        }
      }
      if (typeof mData.isChildMode === "boolean") {
        this.isChildMode = mData.isChildMode;
        this.setChildMode(mData.isChildMode);
      }
      if (typeof mData.onOffSwithDeviceStatus === "number") {
        this.setOnOffSwithDeviceStatus(mData.onOffSwithDeviceStatus);
        this.isSceneType = mData.onOffSwithDeviceStatus > 0;
      }
    },
    async clickSwitch() {
      if (!this.isOnLine) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      this.isSceneLoading = true;
      let result = await endpointControlRep({
        endpointId: this.globalDataId,
        // cmdKey: "toggle"
        cmdKey: !this.isLightOn ? 'open' : 'close'
      });
      this.isSceneLoading = false;
      if (result && result.data) {
        this.isLightOn = !this.isLightOn;
      }
    },
    // 执行情景
    async onExecScene() {
      if (this.isSceneLoading) return;
      if (!this.isOnLine) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      this.isSceneLoading = true;
      let result = await execSceneRep({ sceneId: this.deviceDetail.bindSceneId });
      this.isSceneLoading = false;
      this.$Toast.show({ postion: "middle", title: result && result.data ? "执行成功" : "执行失败" });
    },
    async getData(isCheckStatus = false) {
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      
      this.isLoading = false;
      if (result && result.data) {
        const data = result.data.data;
        this.setGlobalMac(data.deviceMac);
        this.deviceDetail = data;
        this.isSceneType = data.ifSceneConvertedEnum === "yes";
        const mData = formatMQTTData(data);
        this.checkUpgrade(data);
        if (!mData.isOnLine && isCheckStatus) {
          this._showOfflineModal(mData.onLineValue);
        }
        this.setDeviceDetail(data);
        this.handleRender(mData);
      }
    }, // 非在线状态弹窗
    _showOfflineModal(value) {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      let txt = "暂时无法操作";
      let num = value;
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.statusData.content = txt;
      this.statusData.show = true;
    },
    checkUpgrade(data) {
      if (this.hasNoticeUpgrade) return;
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.hasNoticeUpgrade = true;
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
    },
    onUpgradeOk() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    onUpgradeCancel() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      } else {
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
   async handleScheduleTaskResult(value) {
     if(value === 1){
      //  如果是点击右上角，刷新数据
      this.isLoading = true;
         await this.getData(true);
         await this.getScheduleTask();

     }
 
    

      const alarmList = [...this.getOnOffSwitchScheduleTask]

        let latestTaskTime = 0; // 定时任务 最近一次执行时间戳 
        let dayText = ""; // 定时任务 描述 
        let operation = "关闭"; // 定时任务 动作 
        
        const const_week = {
      
          1: "周一 ",
          2: "周二 ",
          3: "周三 ",
          4: "周四 ",
          5: "周五 ",
          6: "周六 ",
          0: "周日 ",
        }; 
        /** 按键预约 */
        alarmList
          .filter(item => item.ifEnableEnum === "yes")
          .forEach(item => {
            // 星期几
            const day = new Date(item.cloudTimeMs).getDay();
            const { taskId, startTimeMs, minutes, taskTypeEnum, cloudTimeMs, taskRepeatTypeEnum, repeatDate } = item;
            // 当天00：00 时间
            const date = new Date(cloudTimeMs);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
 
            if (taskRepeatTypeEnum == "REPEAT") {
              let closeTime = 0;
              const target = repeatDate
                .split(",")
                .map(i => {
                  let order = ~~i < day ? ~~i + 7 : ~~i;
                  return {
                    day: i,
                    closeTime: date.getTime() + minutes * MINUTE_MILES + (order - day) * DAY_MILES
                  };
                })
                .sort((a, b) => a.closeTime - b.closeTime)
                .find(item => item.closeTime > cloudTimeMs);
              if (target) {
                closeTime = target.closeTime;
              }
              if (latestTaskTime > closeTime || (closeTime > cloudTimeMs && latestTaskTime == 0)) {
                latestTaskTime = closeTime;
                if (closeTime < date.getTime() + DAY_MILES) {
                  dayText = "";
                } else if (closeTime >= date.getTime() + DAY_MILES && closeTime < date.getTime() + DAY_MILES * 2) {
                  dayText = "明天";
                } else {
                  dayText = target ? const_week[target.day] : "";
                }
                operation = taskTypeEnum === "on" ? "开启" : "关闭";
              }
            }  else if (taskRepeatTypeEnum == "ONLY_ONE") {
              if ((latestTaskTime == 0 || latestTaskTime > date.getTime() + minutes * MINUTE_MILES) && date.getTime() + minutes * MINUTE_MILES > cloudTimeMs) {
                dayText = "";
                latestTaskTime = date.getTime() + minutes * MINUTE_MILES;
                operation = taskTypeEnum === "on" ? "开启" : "关闭";
              }
            }
          });
         if (latestTaskTime > 0) {
          this.latestTask.time = latestTaskTime;
          this.latestTask.operation = operation;
          this.latestTask.desc = dayText;
        } 

        if (latestTaskTime > 0) {
            // console.log('你进3',latestTaskTime)
          this.setOnOffSwtichTimingDesc(this.formatTimingTaskDesc(latestTaskTime, dayText, operation));
        } else {
            // console.log('你进4')
          this.setOnOffSwtichTimingDesc('')
        }
    },
    /**
     * 格式化定时页文案
     * @param {*} taskTime 最近一次任务时间
     * @param {*} desc 周期： 明天/周一周二
     * @param {*} operation 动作： 关闭/开启
     */
    formatTimingTaskDesc(taskTime, desc, operation) {
      const date = new Date(taskTime);
      const time = (date.getHours() + "").padStart(2, "0") + ":" + (date.getMinutes() + "").padStart(2, "0") + " ";
      return desc + time + operation;
    },
   async getScheduleTask() {
      let { data, error } = await getDeviceScheduleTaskListRep({
        endpointId: this.globalDataId
      });
      if (data && !error) { 
        const alarmList = data.data || []; // 所有任务列表
        alarmList.sort((a,b) => a.minutes - b.minutes)
        this.setOnOffSwtichScheduleTask(alarmList) 
      }
    },
  },
  created() {
    this.isLoading = true;
    this.getData(true);
     this.getScheduleTask();

  },
   

  activated() {
    if (sessionStorage.getItem("onoffswitch-reload") === "yes") {
      this.getData();
      sessionStorage.removeItem("onoffswitch-reload");
    }
    if (this.getOnOffSwitchNeedRefreshState) {
      this.getScheduleTask();
      this.setOnOffSwtichNeedRefreshState(0);
    }
  },
  // 情景页面回退回来刷新数据
  beforeRouteEnter(to, from, next) {
    // console.log("路由进入前调用", to, from, this)
    if (from && from.name === "scenesList") {
      // console.log('this:', this)
      sessionStorage.setItem("onoffswitch-reload", "yes");
    }
    next();
  },
  watch: {
    globalMattData(newV, oldV) {
 
      for (let i = 0; i < newV.length; i++) {
        if (newV[i].endpointIndex === -1 || newV[i].endpointIndex === this.deviceDetail.endpointIndex) {
          // console.log('watch globalMattData endpointIndex: ',this.deviceDetail.endpointIndex)
          //     console.log('watch globalMattData newV: ',newV[i])
          const mData = formatMQTTData(newV[i]);
          this.handleRender(mData);
        }
      }
    },
    getOnOffSwitchScheduleTask(newVal) { 
      this.handleScheduleTaskResult()
    }
  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "childMode", "onOffSwithDeviceStatus", "onOffSwitchMotorStrength"]),
    ...mapGetters({ 
      getOnOffSwitchNeedRefreshState: "schedule/getNeedRefreshState", 
      getOnOffSwitchScheduleTask: "schedule/getScheduleTask", 
    }),
    // 是否为情景
    isSence() {
      return this.isSceneType && this.onOffSwithDeviceStatus !== 0;
    },
    // 是否绑定了情景
    isBindSence() {
      return this.deviceDetail.bindSceneId && this.deviceDetail.bindSceneId != "-1";
    }
  },
  components: { TitleBarOnOffSwitchGroup, loadingComp, Modal }
};
</script>
<style lang="less" scoped>
#onOffSwitchGroup {
  position: relative;
  width: 100vw;
  overflow: hidden;
  height: 100vh;
  -webkit-user-select: none;
  user-select: none;
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;

  &.active {
    .default {
      .light-box {
        display: block !important;
      }
      .bot-area {
        .status {
          color: #000 !important;
        }
        .switch-btn {
          color: #2F2F4A !important;
          box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16) !important;
        }
      }
    }
    .bind {
      .bot-area {
        position: relative;
        .add-btn,
        .switch-btn {
          color: #2F2F4A !important;
          box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16) !important;
        }
        .add-btn,
        .bind-item-area {
          color: #d7a468 !important;
          box-shadow: 0px 0px 30px 0px rgba(215, 164, 104, 0.3) !important;
        }
        
      }
    }
  }
  &.offline {
    .bind {
      .bot-area {
        .add-btn {
          color: #c0c0cd !important;
          box-shadow: 0px 0px 30px 0px rgba(192, 192, 205, 0.2) !important;
        }
        .bind-item-area {
          box-shadow: 0px 0px 30px 0px rgba(192, 192, 205, 0.2) !important;

          color: #c0c0cd !important;
        }
        .scene-name {
          color: #c0c0cd; 
        }
        .switch-btn {
          color: #c0c0cd !important;
          box-shadow: 0px 0px 4vw 0px rgb(192 192 205 / 20%) !important;
        }
      }
    }
  }
 
  .default {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    flex-direction: column-reverse;
    padding-bottom: 80px;
    .light-img {
      position: absolute;
      width: 324px;
      height: 310px;
      top: 110px;
      left: 80px;
      z-index: 3;
    }
    .light-img-bot {
      position: absolute;
      width: 324px;
      top: 390px;
      height: 24px;
      left: 80px;
      z-index: 1;
    }
    .light-box-wrap {
      position: absolute;
      top: 380px;
      left: 40px;
      width: 400px;
      height: 300px;
      overflow: hidden;
      border-radius: 18%;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      z-index: 2;
      display: flex;
      justify-content: center;
      background-color: transparent;
      padding-top: 10px;
    }
    .light-box {
      display: none;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      box-shadow: 0px 0px 100px 70px #faca63;
    }
    .bot-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-sizing: border-box;
      padding: 0 60px 0 86px;
      .status {
        font-size: 80px;
        font-weight: bold;
        color: #c0c0cd;
      }
      .switch-btn {
        width: 140px;
        height: 140px;
        background: #ffffff;
        border-radius: 50%;
        text-align: center;
        line-height: 140px;
        font-size: 52px;
        color: #c0c0cd;
        box-shadow: 0px 0px 30px 0px rgba(192, 192, 205, 0.2);
        &:active {
          box-shadow: 0px 0px 20px 0px rgba(216, 2, 0, 0.1);
        }
      }
    }
  }
  .bind {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    display: flex;
    justify-content: space-between;
    flex-direction: column-reverse;
    .light-pic-wrap {
      position: absolute;
      top: 60px;
      left: 130px;
      width: 260px;
      height: 630px;
      overflow: hidden;
      .light-pic {
        width: 260px;
        height: 630px;
      }
    }
    .bot-area {
      display: flex;
      flex-direction: row-reverse;
      box-sizing: border-box;
      padding-right: 60px;
      padding-bottom: 80px;
      .add-btn,
      .switch-btn,
      .bind-item-area {
        width: 140px;
        height: 140px;

        background: #ffffff;
        box-shadow: 0px 0px 30px 0px rgba(192, 192, 205, 0.2);
        border-radius: 50%;
        text-align: center;
        line-height: 140px;
        font-size: 52px;
        color: #c0c0cd;
      }
      .add-btn {
        margin-left: 36px;
        color: #d7a468;
        box-shadow: 0px 0px 30px 0px rgba(215, 164, 104, 0.3);
      }

      .bind-item-area {
        color: #d7a468;
        box-shadow: 0px 0px 30px 0px rgba(215, 164, 104, 0.3);
      }
      .add-btn-area {
        position: relative;
        .add-tip {
          position: absolute;
          left: 0;
          right: 0;
          top: 160px;
          padding-left: 36px;
          font-size: 24px;
          font-weight: 400;
          color: #797979;
          width: 140px;
          text-align: center;
        }
      }
      .bind-item-area {
        margin-left: 36px;
        .icon-scene-btn {
          font-size: 52px;
        }
      }
      .scene-name {
        position: absolute;
        left: 40px;
        bottom: 80px;
        height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #2f2f4a;
        .name {
          font-size: 40px;
          font-weight: bold;
          margin-bottom: 20px;
          max-width: 7em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tip {
          font-size: 20px;
          font-weight: 400;
          opacity: 0.6;
        }
      }
    }
  }
  .loading-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
