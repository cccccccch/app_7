<template>
  <!-- //  编辑时间/定时设置 -->
  <div id="countDownSetting" class="countDownSetting device-option-normal">
    <title-bar @goBack="goBack" class="title-area" :showRight="true">
      <template v-slot:title
        ><span class="title">{{ id ? "编辑时间" : "定时设置" }}</span></template
      >
      <template v-slot:right><span class="ok" :class="{ disabled: isLoading }" @click="comfirm">确定</span></template>
    </title-bar>
    <div class="main">
      <transition name="opt-slide-two">
        <div class="options-normal timer-box">
          <div class="timer">
            <timer-picker :showButton="false" @onTimeChange="onTimeChange" ref="timerPicker" hourDesc="时" minuteDesc="分" :initHour="time.hour" :initMinute="time.minute"></timer-picker>
          </div>
        </div>
      </transition>

      <transition name="opt-slide-two">
        <div class="options-normal">
          <div class="cell" @click="repeatSetting()">
            <div class="left">重复类型</div>
            <div class="right">
              <span class="tips name">{{ getCustomText }}</span>
              <span class="iconfont icon-right"></span>
            </div>
          </div>

          <div class="cell" @click="showModal()">
            <div class="left">动作类型</div>
            <div class="right">
              <span class="tips name">{{ operation }}</span>
              <span class="iconfont icon-right"></span>
            </div>
          </div>
        </div>
      </transition>
      <div class="delete-btn" :class="{ disabled: isLoading }" @click.stop="handleDelete" v-show="id > 0">
        <span class="text">删除定时</span>
      </div>
    </div>
    <Modal type="one" v-model="isShowModal" title="动作类型" :content="content" />
    <Modal v-model="isDeleteModal" title="删除定时" content="确定删除定时吗？" @on-ok="onDelete" />
  </div>
