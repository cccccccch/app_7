<template>
  <div class="curtain-clock">
    <TitleBar :showRight="false" @goBack="goback">
      <template v-slot:title><p class="title title-bar">定时设置</p></template>
    </TitleBar>
    <div class="main">
      <div class="cell flex-ac-jb">
        <div class="left">定时设置</div>
        <div class="right flex" @click="clickAdd">添加</div>
      </div>
      <div class="cell flex-ac-jb" v-for="item of list" :key="item.id">
        <div class="left flex" @click="clickItem(item)">
          <span class="time">{{ item.minutes | timeFilter }}</span>
          <span class="desc">{{ item.taskTypeEnum === "up" ? "全开，" : "全关，" }}{{ item.repeatDate | repeatFilter }}</span>
        </div>
        <div class="right flex">
          <i-switch v-model="item._active" @onClickSwitch="onClickSwitch(item)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import iSwitch from "../../../components/switch.vue";
import TitleBar from "../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import { getDeviceScheduleTaskListRep, DisabledDeviceScheduleTaskRep, EnableDeviceScheduleTaskRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "curtainClock",
  data() {
    return {
      list: [],
    };
  },
  methods: {
    goback() {
      this.$router.back();
    },
    clickAdd() {
      this.$router.push({ name: "TimerSetting", query: { slideWay: "left" } });
    },
    clickItem(item) {
      this.$router.push({ name: "TimerSetting", query: { slideWay: "left" }, params: { id: item.taskId, repeatTime: item.repeatDate, actionType: item.taskTypeEnum, minutes: item.minutes } });
    },
    async onClickSwitch(item) {
      let result;
      if (item._active) {
        result = await EnableDeviceScheduleTaskRep({ id: item.taskId });
      } else {
        result = await DisabledDeviceScheduleTaskRep({ id: item.taskId });
      }
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "切换失败";
        this.$Toast.show({ title: msg, postion: "middle" });
        item._active = !item._active;
      }
    },
    async getData() {
      let result = await getDeviceScheduleTaskListRep({ endpointId: this.deviceDetail.dataId });
      if (result && !result.error) {
        let list = result.data.data || [];
        list.map((v) => {
          v["_active"] = v.ifEnableEnum === "yes";
        });
        this.list = list;

      }
    },
  },
  activated() {
    this.getData();
  },
  computed: {
    ...mapGetters(["deviceDetail"]),
  },
  filters: {
    timeFilter(time) {
      if (!time) {
        return "00:00";
      }
      let hour = (time / 60) | 0;
      let minute = time % 60 | 0;
      hour = hour < 10 ? "0" + hour : hour;
      minute = minute < 10 ? "0" + minute : minute;
      return hour + ":" + minute;
    },
    repeatFilter(data) {
      if (!data) return "";
      let nums = data.split(",");
      nums.forEach((v, i) => {
        if (v == 0) {
          nums[i] = 7;
        } else if (v == -1) {
          nums[i] = 0;
        }
      });
    
      let txt = "";
      let weekDay = {
        0: "仅一次",
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六",
        7: "周日",
      };
      let dayCount = 0;
      nums.map((v) => {
        v = Number(v);

        dayCount += v;
        txt += weekDay[v] + " ";
      });
      return dayCount === 28 ? "每天" : txt;
    },
  },
  components: {
    TitleBar,
    iSwitch,
  },
};
</script>
<style lang="less" scoped>
.curtain-clock {
  background: #f0f0fd;
  .main {
    padding-top: 30px;
  }
  .cell {
    width: 100%;
    height: 128px;
    background-color: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    padding: 0 40px 0 52px;
    &:last-child {
      border-bottom: none;
    }
    .left {
      font-size: 32px;
      font-weight: bold;
      color: #2f2f4a;
      flex-direction: column;
      flex: 1;
    }
    .time {
      line-height: 48px;
    }
    .desc {
      font-size: 28px;
      color: #5e5e83;
      font-weight: normal;
    }
    .right {
      font-size: 28px;
      color: #6165c5;
      flex: 0 0 90px;
      width: 90px;
      justify-content: flex-end;
    }
  }
}
</style>
