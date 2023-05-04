<template>
  <div id="onOffSwitch" :class="{ active: isLightOn, offline: onLineValue !== 1 }" v-if="!isShowCom">
    <title-bar2 :title="deviceDetail.deviceName" @goBack="goback" optionType="light" />

    <!-- 没有打开关联智能情况下的开关 -->
    <div class="default" v-show="!isSence ">
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

    <!-- //k5系列 && 打开 关联智能-->
    <div v-if="deviceTypeCodeK5X && isSence ">

      <!-- 关灯状态 && 没有绑定 设备或场景,点击 + 弹出菜单 v-CDTAP="onpop"  && !deviceDetail.knobeBindEndpoint-->
      <div class="k5xoff" v-if="!isLightOn && !(isBindEqForK5X||isBindSence)" >
        <van-icon @click="onpop"  name="plus" />
      </div>

      <!-- 开灯状态 && 没有绑定 设备或场景,点击 + 弹出菜单 -->
      <div class="k5x" v-if="isLightOn && !(isBindEqForK5X||isBindSence)"  >
        <van-icon @click="onpop"   name="plus" />
      </div>

      <!-- 绑定设备 -->
      <img class="k5x" v-CDTAP="onpop" v-if="isBindEqForK5X && !isBindSence" :src="deviceDetail.knobeBindEndpoint.statecIconUrlAbs" alt="" />

      <!-- 绑定情景 -->
      <div class="k5x" v-show="!isBindEqForK5X && isBindSence" >
        <div class="bindSceneForK5X" >
            <div class="bot-area">
                <div class="bind-item-area" @click="onExecScene" v-CDTAP="handleLongPressForK5X" id="5">
                  <span class="iconfont icon-scene-btn"></span>
                </div>
            </div>
          </div>
      </div>

      <!-- 仅绑定设备的提示语-->
      <div class="k05text" v-if="isBindEqForK5X || !isBindSence" >{{ k05textLongPress }}</div>

      <!-- 仅绑定场景的提示语-->
      <div class="k05text" v-if="!isBindEqForK5X && isBindSence" >{{ k05textLongPress }}<br>{{ k05textClick+deviceDetail.bindSceneName }}</div>

      <!-- 开关 显示 -->
      <div class="switch-btn2">
        <div class="switch-btn iconfont icon-switch" @click="clickSwitch" v-show="onOffSwithDeviceStatus !== 5" ></div>   <!-- v-show="onOffSwithDeviceStatus === 5" -->
      </div>

      <!-- K5X 的滑动效果设置 -->
      <div class="float"  v-if="deviceDetail.knobeBindEndpoint">
        <div>
          <div class="text">设备滑动效果</div>
          <div>
            <span class="textconten">未配置</span>
            <span class="texbut" @click="k05switch = true">配置 ></span>
          </div>
        </div>
        <div class="right">
          <van-switch v-model="checkedkk" @click="enableSliding" />
        </div>
      </div>

    </div>

    <!-- 还是单独k5系列 -->
    <van-popup v-model="k05show" position="bottom" :style="{ height: '230px' }">
      <div class="popupTotle">请选择要绑定的类型</div>
      <div class="popupcontent" @click="bindEqForK5X">绑定设备</div>
       <div class="popupcontent" @click="onNavigateToBindScene">绑定场景</div>
      <div class="popupcontent" @click="onUnbindModal">解绑</div>
      <div class="popup"></div>
      <div class="popupclose" @click="closepop">取消</div>
    </van-popup>

    <!-- 还是单独k5系列 -->
    <van-popup v-model="k05switch" position="bottom" :style="{ height: '230px' }">
      <div class="popupTotle">请选择要绑定的类型</div>
      <div class="popupcontent" @click="bingeqtype_brightness">亮度渐变</div>
      <div class="popupcontent" @click="bingeqtype_colorTemp">色温渐变</div>
      <div class="popup"></div>
      <div class="popupclose" @click="k05switch = false">取消</div>
    </van-popup>

    <!-- 所有开关绑定关联智能后绑定情景 ，不包括K5系列-->
    <div class="bind" v-show=" isSence && !deviceTypeCodeK5X">
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
        <div class="switch-btn iconfont icon-switch" @click="clickSwitch" v-show="onOffSwithDeviceStatus !== 5  && !isK0431BZ_4"></div>
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
    <Modal v-model="unbindModal" title="解除绑定" content="确定要解除绑定吗?" @on-ok="onUnbindForK5X" />   <!--- K5X系列滑动开关的解除绑定功能 -->
  </div>
  <div v-else>
      <combinationOnOff :initData="initData" :InitmData="InitmData" :itemName="itemName"/>
  </div>
