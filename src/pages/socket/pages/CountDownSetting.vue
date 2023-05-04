<template>
  <div id="countdown-setting">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">倒计时设置</span></template>
      <template v-slot:right><span class="btn" @click="onchooseFinish">确定</span></template>
    </title-bar>
    <div class="main">
      <div class="timer">
        <timer-picker :showButton="false" @onTimeChange="onTimeChange" ref="timerPicker" hourDesc="小时" minuteDesc="分钟"></timer-picker>
      </div>
      <div class="cell" @click="showModal">
        <label class="label">动作类型</label>
        <div class="right">
          <span class="tips">{{operation}}</span>
          <span class="iconfont icon-right"></span>
        </div>
      </div>
    </div>
    <Modal  type="one" v-model="isShowModal" title="动作类型" :content="content"  />
  </div>
</template>
<script>
import titleBar from "../../../components/titleBar";
import TimerPicker from "../../../components/TimerPicker";
import { CreateDeviceScheduleTaskRep, UpdateDeviceScheduleTaskRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import Modal from "@/components/modals/modal/Modal"; 
export default {
  name: "SelfCountDownSetting", 
  data() {
    return {
      closeTimeMinutes: 15,
      isShowModal: false,
      content: '已切换为开启',
      typeEnum: 'on' 
    };
  },
  methods: {
    ...mapMutations({
        setSocketPreOffMinutes: "schedule/setPreOffMinutes",
        setSocketNeedRefreshState: "schedule/setNeedRefreshState",
        }),
    goBack() {
      this.$router.back();
    },
    onTimeChange(data) {
      this.closeTimeMinutes = data.hour * 60 + data.minute;

    },
    async onchooseFinish() {
        const execFunc = this.getSocketCountdownTaskId ? UpdateDeviceScheduleTaskRep : CreateDeviceScheduleTaskRep
        let { error } = await execFunc({
            endpointId: this.globalDataId,
            minutes: this.closeTimeMinutes,
            id: this.getSocketCountdownTaskId ,
            taskName: "倒计时" + this.globalDataId,
            taskTypeEnum: this.typeEnum,
            taskRepeatTypeEnum : 'COUNT_DOWN',
            repeatDate : '-1'
        });
        if (error) {
            this.$Toast.show({ title: error.msg });
        } else { 
            this.setSocketNeedRefreshState(1)
            this.goBack();
        } 
    },
    showModal (){
        this.typeEnum === 'off' ? this.typeEnum = 'on' : this.typeEnum = 'off'
        this.content = `已切换为${ this.typeEnum === 'on' ? '开启': '关闭'}` 
        this.isShowModal = true
    }
  },
  activated(){
      if(this.$refs.timerPicker) {
          this.$refs.timerPicker.setInitData()
      } 
  },
  created() {
    // console.log("created:", this.deviceDetail);
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalFamilyId", "globalDataId"]),
    ...mapGetters({getSocketCountdownTaskId : "schedule/getCountdownTaskId"}),
    operation() {
        return this.typeEnum === 'on' ? '开启' : '关闭'
    }
  },
  components: {
    titleBar,
    TimerPicker,
    Modal
  }
};
</script>
<style lang="less" scoped>
#countdown-setting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0fd;
  .title-area {
    flex: 0 0 88px;
    position: relative;
    height: 88px;
    .title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      font-weight: 500;
      color: #2f2f4a;
    }
    .btn {
      font-size: 32px;
      font-weight: 500;
      color: #4289ff;
    }
  }
  .main {
    // margin-top: 30px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    .timer {
      flex: 0 1 454px;
      position: relative;
      width: 100%;
    }
    .cell {
      margin-top: 30px;
      height: 128px;
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .label {
        height: 48px;
        font-size: 32px;
        font-weight: 500;
        margin-left: 52px;
        color: #2f2f4a;
        line-height: 48px;
      }
      .right {
        margin-right: 39px;
        color: #5e5e83;
        font-size: 28px;
        display: flex;
        align-items: center;
        .icon-right {
          margin-left: 10px;
          font-size: 28px;
          color: #5e5e83;
        }
        .tips {
          font-weight: 400;
        }
      }
    }
  }
}
</style>
