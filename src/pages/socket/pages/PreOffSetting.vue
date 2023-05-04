<template>
  <div class="preoff-setting">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">按键预约关闭</span></template> 
      <template v-slot:right><span class="btn" @click="onchooseFinish">确定</span></template>
    </title-bar>
    <div class="main">
        <div class="image">
            <div class="desc">点击插座上计时按键开始计时关闭</div>
            <div class="bg"></div>
        </div>
        <div class="timer">
             <timer-picker :showButton="false" @onTimeChange="onTimeChange" hourDesc="小时"
          minuteDesc="分钟" ></timer-picker>
        </div>
     
    </div>
  </div>
</template>
<script>
import titleBar from "../../../components/titleBar";
import TimerPicker from "../../../components/TimerPicker";
import { CreateDeviceScheduleTaskRep } from "../../../api/request";
import { mapGetters,  mapMutations } from "vuex";
export default {
  name: "PreOffSetting",
  data() {
    return {
      closeTimeMinutes: 15,
    };
  },
  methods: {
    ...mapMutations({setSocketPreOffMinutes:  "schedule/setPreOffMinutes"}), 
    goBack() {
      this.$router.back();
    },
    onTimeChange(data){ 
        this.closeTimeMinutes = data.hour * 60 + data.minute
        console.log(data)
    },
    async onchooseFinish() { 
      let { error } = await CreateDeviceScheduleTaskRep({
        endpointId: this.globalDataId,
        minutes: this.closeTimeMinutes,
        taskName: "插座-按键预约" + this.globalDataId,
        taskTypeEnum: "preOff",
      });
      if (error) { 
        this.$Toast.show({ title: error.msg });
      } else {
          this.setSocketPreOffMinutes(this.closeTimeMinutes)
          this.goBack()
      }
    }, 
  },
  created() { 
    // console.log("created:", this.deviceDetail); 
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalFamilyId", "globalDataId"]), 
  },
  components: {
    titleBar,
    TimerPicker 
  }, 
};
</script>
<style lang="less" scoped>
.preoff-setting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2f2f6;
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
      font-size: 30px;
      font-weight: 500;
            color: #4289ff;
    }
  }
  .main {
    flex: 1; 
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .timer { 
      flex: 0 1 454px;
      position: relative;
      width: 100%;
    }
    .image{
        flex: 1;
        height: 712;
        width: 100%;
        background: #fff;
        display: flex;
        justify-content: center;
        flex-direction: column;
        .desc{
            color: #959495;
            font-size: 30px;
            line-height: 32px;
            padding-top: 146px;;
            text-align: center;
            margin-bottom: 20px;
        }
        .bg{
            width: 100%;
            padding-bottom: 60%;
            background-size: contain;
            background-image: url('../../../static/images/device/shouzhi.png');
        }
    }
    
  }
}
</style>
