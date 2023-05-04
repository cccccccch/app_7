<template>
  <div id="socket" :class="{ active: isLightOn }" @click="clickOnPage">
    <tool-bar ref="toolref" :title="deviceDetail.deviceName" @goBack="goback" :showRight="!!deviceDetail.dataId">
      <template v-slot:options="data">
        <DeviceOptionsSocket :isShow="data.active" :isTurnOn="isLightOn" :isOnline="isOnLine" @onError="deviceDisabled" @onRefreshTask="getScheduleTask"></DeviceOptionsSocket>
      </template>
    </tool-bar>

    <!-- 用电量 -->
    <div class="data-wrap">
      <div class="electricity-box">
        <span class="electricity-value">{{ electronicTotal }}</span>
        <span class="electricity-unit">kW▪h</span>
      </div>
      <div class="filter-box">
        <div v-for="item in filterOptions" :key="item.name" class="filter-option" :class="[selected == item.type ? 'active' : '', item.type]" @click="changeDateFilter(item)">
          {{ item.name }}
        </div>
      </div>
    </div>

    <!-- period -->
    <div class="period-wrap">
      <div class="period-box" @click="chooseDate">
        <span class="period-value">{{ showDate }}</span>
        <span class="icon icon-down period-icon"> </span>
      </div>
    </div>

    <!-- graphic -->
    <div class="graphic-wrap">
      <div class="graphic-box">
        <div class="device-icon"></div>
        <span class="device-desc">本设备</span>
        <div class="house-icon"></div>
        <span class="house-desc">全屋</span>
      </div>
    </div>

    <!-- chart -->
    <div class="chart-wrap" @click="stopEvent">
      <socket-chart ref="socketChart" :data="data" :date="getTimestamp" :dateType="selected"></socket-chart>
    </div>

    <!-- date degree -->
    <div class="date-degree-wrap">
      <div class="date-degree-box">
        <div class="date-item" v-for="item in showX" :key="item">
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="middle switch icon-switch" :class="{ active: isLightOn && isOnLine }" @click="onSwithChange"></div>
    </div>

    <!-- latest task -->
    <div class="tasks-panel" v-show="latestTask.time > 0" @click="showOption">
      <div class="icon"></div>
      <div class="text">{{ taskDesc }}</div>
    </div>

    <!-- 时间筛选模块 -->
    <div class="date-filter-panel" :class="{ active: isShowCountdown }">
      <div class="mask" @click.stop="hideModal($event, 'countdown')" v-show="isShowCountdown"></div>
      <!-- 时间筛选设定 -->
      <date-picker
        ref="datePicker"
        style="z-index: 99"
        :currentDate="currentDate"
        :type="selected"
        @on-cancel="onCountdownCancel"
        @on-confirm="onCountdownChange"
        v-model="isShowCountdown"
      ></date-picker>
    </div>
    <net-status-error-modal ref="nsem"></net-status-error-modal>
    <device-disabled-modal v-model="deviceDisableModal"></device-disabled-modal>
    <upgrade-modal ref="upgradeModal"></upgrade-modal>
  </div>
</template>