</template>
<script>
const const_week = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  0: "周日",
};
import titleBar from "@/components/titleBar";
import Modal from "@/components/modals/modal/Modal";
import TimerPicker from "@/components/TimerPicker";
import { CreateDeviceScheduleTaskRep, DeleteDeviceScheduleTaskRep, UpdateDeviceScheduleTaskRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "countDownSetting",
  data() {
    return {
      isLoading: false, // 是否在loading，loading时提交按钮不可用（确定、删除）
      repeat: "one", // 闹钟周期
      hasSetTime: false,
      time: {
        hour: undefined,
        minute: undefined,
      }, // 当前选定时间
      keepVariable: false, // 是否需要保存当前data
      isShowModal: false, // 开关切换modal
      isDeleteModal: false, // 删除modal
      content: "已切换为开启", // 开关切换modal 文案
      typeEnum: "on", // 闹钟类型
      id: 0, // 当前任务id
    };
  },
  /**
   * 返回时清空数据
   */
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    if (to.name !== "RepeatSetting") {
      // this.time = null;
      this.keepVariable = false;
      this.setScheduleDays([]);
      this.hasSetTime = false;

    }
    next();
  },
  methods: {
    ...mapMutations({ setScheduleDays: "schedule/setScheduleDays", setSocketNeedRefreshState: "schedule/setNeedRefreshState" }),
    goBack() {
      this.$router.back();
    },
    onTimeChange(data) {
      this.time.hour = data.hour;
      this.time.minute = data.minute;
      // this.closeTimeMinutes = data.hour * 60 + data.minute;
      this.hasSetTime = true;
      console.log(data);
    },
    /**
     * 自定义周期
     */
    goWeekSetting() {
      this.keepVariable = true;
      this.$router.push({ name: "WeekSetting", query: { slideWay: "left" } });
    },
    repeatSetting() {
      this.keepVariable = true;
      this.$router.push({ name: "RepeatSetting", query: { slideWay: "left" } });
    },
    /**
     * 切换任务类型，开启/关闭
     */
    showModal() {
      this.typeEnum === "off" ? (this.typeEnum = "on") : (this.typeEnum = "off");
      this.$emit("input", this.typeEnum);
      this.content = `已切换为${this.typeEnum === "on" ? "开启" : "关闭"}`;
      this.isShowModal = true;
    },
    /**
     * 删除定时弹窗
     */
    handleDelete() {
      if (this.isLoading) return;
      this.isDeleteModal = true;
    },
    /**
     * 删除Api
     */
    async onDelete() {
      this.isLoading = true;
      const { error } = await DeleteDeviceScheduleTaskRep({
        id: this.id,
      });
      this.isLoading = false;
      if (error) {
        this.$Toast.show({
          title: "删除失败" + error,
        });
      } else {
        this.setSocketNeedRefreshState(1);
        this.$router.back();
      }
    },
    /**
     * 确定事件，修改/添加任务
     */
    async comfirm() {
      if (this.isLoading) return;
      if (!this.time) {
        this.$Toast.show({
          title: "请选择定时时间",
        });
        return;
      }

      // if (this.getScheduleDays.length === 0 && !this.repeat) {
      //   this.$Toast.show({
      //     title: "请选择定时周期"
      //   });
      //   return;
      // }
      this.isLoading = true;
      // id > 0 修改
      const execFunc = this.id ? UpdateDeviceScheduleTaskRep : CreateDeviceScheduleTaskRep;
      const type = this.id ? "修改" : "添加";

      const minutes = this.time.hour * 60 + this.time.minute;
      const { error } = await execFunc({
        endpointId: this.getEndpointId,
        minutes,
        repeatDate: this.getScheduleDays.length > 0 ? this.getScheduleDays.join(",") : "-1",
        taskName: "定时任务",
        taskRepeatTypeEnum: this.getScheduleDays.length > 0 ? "REPEAT" : "ONLY_ONE",
        taskTypeEnum: this.typeEnum,
        id: this.id,
      });
      this.isLoading = false;
      if (error) {
        this.$Toast.show({
          title: `${type}定时任务失败,${error}`,
        });
      } else {
        this.setSocketNeedRefreshState(1);
        this.$Toast.show({
          title: `${type}定时任务成功`,
        });
        this.$router.back();
      }
    },
  },
  /**
   *  创建定时器实例
   */
  mounted() {},
  activated() {
    if (!this.hasSetTime) {
      this.time = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
      };
    }
    this.isLoading = false;
    const params = /(^\?|&)id=(\d*)/.exec(location.hash || location.search);
    this.id = params ? ~~params[2] : 0;
    if (this.id && !this.keepVariable) {
      const list = this.getSocketScheduleTask || [];
      const task = list.find((item) => item.taskId === this.id);
      if (task) {
        this.time = {
          hour: Math.floor(task.minutes / 60),
          minute: task.minutes % 60,
        };
        this.hasSetTime = true;
        this.typeEnum = task.taskTypeEnum === "on" ? "on" : "off";
        if (task.repeatDate == "-1") {
          this.setScheduleDays([]);
        } else {
          this.setScheduleDays(task.repeatDate.split(",").map((i) => ~~i));
        }
      }
    }
    const str = [...this.getScheduleDays].sort().join("");
    if (str === "1234567") {
      this.repeat = "daily";
    } else if (str === "67") {
      this.repeat = "weekend";
    } else if (str === "12345") {
      this.repeat = "onduty";
    } else if (this.id > 0) {
      this.repeat = "one";
    } else {
      this.repeat = "";
    }
    if (this.$refs.timerPicker) {
      this.$nextTick(() => {
        this.$refs.timerPicker.setInitData();
      });
    }
  },
  computed: {
    ...mapGetters(["globalDataId", "globalDeviceType", "deviceDetail"]),
    ...mapGetters({
      getScheduleDays: "schedule/getScheduleDays",
      getSocketScheduleTask: "schedule/getScheduleTask",
    }),
    getEndpointId() {
      if (this.deviceDetail.dataTypeEnum === "endpoint") {
        return this.globalDataId;
      } else if (this.deviceDetail.dataTypeEnum === "device") {
        const list = this.deviceDetail.endpointList || [];
        if (list.length > 0) {
          return list[0].dataId;
        }
      }
      return "";
    },
    getCustomText() {
      const str = [...this.getScheduleDays].sort().join("");
      switch (str) {
        case "":
          return "执行一次";
        case "1234567":
          return "每天";
        case "12345":
          return "工作日";
        case "67":
          return "周末";
        default:
          const list = [...this.getScheduleDays].sort();
          return list.map((item) => const_week[item]).join("、");
      }
    },
    getTimeText() {
      if (!this.time) {
        return "";
      }
      return `${this.time.hour % 24}:${(this.time.minute + "").padStart(2, "0")} `;
    },
    operation() {
      return this.typeEnum === "on" ? "开启" : "关闭";
    },
  },
  components: {
    titleBar,
    Modal,
    TimerPicker,
  },
};
</script>
<style lang="less" scoped>
@import "@/common/css/device-option.less";
.countDownSetting {
  color: #2f2f4a;
  .title-area {
    position: fixed;
    top: 0;
    flex: 0 0 88px;
    z-index: 12;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: 500;
      color: #2f2f4a;
    }
    .ok {
      &.disabled {
        opacity: 0.6;
      }
      font-weight: 500;
      color: #4289ff;
      line-height: 30px;
      font-size: 32px;
    }
  }
  .main {
    display: flex;
    flex-direction: column;
    padding-top: 88px;
    height: calc(100vh - 88px);
    width: 100%;
    background: #f0f0fd;
    .timer-box {
      padding: 24px 0;
      position: relative;
      width: 100%;
    }

    .timer {
      height: 416px;
      position: relative;
      width: 100%;
    }
    .options-normal {
      overflow: hidden;
      .wt-radio-wrapper {
        padding-left: 0;
        margin-left: -12px;
      }
    }
    .link {
      color: #4289ff !important;
    }
    .radio-button {
      margin-top: 43px;
      background: #fff;
      overflow: hidden;
      .title {
        margin-left: 52px;
        margin-top: 12px;
        width: 112px;
        height: 48px;
        font-size: 28px;
        font-weight: 400;
        color: #5e5e83;
        line-height: 48px;
      }

      .icon-right {
        font-size: 28px;
        margin-left: 10px;
        color: #d8d8d8;
      }
    }
    .delete-btn {
      &.disabled {
        opacity: 0.6;
      }
      margin: auto;
      margin-bottom: 40px;

      width: 490px;
      height: 104px;
      background: #ffffff;
      border-radius: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      .text {
        height: 45px;
        font-size: 32px;
        font-weight: 400;
        color: #ff453a;
        line-height: 45px;
      }
    }
  }
}
</style>
