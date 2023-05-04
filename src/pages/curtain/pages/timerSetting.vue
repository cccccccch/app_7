<template>
  <div class="curtain-clock">
    <TitleBar @goBack="goback">
      <template v-slot:title>
        <p class="title title-bar">{{ taskId ? "编辑时间" : "定时设置" }}</p>
      </template>
      <template v-slot:right>
        <span class="comfirm-btn" @click="onSave" v-show="!isSaving">确定</span>
        <loading-svg width="2vw" v-show="isSaving" height="2vw" color="#ccc" />
      </template>
    </TitleBar>
    <div class="time-wrap">
      <!-- <TimePick pickerType="time" :showType="1"  @onConfirm="onTimePick" :value="timestamps" :immediate="true" /> -->
      <TimePick pickerType="time" :showType="1" @onConfirm="onTimePick" :value="timestamps" :immediate="true" />
    </div>
    <div class="main">
      <div class="cell flex-ac-jb" @click="clickRepeatType">
        <div class="left">重复类型</div>
        <div class="right flex">
          <span class="desc">{{ repeatText }}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>
      <div class="cell flex-ac-jb" @click="clickActionChange">
        <div class="left flex">动作类型</div>
        <div class="right flex">
          <span class="desc">{{ actionType ? "全开" : "全关" }}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>
    </div>
    <div class="del-btn" v-if="taskId">
      <div class="btn" @click="clickDel">
        <loading-svg width="2vw" height="2vw" v-show="delLoading" color="#bcbcbc" />
        <span style="margin-right: 8px">删除定时</span>
      </div>
    </div>
    <Modal v-model="actionModal" title="动作类型" @on-ok="clickSetOk" type="one" :content="actionText">我知道了</Modal>
    <Modal v-model="delModal" title="温馨提示" @on-cancel="delModal = false" @on-ok="onDel" content="确定删除当前定时吗？"></Modal>
  </div>
