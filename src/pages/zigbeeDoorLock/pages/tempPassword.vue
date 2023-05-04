<template>
  <div class="temp-password" @touchstart.stop="onTouch">
    <title-bar @goBack="goback" :showRight="false" :secondTitle="false">
      <template v-slot:title><p class="title">临时密码</p></template>
    </title-bar>
    <div class="main">
      <div>
        <div class="cell">
          <span class="title">临时密码</span>
          <div class="right">
            <!-- <input type="number" ref="number"  :value="password" @input="onPassword" @keyup="onKeyUp" @blur="onBlur" placeholder="请输入8位数字密码" /> -->
            <input type="number" ref="number" :maxlength="8"  v-model.trim="password" oninput="value=value.replace(/[^\d]/g,'')"  placeholder="请输入8位数字密码" />
          </div>
        </div>
        <div class="cell p40">
          <span class="title">次数</span>
          <div class="right">
            <div class="btn-item" :class="{ active: keyTimes === 1 }" @click="onClickTimes(1)">一次</div>
            <div class="btn-item" :class="{ active: keyTimes === 0 }" @click="onClickTimes(0)">无限次</div>
          </div>
        </div>
        <!-- <div class="cell p40">
        <span class="title">开始时间</span>
        <div class="right">
          <div class="btn-item active" @click="onClickPicker">2021年12月30日</div>
          <div class="btn-item active">07:29</div>
        </div>
      </div> -->
        <div class="cell p40">
          <span class="title">结束时间</span>
          <div class="right">
            <div class="btn-item" :class="{ active: !!endTime.date }" @click="onClickPicker('date')">{{ endTime.date || "请选择日期" }}</div>
            <div class="btn-item" :class="{ active: !!endTime.time }" @click="onClickPicker('time')">{{ endTime.time || "请选择时间" }}</div>
          </div>
        </div>
        <div class="cell m30">
          <span class="title">备注名</span>
          <div class="right">
            <input type="text" v-model.trim="name" maxlength="15" placeholder="请输入使用此密码的用户姓名(身份)" />
          </div>
        </div>
      </div>
      <div class="bottom">
        <loading-btn :isLoading="isLoading" @onClick="onSave">保存</loading-btn>
      </div>
    </div>
    <div class="picker-outer" :class="{ active: isShowPicker }">
      <div class="mask" v-show="isShowPicker"></div>
      <picker style="position: relative;z-index: 2" :value="curTime" :pickerType="pickerType" @onConfirm="onPickerConfirm" @onCancel="onPickerCancel" />
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBardoor";
import picker from "../components/picker";
import LoadingBtn from "../components/loading-btn";
import { queryKeyExistReq, lockKeyAddReq } from "../../../api/request";
import { mapGetters } from "vuex";
import { emojiReg } from "../../../utils/reg";
export default {
  name: "TempPassword",
  data() {
    return {
      isShowPicker: false,
      isLoading: false,
      keyTimes: "",
      password: "",
      pickerType: "date",
      endTime: {
        date: "",
        time: "",
        datePickerData: {},
        timePickerData: {}
      },
      curTime: 0,
      name: ""
    };
  },
  methods: {
    // onPassword(e) {
    //   let data = e.data;
    //   if (
    //     data !== " " &&
    //     data !== "" &&
    //     (data === "0" || data === "1" || data === "2" || data === "3" || data === "4" || data === "5" || data === "6" || data === "7" || data === "8" || data === "9")
    //   ) {
    //     let value = e.target.value.replace(/[^\d]/g, "");
    //     if (("" + value).length > 8) {
    //       this.$refs.number.value = this.password || "";
    //       return;
    //     }
    //     this.password = value;
    //   } else {
    //     this.onKeyUp(e);
    //   }
    // },
    // onKeyUp(e) {
    //   if (e.keyCode === 8) {
    //     if (this.password.length) {
    //       let v = this.password.substring(0, this.password.length - 1);
    //       this.$refs.number.value = v;
    //       this.password = v;
    //     }
    //   } else {
    //     this.$refs.number.value = this.password || "";
    //   }
    // },
    // onBlur(e) {
    //   this.$refs.number.value = this.password || "";
    // },
    onClickTimes(times) {
      this.keyTimes = times;
    },
    onPickerConfirm(data) {
      this.isShowPicker = false;
      if (this.pickerType === "date") {
        let t = `${data.year}/${data.month}/${data.day} ` + (this.endTime.time || "23:59:59");
        let now = new Date().getTime();
        let tt = new Date(t).getTime();
        if (now >= tt) {
          this.$Toast.show({ title: "有效时间不可早于当前", postion: "middle" });
          return;
        }
        this.endTime.datePickerData = data;
        this.endTime.date = `${data.year}年${data.month}月${data.day}日`;
      } else if (this.pickerType === "time") {
        if (this.endTime.date) {
          let t = `${this.endTime.datePickerData.year}/${this.endTime.datePickerData.month}/${this.endTime.datePickerData.day} ${data.hour}:${data.minute}:00`;
          let now = new Date().getTime();
          let tt = new Date(t).getTime();
          if (now >= tt) {
            this.$Toast.show({ title: "有效时间不可早于当前", postion: "middle" });
            return;
          }
        }
        this.endTime.timePickerData = data;
        this.endTime.time = `${data.hour < 10 ? "0" + data.hour : data.hour}:${data.minute < 10 ? "0" + data.minute : data.minute}`;
      }
    },
    onPickerCancel() {
      this.isShowPicker = false;
    },
    onClickPicker(type) {
      this.pickerType = type;
      if (type === "date") {
        if (this.endTime.date) {
          this.curTime = new Date(`${this.endTime.datePickerData.year}/${this.endTime.datePickerData.month}/${this.endTime.datePickerData.day}`).getTime();
        } else {
          this.curTime = new Date().getTime();
        }
      } else if (type === "time") {
        if (this.endTime.time) {
          this.curTime = new Date("2021/07/29 " + this.endTime.time).getTime();
        } else {
          this.curTime = new Date().getTime();
        }
      }
      this.isShowPicker = true;
    },
    onInput() {},
    goback() {
      this.$router.back();
    },
    onTouch() {},
    async onSave() {
      if (this.isLoading) return;
      if (!this.password || this.password.length !== 8) {
        return this.$Toast.show({ title: "请输入8位数字密码", postion: "middle" });
      }
      if (this.keyTimes === "") {
        return this.$Toast.show({ title: "请选择次数", postion: "middle" });
      }
      if (!this.endTime.date || !this.endTime.time) {
        return this.$Toast.show({ title: "请选择结束时间", postion: "middle" });
      }
      if (!this.name) {
        return this.$Toast.show({ title: "请输入备注名称", postion: "middle" });
      }
      if (emojiReg.test(this.name)) {
        return this.$Toast.show({ title: "不支持颜文字等特殊字符", postion: "middle" });
      }
      this.isLoading = true;
      let result = await queryKeyExistReq({ endpointId: this.globalDataId, numberPwd: this.password });
      if (result && !result.error) {
        if (result.data.data) {
          this.isLoading = false;
          let msg = "已存在相同密码";
          this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
        } else {
          let params = {
            effectTimeSeconds: 0,
            endpointId: this.globalDataId,
            ifForce: 0,
            ifForever: false,
            limitCount: this.keyTimes === 0 ? -1 : 1,
            pwdTypeEnum: "appRemote",
            pwdValue: this.password,
            name: this.name
          };
          let t =
            new Date(
              `${this.endTime.datePickerData.year}/${this.endTime.datePickerData.month}/${this.endTime.datePickerData.day} ${this.endTime.timePickerData.hour}:${this.endTime.timePickerData.minute}:59`
            ) - new Date().getTime();
          t = (t / 1000) | 0;
          params.effectTimeSeconds = t;
          let res = await lockKeyAddReq(params);
          if (res && !res.error) {
            let qt = `${this._formatTime(this.endTime.datePickerData.year)}.${this._formatTime(this.endTime.datePickerData.month)}.${this._formatTime(
              this.endTime.datePickerData.day
            )} ${this._formatTime(this.endTime.timePickerData.hour)}:${this._formatTime(this.endTime.timePickerData.minute)}`;
            this.$router.push({ name: "SharePassword", query: { slideWay: "left", keyId: res.data.data, time: qt, num: this.keyTimes, value: this.password, passwordName: this.name } });
            this.isLoading = false;
          } else {
            this.isLoading = false;
            let msg = (result && result.error && result.error.msg) || "保存失败";
            this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
          }
        }
      } else {
        this.isLoading = false;
        let msg = (result && result.error && result.error.msg) || "保存失败";
        this.$Toast.show({ title: msg, postion: "middle", duration: 2500 });
      }
    },
    _formatTime(n) {
      return n < 10 ? "0" + n : n;
    }
  },
  computed: {
    ...mapGetters(["globalDataId"])
  },
  mounted() {
    this.onInput();
  },
  components: { TitleBar, picker, LoadingBtn }
};
</script>
<style lang="less" scoped>
.temp-password {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  background: #f0f0fd;
  .title {
    flex: 1;
    text-align: center;
    height: 88px;
    line-height: 88px !important;
    font-size: 40px;
  }
  .main {
    padding-top: 30px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    .bottom {
      padding-bottom: 80px;
      display: flex;
      justify-content: center;
    }
  }
  .cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 128px;
    line-height: 128px;
    background: #fff;
    padding: 0 0 0 52px;
    box-sizing: border-box;
    position: relative;
    &.p40 {
      padding-right: 40px;
    }
    &.m30 {
      margin-top: 30px;
    }
    &::after {
      position: absolute;
      left: 52px;
      right: 40px;
      bottom: 0;
      content: " ";
      border-bottom: 2px solid rgba(0, 0, 0, 0.05);
    }
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #2f2f4a;
      width: 4.5em;
      flex: 0 0 4.5em;
      text-align: left;
    }
    .right {
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      > input {
        width: 100%;
        height: 128px;
        line-height: 128px;
        font-size: 28px;
        color: #5e5e83;
        border: none;
        outline: none;
        text-align: right;
        box-sizing: border-box;
        padding-right: 40px;
      }
      .btn-item {
        padding: 18px 30px;
        border-radius: 10px;
        background: #f1f1f3;
        font-size: 26px;
        color: #5e5e83;
        margin-left: 12px;
        height: 64px;
        line-height: 32px;
        box-sizing: border-box;
        &.active {
          background-color: #6165c5;
          color: #fff;
        }
      }
    }
  }
}
.picker-outer {
  position: fixed;
  bottom: -102vh;
  left: 0;
  right: 0;
  height: 528px;
  transition: all 0.2s ease-in-out;
  &.active {
    bottom: 0;
  }
  .mask {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 100vh;
    content: " ";
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }
}
</style>