</template>
<script>
const DAY_MILES = 24 * 60 * 60 * 1000; // 单位天毫秒
const HOUR_MILES = 24 * 60 * 60 * 1000; // 单位小时毫秒
const MINUTE_MILES = 60 * 1000; // 单位分钟毫秒
import TitleBar2 from "../components/titleBar";
import loadingComp from "../../../components/Loading";
import combinationOnOff from "../components/combinationOnOff.vue";
import { execNativeFunc } from "../../../utils/bridge";
import { mapGetters, mapMutations } from "vuex";
import {
  deviceDetailRep,// 设备详情
  endpointControlRep,// 下发设备控制指令
  execSceneRep,// 情景面板、TP玻璃面板执行情景
  getDeviceScheduleTaskListRep,// 获取设备定时任务
  slidingRep,//滑动控制功能- 亮度渐变 色温渐变
  slidingEnableRep,//滑动控制功能-配置 未配置
  bindDeviceKxReq,
  bindSceneRep,// 绑定情景
  deviceBindSceneSwitchReq,// 开关灯等设备打开或关闭关联场景功能
  roomDeviceRep// 获取房间下的设备列表
} from "../../../api/request";
import { formatMQTTData } from "../../../utils/socketUtil";
import Modal from "../../../components/modals/modal/Modal";
// K051 K052 K053 TP玻璃开关 1 - 3
import { CDTAP } from "../../../directive/index";
// 1位
export default {
  name: "onOffSwitch",
  directives: { CDTAP },
  data() {
    return {
      itemName:'',
      InitmData:[],
      isShowCom:false,
      initData:[],
      k05switch: false,
      checkedkk: true,
      isDefault: false,
      isLightOn: false,
      onLineValue: 0,
      isOnLine: false,
      deviceDetail: {},
      k05text: "点击即可绑定智能",
      k05textLongPress: "长按绑定或解绑智能",
      k05textClick: "点击执行情景:",
      k05show: false,
      isLoading: false,
      isSceneLoading: false,
      touchSceneData: {
        startTime: 0,
        endTime: 0,
        isMove: false,
        timer: null,
      },
      latestTask: {
        time: 0,
        desc: "",
        operation: "关闭",
      },
      statusData: {
        content: "",
        show: false,
      },
      isSceneType: false, // 是否是转情景的设备
      upgradeModal: false,
      unbindModal: false,
      upgradeContent: "发现新版本",
      hasNoticeUpgrade: false,
      hasNoticeDisable: false,
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
      "setOnOffSwitchElectrifyStatus",
    ]),
    ...mapMutations({
      setOnOffSwtichScheduleTask: "schedule/setScheduleTask",
      setOnOffSwtichNeedRefreshState: "schedule/setNeedRefreshState",
      setOnOffSwtichTimingDesc: "schedule/setTimingDesc",
    }),
    async bingeqtype_brightness() {
      this.k05switch = false;
      let { data, error } = await slidingRep({
        cmdKey:'brightness_set_percent',
        endpointId : this.deviceDetail.dataId,
        transTime:4
      });
      if (data && !error) {
      }
    },

    async bingeqtype_colorTemp() {
      this.k05switch = false;
      let { data, error } = await slidingRep({
        cmdKey:'colorTemp_set_4000k',
        endpointId : this.deviceDetail.dataId,
        transTime:4
      });
      if (data && !error) {
      }
    },
    async enableSliding() {
      let { data, error } = await slidingEnableRep({
        isOpen:!this.checkedkk,
        endpointId : this.deviceDetail.dataId,
        transTime:4
      });
      if (data && !error) {
      }
    },

    bindEqForK5X() {

      this.k05show = false;

      ////若已经绑定了情景，先解绑情景，再去绑定设备，只能绑定一个，要么设备要么情景
      if(this.isBindSence){
        let { data, error } =  bindSceneRep({ endpointId: this.deviceDetail.dataId, sceneId: -1 });
        if (data && !error) {
           //console.log("若已经绑定了情景，先解绑情景。解绑成功");
        }
      }

      var parmes = this.deviceDetail;
      this.$router.push({ name: "bingEq", query: parmes });
      // this.$router.push({ name: "bindeq", query: { slideWay: "left" } });
    },

    onpop() {
      this.k05show = true;
    },
    closepop() {
      this.k05show = false;
    },
    goback() {
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    handleLongPressSence(isLongPress) {
      if (isLongPress) {
        execNativeFunc("onVibrate", 50);
        this.onNavigateToBindScene();
      }
    },
    handleLongPressForK5X(isLongPress,index) {
      console.log(index, '8888888888888888888');
      if (isLongPress) {
       this.onpop();
      }
    },
    onUnbindModal(){
      this.unbindModal = true;
    },
    async onUnbindForK5X(){
      this.k05show = false;  ////关闭弹出菜单
     if(this.isBindSence) {
        //// 解绑 情景
        let { data, error } = await bindSceneRep({ endpointId: this.deviceDetail.dataId, sceneId: -1 });
        if (data && !error) {
         this.getData(true);
        }
     }
     else{  //// isBindEqForK5X
       //// 解绑 设备
       let { data, error } = await bindDeviceKxReq({
         sourceDataId: this.deviceDetail.dataId,
         sourceDataTypeEnum: "endpoint",
         targetDataId: "-1", // -1 表示解绑
         targetDataTypeEnum: "endpoint" ,
       });
       if (data && !error) {
         this.getData(true);
       }
     }
    },

    clickBindScene() {
      if(this.deviceDetail.deviceTypeCode === "K0431BZ"){
        //// 如果是K0431BZ，并且是第四位，如果没有打开关联智能，自动打开关联智能
        if(this.deviceDetail.endpointIndex === 4 && this.deviceDetail.ifSceneConvertedEnum !== "yes"){
          console.log("clickBindScene",this.deviceDetail.endpointIndex,this.deviceDetail.ifSceneConvertedEnum,this.deviceDetail.dataId,this.deviceDetail.dataTypeEnum)
          let { data, error } = deviceBindSceneSwitchReq({
            dataId: this.deviceDetail.dataId,
            dataTypeEnum: this.deviceDetail.dataTypeEnum,
            ifSceneConvertedEnum:  "yes" ,
          });
        }
      }

      if (!this.isOnLine) {
        // if (!this.isOnLine || (this.isSceneType && !this.isLightOn)) {
        this._showOfflineModal(this.onLineValue);
        return;
      }
      this.onNavigateToBindScene();
    },

    onNavigateToBindScene() {
      if(this.deviceTypeCodeK5X && this.isBindEqForK5X){
        //// 若已经绑定了设备，先解绑 设备，再去绑定情景，只能绑定一个，要么设备要么情景
        let { data, error } =   bindDeviceKxReq({
          sourceDataId: this.deviceDetail.dataId,
          sourceDataTypeEnum: "endpoint",
          targetDataId: "-1", // -1 表示解绑
          targetDataTypeEnum: "endpoint" ,
        });
      }

      //这里变成弹窗
      this.setcurEndpointId(this.deviceDetail.dataId);
      this.$router.push({ name: "scenesList", query: { bindId: this.deviceDetail.bindSceneId, slideWay: "left" } });
    },
    handleRender(mData) {
      console.log("mData,mData", mData);
      if (typeof mData.isLightOn === "boolean") {
        // 灯是否打开
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
        // 通电后灯光状态
        this.setOnOffSwitchElectrifyStatus(mData.electrifyStatus);
      }
      if (typeof mData.isOnLine === "boolean") {
        // 是否在线
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
        // 开光灯等设备的设备常开状态 0-当做开关 1-当做情景并继电器可控 5-当做情景并继电器常开 6-当做情景并继电器常关（6不处理）
        console.log(mData.onOffSwithDeviceStatus,'执行了setOnOffSwithDeviceStatus');
        this.setOnOffSwithDeviceStatus(mData.onOffSwithDeviceStatus);
        this.isSceneType = mData.onOffSwithDeviceStatus > 0;
      }
    },
    async clickSwitch() {
      if(this.deviceTypeCodeK5X === true ){
        let result = await endpointControlRep({
          endpointId: this.globalDataId,
          cmdKey: "toggle",
        });
        console.log("result",result.data,this.isLightOn)
        if (result && result.data) {
          this.isLightOn = !this.isLightOn;
        }

      }else{
        if (!this.isOnLine) {
          this._showOfflineModal(this.onLineValue);
          return;
        }
        this.isSceneLoading = true;
        let result = await endpointControlRep({
          endpointId: this.globalDataId,
          cmdKey: "toggle",
        });
        this.isSceneLoading = false;
        if (result && result.data) {
          this.isLightOn = !this.isLightOn;
        }
      }
    },
 
    // 执行情景
    async onExecScene() {
      // 如果是K5X系列且绑定的设备，不执行绑定情景
      if(this.deviceTypeCodeK5X && this.isBindEqForK5X){
        return;
      }

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
        console.log(this.deviceDetail, "deviceDetail");
        this.isSceneType = data.ifSceneConvertedEnum === "yes";
        // console.log("this.isSceneType",this.deviceDetail.deviceTypeCode,this.deviceDetail.endpointIndex, this.isSceneType);
        // if(this.deviceDetail.deviceTypeCode === "K0431BZ" && this.deviceDetail.endpointIndex === 4 && this.isSceneType === false){
        //   //// 如果是K0431BZ，并且是第四位，如果没有打开关联智能，自动打开关联智能
        //   this.isSceneType = true;
        //  }
        // console.log("this.isSceneType",this.isSceneType);
        const mData = formatMQTTData(data);
        this.checkUpgrade(data);
        if (!mData.isOnLine && isCheckStatus) {
          this._showOfflineModal(mData.onLineValue);
        }

        var knobeBindEndpoint = data.knobeBindEndpoint;  ////有绑定的设备或场景
        var deviceAttributeValueVoList = data.deviceAttributeValueVoList;  //// 有绑定设备后的滑动效果值，这是一个map
        if(knobeBindEndpoint != null &&  deviceAttributeValueVoList != null
            && deviceAttributeValueVoList["sliding_enable"] === "true"){
          this.checkedkk = true;   ////设备滑动效果的按钮打开
        }
        else{
          this.checkedkk = false;
        }

        this.setDeviceDetail(data);
        this.handleRender(mData);
      }
    },
    // 非在线状态弹窗
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
    handleScheduleTaskResult() {
      const alarmList = [...this.getOnOffSwitchScheduleTask];
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
      console.log(alarmList, "时间列表");
      alarmList
        .filter((item) => item.ifEnableEnum === "yes")
        .forEach((item) => {
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
              .map((i) => {
                let order = ~~i < day ? ~~i + 7 : ~~i;
                return {
                  day: i,
                  closeTime: date.getTime() + minutes * MINUTE_MILES + (order - day) * DAY_MILES,
                };
              })
              .sort((a, b) => a.closeTime - b.closeTime)
              .find((item) => item.closeTime > cloudTimeMs);
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
          } else if (taskRepeatTypeEnum == "ONLY_ONE") {
            if ((latestTaskTime == 0 || latestTaskTime > date.getTime() + minutes * MINUTE_MILES) && date.getTime() + minutes * MINUTE_MILES > cloudTimeMs) {
              dayText = "";
              latestTaskTime = date.getTime() + minutes * MINUTE_MILES;
              operation = taskTypeEnum === "on" ? "开启" : "关闭";
            }
          }
        });
      console.log(latestTaskTime, "latestTaskTime这个等于几");
      if (latestTaskTime > 0) {
        this.latestTask.time = latestTaskTime;
        this.latestTask.operation = operation;
        this.latestTask.desc = dayText;
      }

      if (latestTaskTime > 0) {
        this.setOnOffSwtichTimingDesc(this.formatTimingTaskDesc(latestTaskTime, dayText, operation));
      } else {
        this.setOnOffSwtichTimingDesc("");
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
        endpointId: this.globalDataId,
      });
      if (data && !error) {
        const alarmList = data.data || []; // 所有任务列表
        alarmList.sort((a, b) => a.minutes - b.minutes);
        this.setOnOffSwtichScheduleTask(alarmList);
      }
    },
   async getInitData1(){
      let { data, error } = await roomDeviceRep({pageSize: 999,currentPage: 1,});
      const res = data.data.filter(v=>this.globalDataId==v.dataId)
      let deviceMac = res[0].deviceMac
      let InitData = data.data.filter(v=>deviceMac==v.deviceMac)
      let arr = []
      let mArr = []
      this.itemName = InitData[0].attrs[0].attrDesc.split('-')[0]
      InitData.forEach(async v=>{
        let result = await deviceDetailRep({ dataId: v.dataId, dataTypeEnum: this.globalDeviceType });
        const mData = formatMQTTData(result.data.data);
        mArr.push(mData)
        arr.push(result.data.data)
      })
      this.initData = arr
      this.InitmData = mArr
      console.log(this.initData,'initintint');
    },
    //判断多位-单位
    async getInitData(){
      let result = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      const res = await deviceDetailRep({ dataId: result.data.data.deviceId, dataTypeEnum: 'device' });
      this.itemName = res.data.data.deviceName.split('-')[0]
      let data = res.data.data.endpointList.filter((v)=>v.endpointIndex<600)
      this.initData = data
    },
  },
  created() {
    this.getInitData()
    if(this.initData.length!=1)return this.isShowCom = true
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
    this.k05show = false;
    this.isLoading = true;
    this.getData(true);
    this.getScheduleTask();
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
          console.log(newV[i],'globalMattData-ing');
          const mData = formatMQTTData(newV[i]);
          this.handleRender(mData);
        }
      }
      this.getData(true);
      this.getScheduleTask();
    },
    getOnOffSwitchScheduleTask(newVal) {
      this.handleScheduleTaskResult();
    },

  },
  computed: {
    ...mapGetters(["globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "childMode", "onOffSwithDeviceStatus", "onOffSwitchMotorStrength"]),
    ...mapGetters({
      getOnOffSwitchNeedRefreshState: "schedule/getNeedRefreshState",
      getOnOffSwitchScheduleTask: "schedule/getScheduleTask",
    }),

    ////K0431BZ，并且是第四位
    isK0431BZ_4(){
      //// 如果是K0431BZ，并且是第四位，如果没有打开关联智能，自动打开关联智能
      return  this.deviceDetail.deviceTypeCode === "K0431BZ" && this.deviceDetail.endpointIndex === 4 ;
    },

    // 是否为情景
    isSence() {
      //// 如果是K0431BZ，并且是第四位，如果没有打开关联智能，自动打开关联智能
      let K0431BZ_4 = this.deviceDetail.deviceTypeCode === "K0431BZ" && this.deviceDetail.endpointIndex === 4 ;
      return (this.isSceneType && this.onOffSwithDeviceStatus !== 0) || K0431BZ_4 ;
    },


    // 是否绑定了情景
    isBindSence() {
      return this.deviceDetail.bindSceneId && this.deviceDetail.bindSceneId != "-1";
    },

    isBindEqForK5X() {
      if(typeof(this.deviceDetail.knobeBindEndpoint) == "undefined" || this.deviceDetail.knobeBindEndpoint == null){
        return false;
      }
      return  true;
    },

    ////是否是K5X系列
    deviceTypeCodeK5X() {
      return this.deviceDetail.deviceTypeCode == "K51" || this.deviceDetail.deviceTypeCode == "K52" || this.deviceDetail.deviceTypeCode == "K53" || this.deviceDetail.deviceTypeCode == "K54";
    },

    // 是K5系列并且已经绑定了设备
    // deviceTypeCodeK5XAndBind() {
    //   // 有没有绑定设备，看 this.deviceDetail.knobeBindEndpoint 是否存在，若绑定 knobeBindEndpoint.dataId 就是绑定的设备endpiont的Id
    //   let knobeBindEndpoint;
    //   knobeBindEndpoint = this.deviceDetail.knobeBindEndpoint;
    //   let bK5x;
    //   bK5x = this.deviceDetail.deviceTypeCode == "K51" || this.deviceDetail.deviceTypeCode == "K52" || this.deviceDetail.deviceTypeCode == "K53" || this.deviceDetail.deviceTypeCode == "K54";
    // },

  },
  components: { TitleBar2, loadingComp, Modal,combinationOnOff },
};
</script>
<style lang="less" scoped>
#onOffSwitch {
  position: relative;
  width: 100vw;
  overflow: hidden;
  height: 100vh;
  -webkit-user-select: none;
  user-select: none;
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;
  .k5xoff {
    position: absolute;
    width: 294px;
    height: 282px;
    left: 228px;
    top: 480px;

    background: #e2e2e2;
    border-radius: 26px;

    display: flex;
    align-items: center;
    justify-content: center;

    /deep/ .van-icon-plus {
      color: #f1f1f1;
      font-size: 60px;
    }
  }
  .k5x {
    position: absolute;
    width: 294px;
    height: 282px;
    left: 228px;
    top: 480px;

    background: #ffffff;
    box-shadow: 0px 0px 32px rgba(215, 164, 104, 0.3);
    border-radius: 26px;

    display: flex;
    align-items: center;
    justify-content: center;

    /deep/ .van-icon-plus {
      color: #f1f1f1;
      font-size: 60px;
    }
  }
  .k05text {
    position: absolute;
    width: 480px;
    height: 39px;
    left: 130px;
    top: 800px;

    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 400;
    font-size: 28px;
    line-height: 39px;
    text-align: center;

    color: #5e5e83;

    mix-blend-mode: normal;
    opacity: 0.6;

  }
  .float {
    display: flex;
    position: absolute;
    width: 750px;
    height: 172px;
    bottom: 0px;
    background: #ffffff;
    box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.06);
    border-radius: 16px 16px 0px 0px;
    padding-left: 40px;
    padding-top: 20px;
    padding-right: 40px;
    box-sizing: border-box;
    justify-content: space-between;
    .texbut {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 26px;
      line-height: 150%;
      /* identical to box height, or 39px */

      color: #4289ff;
    }
    .textconten {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 26px;
      line-height: 40px;
      /* identical to box height, or 154% */

      color: #2f2f4a;

      mix-blend-mode: normal;
      opacity: 0.6;
      margin-right: 40px;
    }
    .text {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 600;
      font-size: 40px;
      line-height: 150%;
      /* identical to box height, or 60px */

      color: #2f2f4a;
    }
    .right {
      margin-top: 20px;
    }
  }
  .popup {
    background: #000;
    opacity: 0.2;
    height: 30px;
  }
  .popupclose {
    height: 100px;
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 400;
    font-size: 26px;
    line-height: 100px;
    text-align: center;

    color: #5e5e83;
  }
  .popupTotle {
    height: 100px;
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 400;
    font-size: 26px;
    line-height: 100px;
    text-align: center;

    color: #5e5e83;
    border-bottom: 1px solid rgba(168, 166, 166, 0.5);
  }

  .popupcontent {
    height: 100px;
    line-height: 100px;
    text-align: center;
    border-bottom: 1px solid rgba(168, 166, 166, 0.5);
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 500;
    font-size: 32px;

    /* identical to box height */

    color: #4289ff;
  }
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
          color: #2f2f4a !important;
          box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16) !important;
        }
      }
    }
    .switch-btn2 {
        .switch-btn {
          color: #2f2f4a !important;
          box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16) !important;
        }
    }
    .bind {
      .bot-area {
        position: relative;
        .add-btn,
        .switch-btn {
          color: #2f2f4a !important;
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

  // 用于关联智能的选择主动控制的情况下，开关的显示
  .switch-btn2 {
    position: absolute;
    width: 225px;
    height: 39px;
    left: 488px;
    top: 1200px;

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
  .bindSceneForK5X {
    position: absolute;
    width: 294px;
    height: 282px;
    left: 18px;
    top: 62px;

    //position: relative;
    //width: 100vw;
    //height: 100vh;
    //overflow: hidden;
    display: flex;
    display: flex;
    justify-content: space-between;
    flex-direction: column-reverse;
    .light-pic-wrap {
      position: absolute;
      top: 160px;
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
        width: 240px;
        height: 240px;

        background: #ffffff;
        //box-shadow: 0px 0px 0px 0px rgba(192, 192, 205, 0.2);
        //border-radius: 50%;
        text-align: center;
        line-height: 240px;
        //font-size: 52px;
        //color: #c0c0cd;
      }
      .add-btn {
        margin-left: 36px;
        color: #d7a468;
        box-shadow: 0px 0px 30px 0px rgba(215, 164, 104, 0.3);
      }

      .bind-item-area {
        color: #d7a468;
        box-shadow: 0px 0px 0px 0px rgba(215, 164, 104, 0.3);
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
          font-size: 100px;  ////改变月亮大小
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