<script>
import { CDUnTouch } from "../../../directive/index";
import { CMD_KEY } from "../cmdkey";
import { deviceDetailRep, endpointControlRep, getDeviceScheduleTaskListRep, DisabledDeviceScheduleTaskRep, ElectricReportStatisticsRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { deviceZigbeeType } from "../../../utils/index";
import ToolBar from "../../../components/ToolBar";
import SocketChart from "../components/SocketChart";
import DeviceDisabledModal from "../../../components/modals/modal/DeviceDisabledModal";
import UpgradeModal from "../../../components/modals/modal/UpgradeModal";
import NetStatusErrorModal from "../../../components/modals/modal/NetStatusErrorModal";
import DeviceOptionsSocket from "../components/DeviceOptions";
import { execNativeFunc } from "../../../utils/bridge";
import pageMixins from "../mixins/index";
import { formatMQTTData, isNumber, isBoolean, mergeMQTTData } from "../../../utils/socketUtil";

import DatePicker from "../components/DatePicker";
const DAY_MILES = 24 * 60 * 60 * 1000; // 单位天毫秒
const HOUR_MILES = 24 * 60 * 60 * 1000; // 单位小时毫秒
const MINUTE_MILES = 60 * 1000; // 单位分钟毫秒
export default {
  name: "Power-Socket",
  mixins: [pageMixins],
  directives: {
    CDUnTouch,
  },
  components: {
    SocketChart,
    ToolBar,
    DatePicker,
    UpgradeModal,
    NetStatusErrorModal,
    DeviceDisabledModal,
    DeviceOptionsSocket,
  },
  data() {
    return {
      deviceZigbeeType: deviceZigbeeType,
      isShowCountdown: false,
      CloseHintModal: false,
      isOnLine: true, // 设备在线/离线
      isLightOn: false, // 设备开启/关闭
      selected: "year",
      currentDate: new Date(),
      electronicTotal: 0,
      showX: [],
      deviceId: 0,
      latestTask: {
        time: 0,
        desc: "",
        operation: "关闭",
      },
      filterOptions: [
        {
          type: "day",
          dateType: 1,
          name: "日",
        },
        {
          type: "month",
          dateType: 2,
          name: "月",
        },
        {
          type: "year",
          dateType: 3,
          name: "年",
        },
      ],
      data: { total: [], device: [] },
      timer: {
        statusTimer: 0,
        toggleTimer: 0,
        AlarmTimer: 0,
        preOffTimer: 0,
        countdownTimer: 0,
      }, // 定时器，4秒钟后若MQTT设备状态不匹配，恢复原来配置
      deviceDisableModal: false,
    };
  },
  methods: {
    ...mapMutations(["setGlobalDeviceStatus", "setGlobalMac", "setDeviceDetail"]),
    ...mapMutations({
      setSocketDoNotDisturb: "schedule/setSocketDoNotDisturb",
      setSocketScheduleTask: "schedule/setScheduleTask",
      setSocketEffectLight: "schedule/setEffectLight",
      setSocketPreOffMinutes: "schedule/setPreOffMinutes",
      setSocketPreOffCloseTime: "schedule/setPreOffCloseTime",
      setSocketPreOffTaskId: "schedule/setPreOffTaskId",
      setSocketCountdownCloseTime: "schedule/setCountdownCloseTime",
      setSocketCountdownTaskId: "schedule/setCountdownTaskId",
      setSocketCountdownType: "schedule/setCountdownType",
      setSocketNeedRefreshState: "schedule/setNeedRefreshState",
      setSocketTimingDesc: "schedule/setTimingDesc",
    }),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    hideModal(event, type) {
      if (type === "countdown") {
        this.isShowCountdown = false;
      }
    },
    stopEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    clickOnPage() {
      this.$refs.socketChart.onBlur();
    },
    deviceDisabled() {
      this.deviceDisableModal = true;
    },
    // 开关切换
    onSwithChange(data) {
      if (!this.isOnLine) {
        this.deviceDisableModal = true;
        return;
      }
      if (this.timer.toggleTimer) return;
      this.handleToggle();
    },
    // 初始化数据
    _initData(data = {}) {
      const deviceData = formatMQTTData(data);
      // console.log(deviceData)
      if (deviceData) {
        if (isBoolean(deviceData.isOnLine)) {
          // 设备在线状态
          this.isOnLine = deviceData.isOnLine;
          // if (!this.isOnLine) {
          //   return;
          // }
        }
        if (isBoolean(deviceData.isChildMode)) {
          // childmode
        }

        if (isBoolean(deviceData.isLightOn)) {
          // 设备开关状态
          if (this.isLightOn == deviceData.isLightOn) {
            clearTimeout(this.timer.statusTimer);
          }
          this.isLightOn = deviceData.isLightOn;
        }

        if (isBoolean(deviceData.isLightOn)) {
          // 设备开关状态
          if (this.isLightOn == deviceData.isLightOn) {
            clearTimeout(this.timer.statusTimer);
          }
          this.isLightOn = deviceData.isLightOn;
        }
        // 倒计时处理
        if (isNumber(deviceData.timerStatus)) {
          this.getScheduleTask();
        }
        // 总耗电量
        if (isNumber(deviceData.electronicTotal)) {
          // this.electronicTotal = deviceData.electronicTotal / 1000 .toFixed(1);
        }
        if (isBoolean(deviceData.isEffectLight)) {
          this.setSocketEffectLight(deviceData.isEffectLight);
        }
      }
    },
    // 初始化获取数据
    getData() {
      this.getDeviceData();
    },
    transformElectricVal(electronicVal) {
      return electronicVal / (1000).toFixed(1);
    },
    /**
     * 日期类型:1日;2月;3年
     */
    async getElectric(date, dateType = 3) {
      let _date = new Date(date);
      _date.setHours(0);
      _date.setMinutes(0);
      _date.setSeconds(0);
      switch (dateType) {
        case 1:
          break;
        case 2:
          _date.setDate(1);
          break;
        default:
          _date.setDate(1);
          _date.setMonth(0);
      }
      console.log("_date:", _date);
      let { data, error } = await ElectricReportStatisticsRep({
        deviceId: this.deviceDetail.deviceId,
        dateType,
        statisticDate: _date.getTime(),
      });
      if (!error) {
        const { allDeviceElectricList, deviceElectricList, quantity, showX } = data.data;
        this.data.total = allDeviceElectricList.map((x) => this.transformElectricVal(x));
        this.data.device = deviceElectricList.map((x) => this.transformElectricVal(x));

        this.electronicTotal = this.transformElectricVal(quantity);
        // this.data.total = [12, 65, 25, 31, 25, 46, 12, 45, 23, 12, 45, 22];
        // this.data.device = [1.2, 6.5, 2.5, 3.1, 2, 26, 2, 3, 12, 6, 15, 12];
        const unit = Math.floor(showX.length / 3);
        this.showX = Array.from({ length: 2 }, (v, k) => showX[(k + 1) * unit]);
        this.showX.unshift(showX[0]);
        this.showX.push(showX[showX.length - 1]);
        this.$refs.socketChart.clearContext();
        this.$refs.socketChart.draw();
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    onCountdownCancel() {},
    onCountdownChange(data) {
      const date = new Date();
      date.setFullYear(data.year);
      date.setMonth(data.month > 0 ? data.month - 1 : 0);
      date.setDate(data.day);
      this.currentDate = date;
      this.getElectric(this.currentDate, this.filterOptions.find((item) => item.type == this.selected).dateType);
    },
    /**
     *   校准倒计时时间
     **/
    adjustAlarm() {
      this.getScheduleTask();
    },
    onResetPreOffData() {
      this.setSocketPreOffTaskId(0);
      this.setSocketPreOffCloseTime(0);
    },
    /**
     * 清除按键预约定时器
     */
    clearPreOffTimer() {
      clearTimeout(this.timer.preOffTimer);
      this.timer.preOffTimer = null;
    },
    /**
     * 清除所有定时器
     */
    clearAllTimer() {
      this.timer.preOffTimer && clearTimeout(this.timer.preOffTimer);
      this.timer.countdownTimer && clearTimeout(this.timer.countdownTimer);
      this.timer.preOffTimer = null;
      this.timer.countdownTimer = null;
    },
    /**
     * 设置按键预约定时器
     * @param {*} seconds 初次定时器时间
     */
    setPreOffTimer(seconds) {
      this.timer.preOffTimer = setTimeout(() => {
        if (seconds) {
          this.setSocketPreOffCloseTime(Math.round(this.getSocketPreOffCloseTime - seconds));
        } else {
          this.setSocketPreOffCloseTime(Math.round(this.getSocketPreOffCloseTime - 60));
        }
        if (this.getSocketPreOffCloseTime > 0) {
          this.setPreOffTimer();
        }
      }, seconds * 1000 || MINUTE_MILES);
    },
    /**
     * 设置倒计时定时器
     * @param {*} seconds 初次定时器时间
     */
    setCountdownTimer(seconds) {
      this.timer.countdownTimer = setTimeout(() => {
        if (seconds) {
          this.setSocketCountdownCloseTime(Math.round(this.getSocketCountdownCloseTime - seconds));
        } else {
          this.setSocketCountdownCloseTime(Math.round(this.getSocketCountdownCloseTime - 60));
        }
        if (this.getSocketCountdownCloseTime > 0) {
          this.setCountdownTimer();
        } else {
          this.getScheduleTask();
        }
      }, seconds * 1000 || MINUTE_MILES);
    },
    handleScheduleTaskResult() {
      const alarmList = [...this.getSocketScheduleTask];
      let latestTaskTime = 0; // 定时任务 最近一次执行时间戳
      let latestCountdownTaskTime = 0; // 倒计时任务（按键预约/倒计时） 最近一次执行时间戳
      let dayText = ""; // 定时任务 描述
      let dayTextCountdown = ""; // 倒计时任务 描述
      let operation = "关闭"; // 定时任务 动作
      let operationCountdown = "关闭"; // 倒计时任务 动作
      let _cloudTimeMs = Date.now();
      const const_week = {
        1: "周一 ",
        2: "周二 ",
        3: "周三 ",
        4: "周四 ",
        5: "周五 ",
        6: "周六 ",
        0: "周日 ",
      };
      this.clearAllTimer(); // 重新计算任务，首先清除所有计时器
      /** 按键预约 */
      if (this.deviceDetail.typeCode === "LS10") {
        const preOff = alarmList.find((item) => item.taskTypeEnum === "preOff") || { minutes: 0 };
        const { minutes } = preOff;
        this.setSocketPreOffMinutes(minutes);
        this.setSocketPreOffCloseTime(0);
        this.setSocketPreOffTaskId(0);
      }

      const cd = alarmList.find((item) => item.taskRepeatTypeEnum === "COUNT_DOWN" && item.taskTypeEnum !== "preOff");
      this.setSocketCountdownCloseTime(0);
      if (cd) {
        this.setSocketCountdownType(cd.taskTypeEnum);
        this.setSocketCountdownTaskId(cd.taskId);
      }

      /** 按键预约 */
      alarmList.forEach((item) => {
        if (item.ifEnableEnum === "yes") {
          // 星期几
          const day = new Date(item.cloudTimeMs).getDay();
          const { taskId, startTimeMs, minutes, taskTypeEnum, cloudTimeMs, taskRepeatTypeEnum, repeatDate } = item;
          _cloudTimeMs = cloudTimeMs;
          // 当天00：00 时间
          const date = new Date(cloudTimeMs);
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);

          /** 按键预约 */
          if (this.deviceDetail.typeCode === "LS10" && taskTypeEnum === "preOff" && startTimeMs + minutes * MINUTE_MILES > cloudTimeMs) {
            const countdown = (startTimeMs + minutes * MINUTE_MILES - cloudTimeMs) / 1000;
            if (countdown) {
              this.setSocketPreOffCloseTime(countdown);
              const seconds = countdown % 60;
              this.setPreOffTimer(seconds);
              this.setSocketPreOffTaskId(taskId);
            }
          }

          /** 倒计时 */
          if (taskRepeatTypeEnum === "COUNT_DOWN" && taskTypeEnum !== "preOff") {
            const countdown = (startTimeMs + minutes * MINUTE_MILES - cloudTimeMs) / 1000;
            if (countdown && countdown > 0) {
              this.setSocketCountdownCloseTime(countdown);
              const seconds = countdown % 60;
              this.setCountdownTimer(seconds);
              this.setSocketCountdownTaskId(taskId);
            }
          }
          if (taskRepeatTypeEnum == "REPEAT") {
            let closeTime = 0;
            const target = repeatDate
              .split(",")
              .map((i) => {
                let order = ~~i < day ? ~~i + 7 : ~~i;
                const _closeTime = date.getTime() + minutes * MINUTE_MILES + (order - day) * DAY_MILES;
                return {
                  day: i,
                  closeTime: order === day && _closeTime < cloudTimeMs ? _closeTime + 7 * DAY_MILES : _closeTime,
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
          } else if (taskRepeatTypeEnum == "COUNT_DOWN") {
            if (startTimeMs + minutes * MINUTE_MILES > cloudTimeMs && (latestCountdownTaskTime > startTimeMs + minutes * MINUTE_MILES || latestCountdownTaskTime == 0)) {
              latestCountdownTaskTime = startTimeMs + minutes * MINUTE_MILES;
              if (startTimeMs + (minutes - 24 * 60) * MINUTE_MILES > cloudTimeMs) {
                dayTextCountdown = "明天 ";
              } else {
                dayTextCountdown = "";
              }
              operationCountdown = taskTypeEnum === "on" ? "开启" : "关闭";
            }
          } else if (taskRepeatTypeEnum == "ONLY_ONE") {
            // 是否为今天执行的 ONLY_ONE 任务
            const isTodayExec = date.getTime() + minutes * MINUTE_MILES > cloudTimeMs;
            // 最近一次执任务行时间，不是今天执行的就往后推迟一天
            // eg：当天 16:00 设置了 15:00 的情况
            const only_one_last_time = isTodayExec ? date.getTime() + minutes * MINUTE_MILES : date.getTime() + minutes * MINUTE_MILES + DAY_MILES;
            //  判断队列是否存在更早的任务
            if (latestTaskTime == 0 || latestTaskTime > only_one_last_time) {
              operation = taskTypeEnum === "on" ? "开启" : "关闭";
              dayText = isTodayExec ? "" : "明天 ";
              latestTaskTime = only_one_last_time;
            }
          }
        }
      });
      if (latestTaskTime > 0 && latestCountdownTaskTime > 0) {
        this.latestTask.time = Math.min(latestTaskTime, latestCountdownTaskTime);
        if (latestTaskTime > latestCountdownTaskTime) {
          this.latestTask.operation = operationCountdown;
          this.latestTask.desc = dayTextCountdown;
        } else {
          this.latestTask.operation = operation;
          this.latestTask.desc = dayText;
        }
      } else if (latestTaskTime > 0) {
        this.latestTask.time = latestTaskTime;
        this.latestTask.operation = operation;
        this.latestTask.desc = dayText;
      } else {
        this.latestTask.time = latestCountdownTaskTime;
        this.latestTask.operation = operationCountdown;
        this.latestTask.desc = dayTextCountdown;
      }

      if (latestTaskTime > 0) {
  
        this.setSocketTimingDesc(this.formatTimingTaskDesc(latestTaskTime, dayText, operation));
      } else {

        this.setSocketTimingDesc("");
      }
    },
    async getScheduleTask() {
      let { data, error } = await getDeviceScheduleTaskListRep({
        endpointId: this.globalDataId,
      });
      if (data && !error) {
        const alarmList = data.data || []; // 所有任务列表
        alarmList.sort((a, b) => a.minutes - b.minutes);
        this.setSocketScheduleTask(alarmList);
      }
    },
    /**
     * 格式化首页任务文案
     * @param {*} taskTime 最近一次任务时间
     */
    formatTaskDesc(taskTime) {
      const date = new Date(taskTime);
      const time = (date.getHours() + "").padStart(2, "0") + ":" + (date.getMinutes() + "").padStart(2, "0") + " ";
      return this.latestTask.desc + time + this.latestTask.operation;
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
    /**
     * 获取设备数据
     */
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({
        dataId: this.globalDataId,
        dataTypeEnum: this.globalDeviceType,
      });
      if (data && !error) {
        this.setGlobalMac(data.data.deviceMac || "");
        // data.data.typeCode = 'JP01'
        this.setDeviceDetail(data.data);
        const deviceStateEnum = new Map([
          ["offNetwork", 4],
          ["binding", 7],
          ["online", 1],
          ["default", 0],
        ]);
        let num = deviceStateEnum.get(data.data.deviceStateEnum) || deviceStateEnum.get("default");
        this.setGlobalDeviceStatus(num);
        this.$refs.nsem.checkNetStatus();
        this.$refs.upgradeModal.checkUpgrade();
        this.$nextTick(() => {
          this._initData(data.data);
          this.getElectric(new Date());
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
    async handleToggle() {
      let params = {
        endpointId: this.globalDataId,
        cmdKey: this.isLightOn ? CMD_KEY.CLOSE : CMD_KEY.OPEN,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.timer.toggleTimer = setTimeout(() => {
          clearTimeout(this.timer.toggleTimer);
          this.timer.toggleTimer = 0;
        }, 300);

        const oldLightOn = this.isLightOn;
        this.timer.statusTimer = setTimeout(() => {
          // console.log("执行了定时器statusTimer，oldLightOn：", oldLightOn);
          this.isLightOn = oldLightOn;
        }, 4000);
        this.isLightOn = !this.isLightOn;
      }
    },
    changeDateFilter(item) {
      this.selected = item.type;
      this.getElectric(this.currentDate, item.dateType);
    },
    chooseDate() {
      if (this.$refs.datePicker) {
        this.$refs.datePicker.setInitData();
      }
      this.$nextTick(() => {
        this.isShowCountdown = !this.isShowCountdown;
      });
    },
    // 显示设置页
    showOption() {
      this.$refs.toolref && this.$refs.toolref.showOption();
    },
  },
  watch: {
    globalMattData(newV, oldV) {
      this._initData(mergeMQTTData(newV));
    },
    globalDeviceStatus(newV) {
      this.isLightOn = Number(newV) === 1 || Number(newV) === 5;
      if (!this.isLightOn) {
        clearTimeout(this.AlarmTimer);
      }
    },
    getSocketScheduleTask(newVal) {
      // console.log('from socket page, getSocketScheduleTask is Changed', newVal)
      this.handleScheduleTaskResult();
    },
  },
  computed: {
    ...mapGetters(["deviceDataModify", "globalDeviceType", "globalData", "globalDataId", "globalMattData", "globalDeviceStatus", "deviceDetail", "childMode"]),
    ...mapGetters({
      getSocketNeedRefreshState: "schedule/getNeedRefreshState",
      getSocketPreOffCloseTime: "schedule/getPreOffCloseTime",
      getSocketCountdownCloseTime: "schedule/getCountdownCloseTime",
      getSocketCountdownTaskId: "schedule/getCountdownTaskId",
      getSocketScheduleTask: "schedule/getScheduleTask",
    }),
    showDate() {
      const date = this.currentDate;
      if (this.selected === "day") {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 `;
      } else if (this.selected === "month") {
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      } else {
        return `${date.getFullYear()}年`;
      }
    },
    getTimestamp() {
      return new Date(this.currentDate).getTime();
    },
    taskDesc() {
      return this.formatTaskDesc(this.latestTask.time);
    },
  },
  created() {
    this.getData();
  },
  mounted() {
    window.WINGTO_H5.onPageChange = (data) => {
      if (data) {
        try {
          let result = JSON.parse(data);
          if (result) {
            // app不在活动状态
            if (result.type == 2) {
              clearTimeout(this.AlarmTimer);
              this.clearAllTimer();
              this.AlarmTimer = 0;
            }
            //  app回到前台
            if (result.type == 3) {
              this.adjustAlarm();
            }
          }
        } catch (error) {}
      }
    };
  },
  activated() {
    if (this.getSocketNeedRefreshState) {
      this.getScheduleTask();
      this.setSocketNeedRefreshState(0);
    }
  },
};
</script>
<style lang="less">
.icon {
  font-family: "iconfont";
}
#socket {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  color: #000000;
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;
  .data-wrap {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin: 22px 40px 0 40px;
    .electricity-box {
      display: flex;
      align-items: flex-end;
      font-weight: 600;
      .electricity-value {
        font-size: 72px;
        line-height: 72px;
      }
      .electricity-unit {
        display: block;
        margin: 0 0 6px 8px;
        font-size: 28px;
        line-height: 28px;
      }
    }

    .filter-box {
      display: flex;
      font-weight: 400;
      align-items: center;
      &.active {
        background: #7377c4;
      }
      .filter-option {
        font-size: 24px;
        text-align: center;
        line-height: 40px;
        vertical-align: middle;
        width: 96px;
        height: 40px;
        background: rgba(0, 0, 0, 0.04);
        &.active {
          background: #7377c4;
          color: #fff;
        }
      }
      .day {
        border-radius: 100px 0px 0px 100px;
      }
      .month {
        margin: 0 8px;
      }
      .year {
        border-radius: 0px 84px 84px 0px;
      }
    }
  }
  .period-wrap {
    margin-top: 24px;
    margin-left: 44px;
    .period-box {
      width: max-content;
      display: flex;
      align-items: center;
      color: #797979;
      .period-value {
        font-size: 28px;
        line-height: 24px;
      }
      .period-icon {
        margin-left: 14px;
      }
    }
  }
  .graphic-wrap {
    margin-top: 40px;
    margin-right: 44px;
    display: flex;
    flex-direction: row-reverse;
    .graphic-box {
      display: flex;
      align-items: center;
      color: #797979;
      font-size: 24px;
      .device-icon {
        width: 20px;
        height: 3px;
        border-radius: 5px;
        background-color: #7377c4;
      }
      .device-desc {
        margin-left: 12px;
      }
      .house-icon {
        width: 20px;
        height: 20px;
        margin-left: 23px;
        background: linear-gradient(180deg, #7377c4 0%, #dcddff 100%);
      }
      .house-desc {
        margin-left: 12px;
      }
    }
  }
  .chart-wrap {
    -webkit-user-select: none;
    user-select: none;
    position: relative;
    height: 567px;
    margin: 30px 40px 0 40px;
    .bg {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      .bg-border {
        height: 113px;
        border-top: 2px dotted #97979740;
        &:last-of-type {
          border-bottom: 2px dotted #97979740;
        }
      }
    }
  }
  .date-degree-wrap {
    -webkit-user-select: none;
    user-select: none;
    margin: 25px 40px 0 40px;
    .date-degree-box {
      display: flex;
      justify-content: space-between;
      .date-item {
        color: #797979;
        font-size: 20px;
        line-height: 24px;
      }
    }
  }
  &.active {
    color: #000;
  }
  .offline {
    color: #c0c0cd;
  }
  .data-wrap {
    float: left;
    position: relative;
    display: flex;
    .air {
      position: relative;
      width: 100px;
      height: 100px;
      margin-left: 90px;
      margin-top: 104px;
      z-index: 5;
    }
    .icon-box {
      margin-top: 104px;
      margin-left: 18px;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
      .icon {
        color: #979797;
        font-size: 24px;
        margin-bottom: 15px;
      }
      .desc {
        color: #848484;
        font-size: 24px;
        line-height: 24px;
      }
    }
  }
  .panel {
    position: absolute;
    bottom: 136px;
    left: 70px;
    right: 60px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .active {
      color: #000;
    }
    .space {
      flex: 1;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      .item {
        display: flex;
        align-items: center;
        flex-direction: column;

        &.center {
          margin: 0 40px;
        }
        .icon {
          display: inline-block;
          width: 72px;
          height: 72px;
          background-image: url("../../../assets/svgs/alarm.svg");
          background-size: contain;
          border-radius: 40px;
          text-align: center;
          line-height: 100px;
        }
        .offline {
          color: #c0c0cd;
        }
        .name {
          margin-top: 6px;
          color: #d80200;
          font-size: 24px;
          line-height: 24px;
        }
        .name-alarm {
          animation: cursorAlarm 1s infinite steps(1, start);
        }
      }
    }
    .middle {
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
      &.switch {
        border-radius: 50%;
        font-family: "iconfont" !important;
        background: #ffffff;
        box-shadow: 0px 0px 30px 0px rgba(192, 192, 205, 0.2);
        line-height: 140px;
        color: #c0c0cd;
        text-align: center;
        font-size: 50px;
        &.active {
          box-shadow: 0px 0px 30px 0px rgba(47, 47, 74, 0.16);
          color: #2f2f4a;
        }
      }
    }
  }

  .date-filter-panel {
    position: absolute;
    bottom: -100vh;
    right: 0;
    left: 0;
    height: 360px;
    background-color: #d1d1d1;
    box-shadow: 0px -4px 40px 0px rgba(0, 0, 0, 0.06);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    display: flex;
    flex-direction: column;
    transition: bottom 0.2s linear;
    &.active {
      bottom: 0;
    }
    .icon-logo {
      display: inline-block;
      font-family: "iconfont" !important;
      width: 100px;
      position: relative;
      height: 100px;
      background: #ffffff;
      box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.04);
      border-radius: 40px;
      font-size: 50px;
      text-align: center;
      line-height: 100px;
      .shadow {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        border-radius: 40px;
        font-size: 50px;
        text-align: center;
        line-height: 100px;
      }
    }
    .selected {
      color: rgb(216, 2, 0);
    }

    .name {
      margin-top: 18px;
      font-size: 26px;
      line-height: 24px;
    }

    .mask {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 98;
      background-color: rgba(0, 0, 0, 0.2);
    }
    .content {
      position: relative;
      width: 100%;
      height: 100%;
      background: #f9f9f9;
      z-index: 99;
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      display: flex;
      align-items: center;
      flex-direction: column;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
      .desc {
        font-size: 24px;
        line-height: 40px;
        margin-top: 40px;
        display: flex;
        align-items: baseline;
        .mode-name {
          margin-left: 12px;
        }
      }
      .mode-list {
        flex: 1;
        width: 100%;
        height: calc(100% - 8px);
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 40px;
        margin-top: 30px;
        box-sizing: border-box;
        overflow-y: auto;
        margin-bottom: 76px;
        align-content: flex-start;
        -webkit-overflow-scrolling: touch;
        .mode-item-name {
          line-height: 24px;
          font-size: 24px;
          color: #2f2f4a;
          text-align: center;
          display: block;
          margin-top: 10px;
        }
        .mode-item {
          flex-direction: column;
          position: relative;
          width: 140px;
          height: 160px;
          background-position: center;
          overflow: hidden;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
  .tasks-panel {
    height: 112px;
    background: #ffffff;
    box-shadow: 0px -2px 20px 0px rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    .icon {
      display: inline-block;
      width: 28px;
      height: 28px;
      background-image: url("../../../assets/svgs/alarm-task.svg");
      background-repeat: no-repeat;
      background-size: contain;
      text-align: center;
      line-height: 100px;
    }
    .text {
      height: 24px;
      font-size: 24px;
      font-weight: 500;
      color: #5e5e83;
      line-height: 24px;
      margin-left: 15px;
    }
  }
}
@keyframes cursorAlarm {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