</template>
<script>
import TitleBar from "../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import TimePick from "../../zigbeeDoorLock/components/picker.vue";
import { EventBus } from "../eventbus";
import { CreateDeviceScheduleTaskRep, UpdateDeviceScheduleTaskRep, DeleteDeviceScheduleTaskRep } from "../../../api/request";
import loadingSvg from "../components/loading-svg.vue";
import { mapGetters } from "vuex";
export default {
  name: "curtainClock",
  data() {
    return {
      actionModal: false,
      weekDay: {
        0: "仅一次",
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六",
        7: "周日",
      },
      repeatValue: [0],
      repeatText: "仅一次",
      timeValue: {},
      actionType: true,
      actionText: "已切换",
      isSaving: false,
      taskId: 0,
      timestamps: 0,
      delModal: false,
      delLoading: false,
    };
  },
  created() {
    this.timestamps = new Date().getTime();

  },
  methods: {
    // changeTime(val){
    //   this.timestamps = val
    // },
    goback() {
      this.repeatValue = [0];
      this.repeatText = "仅一次";
      this.timeValue = {};
      this.actionType = true;
      this.actionText = "已切换";
      this.isSaving = false;
      this.taskId = 0;
      this.timestamps = 0;
      this.$router.back();
    },
    clickDel() {
      if (this.delLoading) return;
      this.delModal = true;
    },
    clickRepeatType() {
      this.$router.push({ name: "TimerWeek", query: { slideWay: "left", repeatValue: this.repeatValue.join(",") }, params: { slideWay: "left" } });
    },
    clickAdd() {
      this.$router.push({ name: "TimerSetting", query: { slideWay: "left" } });
    },
    onTimePick(data) {
      this.timeValue = data;
    },
    clickActionChange() {
      this.actionModal = true;
      this.actionType = !this.actionType;
      this.actionText = this.actionType ? "已经切换为全开" : "已经切换为全关";
    },
    clickSetOk() {
      this.actionModal = false;
    },
    onChooseWeek(data) {
      let res = "";
      let dayCount = 0;
      data.map((v) => {
        dayCount += v;
        res += this.weekDay[v] + " ";
      });
      this.repeatText = dayCount === 28 ? "每天" : res;
      this.repeatValue = data;
  
    },
    onSave() {
    
      this.repeatValue.forEach((v,i) => {
  
        if (v == 7) {
          this.repeatValue[i] = 0;
        }
       else if (v == 0) {
           this.repeatValue[i] = -1;
        }
      });
      let week = this.repeatValue;

      let params = {
        endpointId: this.globalDataId,
        minutes: this.timeValue.hour * 60 + this.timeValue.minute,
        repeatDate: week.join(","),
        taskRepeatTypeEnum: "REPEAT",
        taskTypeEnum: this.actionType ? "up" : "down",
      };
      if (params.repeatDate === "-1") {
        params.taskRepeatTypeEnum = "ONLY_ONE";
      }
      if (!this.taskId) {
        this.addNew(params);
      } else {
        this.updateTask(params);
      }
    },
    async onDel() {
      this.delLoading = true;
      let result = await DeleteDeviceScheduleTaskRep({ id: this.taskId });
      this.delLoading = false;
      if (result && !result.error) {
        this.$Toast.show({ title: "删除成功", postion: "middle" });
        this.goback();
      } else {
        let msg = (result && result.error && result.error.msg) || "删除失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async updateTask(params) {
      params.id = this.taskId;
      this.isSaving = true;
      let result = await UpdateDeviceScheduleTaskRep(params);
      this.isSaving = false;
      if (result && !result.error) {
        this.$Toast.show({ title: "修改成功", postion: "middle" });
        this.goback();
      } else {
        let msg = (result && result.error && result.error.msg) || "修改失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async addNew(params) {
      this.isSaving = true;
      let result = await CreateDeviceScheduleTaskRep(params);
      this.isSaving = false;
      if (result && !result.error) {
        this.$Toast.show({ title: "设置成功", postion: "middle" });
        this.goback();
      } else {
        let msg = (result && result.error && result.error.msg) || "设置失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
  },
  mounted() {
    EventBus.$on("onChooseWeek", this.onChooseWeek);
  },
  activated() {
    let data = this.$route.params;
    if (data.id && data.id !== this.taskId) {
      this.taskId = data.id;
      let repeatTime = data.repeatTime.split(",");
      repeatTime = repeatTime.map((v) => Number(v) + 1);
      this.onChooseWeek(repeatTime);
      this.actionType = data.actionType === "up";
      this.timeValue = {
        hour: (data.minutes / 60) | 0,
        minute: data.minutes % 60 | 0,
      };
      let t = "2022/02/22 " + (this.timeValue.hour < 10 ? "0" + this.timeValue.hour : this.timeValue.hour) + ":" + (this.timeValue.minute < 10 ? "0" + this.timeValue.minute : this.timeValue.minute);
      this.timestamps = new Date(t).getTime();
    } else {
      //显示的时间
      if (this.timeValue.hour) {
        let t = "2022/02/22 " + (this.timeValue.hour < 10 ? "0" + this.timeValue.hour : this.timeValue.hour) + ":" + (this.timeValue.minute < 10 ? "0" + this.timeValue.minute : this.timeValue.minute);
        this.timestamps = new Date(t).getTime();
      } else {
        this.timestamps = new Date().getTime();
      }
    }
  },
  computed: {
    ...mapGetters(["globalDataId"]),
  },
  components: {
    TitleBar,
    TimePick,
    Modal,
    loadingSvg,
  },
};
</script>
<style lang="less" scoped>
.curtain-clock {
  background: #f0f0fd;
  width: 100vw;
  overflow: hidden;
  display: "flex";
  .comfirm-btn {
    font-size: 32px;
    font-weight: bold;
    color: #4289ff;
  }
  .time-wrap {
    margin-top: 30px;
    padding: 10px 0;
    background-color: #fff;
  }
  .main {
    padding-top: 30px;
  }
  .del-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    align-items: center;
    padding-bottom: 40px;
    .btn {
      width: 490px;
      height: 104px;
      line-height: 104px;
      border-radius: 52px;
      color: #ff453a;
      font-size: 32px;
      text-align: center;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
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
      align-items: center;
      justify-content: flex-end;
      .iconfont {
        margin-left: 20px;
        font-size: 28px;
      }
    }
  }
}
</style>
