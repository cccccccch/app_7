<template>
  <div class="timingSetting device-option-normal">
    <title-bar @goBack="goBack" class="title-area" :showRight="false">
      <template v-slot:title><span class="title">定时</span></template>
    </title-bar>
    <div class="main">
      <transition name="opt-slide-two">
        <div class="options-normal">
          <div class="cell" @click="goAddTask()">
            <div class="left">定时设置</div>
            <div class="right">
              <span class="tips name link">添加</span>
              <span class="iconfont"></span>
            </div>
          </div>
        </div>
      </transition>

      <transition name="opt-slide-two">
        <div class="options-normal">
          <div class="cell switch-cell" @click="goEditTask(item.id)" v-for="item in list" :key="item.id">
            <div class="left">
              <label>{{ item.time }}</label>
              <span>{{ item.operation }}{{ item.desc}}</span>
            </div>
            <div class="right" @click.stop="changeStatus(item.id, item.ifEnable)">
              <i-switch v-model="item.ifEnable" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
const const_week = {
  0: "星期日",
  1: "星期一",
  2: "星期二",
  3: "星期三",
  4: "星期四",
  5: "星期五",
  6: "星期六"
};
import titleBar from "@/components/titleBar";
import iSwitch from "@/components/switch";
import { getDeviceScheduleTaskListRep, EnableDeviceScheduleTaskRep, DisabledDeviceScheduleTaskRep } from "@/api/request";
import { mapGetters, mapMutations } from "vuex";
import TimerPickerCtrl from "@/components/timer-picker";
export default {
  name: "timingSetting",
  data() {
    return {
      list: []
    };
  },
  methods: {
    ...mapMutations({ setSocketNeedRefreshState: "schedule/setNeedRefreshState", setSocketScheduleTask: "schedule/setScheduleTask" }),
    goBack() {
      this.$router.back();
    },
    /**
     * 添加定时任务
     */
    goAddTask() {
      this.$router.push({ name: "CountDownSetting", query: { slideWay: "left" } });
    },
    /**
     * 编辑定时任务
     * @param {*} id 任务ID
     */
    goEditTask(id) {
      this.$router.push({ name: "CountDownSetting", query: { slideWay: "left", id } });
    },
    /**
     * 启用或禁用定时任务
     * @param {*} id 任务ID
     * @param {*} enabled 启用标识
     */
    async changeStatus(id, enabled) {
      const func = enabled ? EnableDeviceScheduleTaskRep : DisabledDeviceScheduleTaskRep;
      const title = enabled ? "启用失败" : "禁用失败";
      const { error } = await func({ id });
      if (error) {
        this.$Toast.show({
          title: title + error
        });
      } else {
        // 设置刷新状态
        // 返回时刷新定时任务
        this.setSocketNeedRefreshState(1);
      }
    },
    /**
     * 格式化时间文案
     * @param {*} item
     */
    formatTimeText(item) {
      const { minutes } = item || {};
      // 执行一次
      const time = ~~minutes;
      return `${(Math.floor(time / 60) + "").padStart(2, "0")}:${((time % 60) + "").padStart(2, "0")}`;
    },
    /**
     * 格式化任务描述文案
     * @param {*} item
     */
    formatDesc(item) {
      const { repeatDate } = item || {};
      // 执行一次不显示
      if (repeatDate === "-1") {
        return "执行一次";
      } else {
        const list = repeatDate.split(",") || [];
        list.sort();
        const listStr = list.join("");
        const week = {
          "1234567": "每天",
          "12345": "工作日",
          "67": "周末"
        };
        const weekstr = "一二三四五六日";
        if (week[listStr]) {
          return "，" + week[listStr];
        } else {
          return list.reduce((acc, cur) => {
            acc += "周" + weekstr[cur - 1] + " ";
            return acc;
          }, "，");
        }
      }
    },
    /**
     * 任务类型，关闭/开启
     * @param {*} taskTypeEnum
     */
    getTaskTypeName(taskTypeEnum) {
      return taskTypeEnum === "on" ? "开启" : "关闭";
    },
    /**
     * 处理定时任务列表
     */
    handleScheduleTaskResult() {
      const result = [...this.getSocketScheduleTask];

      this.list = result
        .filter(item => item.taskRepeatTypeEnum !== "COUNT_DOWN")
        .map(item => {
          return {
            id: item.taskId,
            operation: this.getTaskTypeName(item.taskTypeEnum),
            ifEnable: item.ifEnableEnum === "yes",
            time: this.formatTimeText(item),
            desc: this.formatDesc(item)
          };
        });
      
    },
    /**
     * 获取后台数据
     */
    async getScheduleTask() {
      let { data, error } = await getDeviceScheduleTaskListRep({
        endpointId: this.getEndpointId
      });
      if (data && !error) {
        const result = data.data || [];
        result.sort((a, b) => a.minutes - b.minutes);
        this.setSocketScheduleTask(result);
      }
    }
  },
  watch: {
    getSocketScheduleTask(newVal) {
      // console.log('from timingSetting page, getSocketScheduleTask is Changed', newVal)
      this.handleScheduleTaskResult();
    }
  },
  activated() {
    // console.log('timingSettingList', this.getSocketNeedRefreshState )
    if (this.getSocketNeedRefreshState) {
      this.getScheduleTask();
      this.setSocketNeedRefreshState(0);
    }
  },
  created() {
    // this.getScheduleTask();
    // console.log(this.deviceDetail);
    this.handleScheduleTaskResult();
    this.countDownInstance = TimerPickerCtrl.create({
      show: false, // 创建实例，默认关闭
      okText: "确定", // 确定按钮文本

      onCancel: () => {
        // 取消事件
      },
      onComfirm: data => {
        // 确定事件
        console.log("countDownInstance", data);
      }
    });
  },
  computed: {
    ...mapGetters(["globalDataId", "deviceDetail"]),
    ...mapGetters({
      getScheduleDays: "schedule/getScheduleDays",
      getSocketScheduleTask: "schedule/getScheduleTask",
      getSocketNeedRefreshState: "schedule/getNeedRefreshState"
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
      const list = [...this.getScheduleDays];
      if (list && list.length > 0) {
        return list
          .sort()
          .map(item => const_week[item])
          .join("、");
      }
      return "";
    }
  },
  components: {
    titleBar,
    iSwitch
  }
};
</script>
<style lang="less" scoped>
@import "@/common/css/device-option.less";
.timingSetting {
  color: #2f2f4a;
  .title-area {
    // position: relative;
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
  }
  .main {
    margin-top: 87px;
    height: 100%;
    width: 100%;
    background: #f0f0fd;
    .options-normal {
      &:nth-of-type(2) {
        margin-top: 0;
      }
      overflow: hidden;
      .switch-cell {
        height: 160px;
        .right {
          height: 100%;
          justify-content: flex-end;
          flex: 0 1 100px;
        }
        .left {
          height: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          label {
            height: 48px;
            font-size: 32px;
            font-weight: bold;
            color: #2f2f4a;
            line-height: 48px;
          }
          span {
            height: 48px;
            font-size: 28px;
            font-weight: 400;
            color: #5e5e83;
            line-height: 48px;
          }
        }
      }
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
  }
}
</style>
