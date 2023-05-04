
/**
 * 开关功能集
 */
const FIND_DEVICE_SECONDS = 120;
import { endpointControlRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "OffSwitchDeviceOptionsMixin",
  data() {
    return { 
      isDoNotDisturb: false,
      findDeviceModal: false,
      findDeviceTimeoutModal: false,
      isConfirmOpen: false,
      statusData: {
        content: "",
        show: false
      },
      findCountdown: 0,
      findTimer: 0,
      startFindDeviceTimestamp: 0
    };
  },
  methods: {
    ...mapMutations(["setOnOffSwitchScrollTop"]),
    // 记录滚动条位置
    handleScroll(e) {
      this.setOnOffSwitchScrollTop(e.target.scrollTop);
    },
    // 跳转倒计时设置界面
    goCountdownSetting() {
      // todo
    },
    // 跳转到设备编组界面
    goDeviceMarshalling() {
      // todo
    },
    // 设置勿扰模式
    setDoNotDisturbMode() {
      this.ifOnlineCallback(() => {
        this.$router.push({
          name: "EffectLightSetting",
          query: { slideWay: "left" }
        });
      });
    },
    // 跳转到马达震动设置
    goMotorQuake() {
      this.ifOnlineCallback(() => {
        this.$router.push({
          name: "MotorQuakeSetting",
          query: { slideWay: "left" }
        });
      });
    },
    // 设备查找倒计时
    setFindDeviceTimer() {
      this.findTimer = setTimeout(() => {
        if (--this.findCountdown > 0) {
          this.setFindDeviceTimer();
        } else {
          this.stopFindDeviceTimer(); 
          this.findDeviceTimeoutModal = true;
          this.stopFindDevice();
        }
      }, 1000);
    },
    // 开始设备查找倒计时
    startFindDeviceTimer() {
      this.findCountdown = FIND_DEVICE_SECONDS; // 倒计时2分钟
      this.startFindDeviceTimestamp = Date.now(); // 记录倒计时开始时间
      this.findTimer && clearTimeout(this.findTimer);
      this.setFindDeviceTimer();
    },
    // 结束设备查找倒计时
    stopFindDeviceTimer() {
      this.findDeviceModal = false;
      if (this.findCountdown > 0) {
        this.stopFindDevice();
      }
      this.findCountdown = 0;
      this.startFindDeviceTimestamp = 0;
      this.findTimer && clearTimeout(this.findTimer);
    },
    // 设备查找
    async handleFindDevice() {
      this.ifOnlineCallback(async () => {
        this.findDeviceModal = true;
        this.findDeviceTimeoutModal = false;
        const params = {
          cmdKey: "find_device",
          endpointId: this.getEndpointId
        };
        let { data, error } = await endpointControlRep(params);
        if (error) {
          this.$Toast.show({ title: "查找失敗" });
        } else {
          this.startFindDeviceTimer();
        }
      });
    },
    // app回到前台时，重新计算倒计时功能
    reviseFindDeviceCountdown() {
      const startTime = this.startFindDeviceTimestamp || 0;
      const remain_seconds = Math.floor(FIND_DEVICE_SECONDS - (Date.now() - startTime) / 1000);
      if (remain_seconds < FIND_DEVICE_SECONDS && remain_seconds > 0) {
        this.findDeviceModal = true;
        this.findCountdown = remain_seconds; // 倒计时剩余时间（秒）
        this.$nextTick(() => {
          this.findTimer && clearTimeout(this.findTimer);
          this.setFindDeviceTimer();
        });
      } else {
        this.findCountdown = 0;
        this.findDeviceModal = false;
        if (this.startFindDeviceTimestamp > 0) {
          this.findDeviceTimeoutModal = true;
        }
        this.startFindDeviceTimestamp = 0;
        this.findTimer && clearTimeout(this.findTimer);
      }
    },
    // 发送停止查找设备指令
    async stopFindDevice() {
      this.startFindDeviceTimestamp = 0;
      const params = {
        cmdKey: "stop_find_device",
        endpointId: this.getEndpointId
      };
      await endpointControlRep(params);
    },
    // 设备强度
    signalTest() {
      this.ifOnlineCallback(() => {
        this.$router.push({
          name: "SignalTest",
          query: { slideWay: "left" }
        });
      });
      // todo
    },
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

    // 在线状态下才执行回调函数
    ifOnlineCallback(callback) {
      if (Number(this.globalDeviceStatus) !== 1 && Number(this.globalDeviceStatus) !== 5) {
        this._showOfflineModal(this.globalDeviceStatus);
        return;
      }
      callback();
    },
  },
  mounted() {
    console.log("mixin mounted"); 
    window.WINGTO_H5.onPageChange = data => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if (result.type == 2) {
              this.findTimer && clearTimeout(this.findTimer);
            }
            //  app回到前台
            if (result.type == 3) {
              this.reviseFindDeviceCountdown();
            }
          }
        } catch (error) {
          console.log("onPageChange Error:", error);
        }
      }
    };
  },
  activated() {
    if (this.onOffSwitchScrollTop > 0 && this.$refs.options) {
      this.$refs.options.scrollTop = this.onOffSwitchScrollTop;
    }
  },
  // 清除定时器
  deactivated() {
    this.stopFindDeviceTimer();
  },
  // 清除定时器
  destroyed() {
    this.setOnOffSwitchScrollTop(0);
    this.stopFindDeviceTimer();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalDataId", "globalAppVersion", "globalDeviceStatus", "onOffSwitchMotorStrength", "onOffSwitchScrollTop"]),
    getEndpointId(){
        if(this.deviceDetail.dataTypeEnum === 'endpoint') {
          return this.globalDataId
        } else if(this.deviceDetail.dataTypeEnum === 'device') { 
          const list = this.deviceDetail.endpointList || []
          if(list.length > 0) {
            return list[0].dataId
          }
        } 
        return '' 
      },
    doNotDisturbEnableText() {
      if (this.deviceDetail && this.deviceDetail.deviceAttributeValueVoList) {
        return this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_if_enable === "1" ? "开启" : "关闭";
      } else {
        return "";
      }
    },
    getMotorStrength() {
      switch (this.onOffSwitchMotorStrength) {
        case 0:
          return "关闭";
        case 40:
          return "一档";
        case 80:
          return "二档";
        case 120:
          return "三档";
        case 160:
          return "四档";
        case 200:
          return "五档";
        default:
          return "四档";
      }
    },
    showFunctionGroup() {
      return this.showIntelligence || this.showLightDoNotDisturb || this.showMotorStrength || this.showRelaySetting || this.showFindDevice ;
    },

    //// 是否是 K5X系列
    // deviceTypeCodeK5X() {
    //    return this.deviceDetail.deviceTypeCode == "K51" || this.deviceDetail.deviceTypeCode == "K52" || this.deviceDetail.deviceTypeCode == "K53" || this.deviceDetail.deviceTypeCode == "K54";
    // },

    // 是否支持关联只能（开关转情景）
    showIntelligence() {
      console.log('showIntelligence',this.deviceDetail);
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_associated_intelligence } = attrs;
      // function_associated_intelligence 这个值 是通过接口设置某个mac是否有关联智能功能。现在不用了，直接用zigbeeTypeEnum是否OnOffSwitch来判断， 20221220 。
      //let k5x =  this.deviceDetail.deviceTypeCode == "K51" || this.deviceDetail.deviceTypeCode == "K52" || this.deviceDetail.deviceTypeCode == "K53" || this.deviceDetail.deviceTypeCode == "K54";
      // let k4x = this.deviceDetail.deviceTypeCode == "K041BZ" || this.deviceDetail.deviceTypeCode == "K042BZ" || this.deviceDetail.deviceTypeCode == "K0431BZ"
      //           || this.deviceDetail.deviceTypeCode == "K041Z" || this.deviceDetail.deviceTypeCode == "K042Z" || this.deviceDetail.deviceTypeCode == "K043Z" || this.deviceDetail.deviceTypeCode == "K044Z";
      let zigbeeTypeEnumSwitch = this.deviceDetail.zigbeeTypeEnum == "OnOffSwitch";  ////所有的开关都可以打开关联智能
      let K0431BZ_4 = this.deviceDetail.deviceTypeCode === "K0431BZ" && this.deviceDetail.endpointIndex === 4 ;  ////K0431BZ第4位不需要设置关联智能
      return (function_associated_intelligence == 1 || zigbeeTypeEnumSwitch ) && !K0431BZ_4;
    },

    // 是否支持查找设备功能
    showFindDevice() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_find_device } = attrs;
      return function_find_device == 1;
    },
    // 是否支持查找信号强度
    showSignalTest() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_signal_intensity } = attrs;
      return function_signal_intensity == 1;
    },
    // 是否支持定时开关
    showCountdown() {
      // console.log(this.deviceDetail.deviceAttributeValueVoList,'什么111111111')
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_timing_switch } = attrs;
      return function_timing_switch == 1;
    },
    // 是否支持勿扰模式
    showLightDoNotDisturb() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_no_disturb_mode } = attrs;
      return function_no_disturb_mode == 1;
    },
    // 是否支持马达震感设置
    showMotorStrength() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_motor_vibration_setting } = attrs;
      return function_motor_vibration_setting == 1;
    },
    // 是否显示UDID
    showUDID() {
      const attrs = this.deviceDetail.deviceAttributeValueVoList || {};
      const { function_display_udid } = attrs;
      return function_display_udid == 1;
    },
    // 是否显示编组相关功能
    showGroup() {
      return this.globalAppVersion >= 20300
    },
    // 是否显示创建编组
    showCreateGroup() {
      return this.deviceDetail.ifGroupAble && this.showGroup
    },
    // 是否显示编组管理
    showGroupEditing() {
      return this.deviceDetail.ifLogicGroupEnum === "yes" && this.showGroup
    }
  } 
};
