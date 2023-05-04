<template>
  <div class="curtain-clock">
    <TitleBar @goBack="goback">
      <template v-slot:title><p class="title title-bar">重复类型</p></template>
      <template v-slot:right><span class="comfirm-btn" :class="{ active: !!chooseList.length }" @click="onConfirm">确定</span></template>
    </TitleBar>
    <div class="main">
      <div class="cell flex-ac-jb" @click="onChoose(idx)" v-for="(item, idx) of weekList" :key="idx">
        <div class="left ">{{ item }}</div>
        <div class="right iconfont" :class="{ 'icon-check active': chooseList.includes(Number(idx)) }"></div>
      </div>
    </div>
  </div>
</template>
<script>
import TitleBar from "../components/titleBar";
import { EventBus } from "../eventbus";
export default {
  data() {
    return {
      chooseList: [],
      weekList: {
        0: "仅一次",
        1: "每周一",
        2: "每周二",
        3: "每周三",
        4: "每周四",
        5: "每周五",
        6: "每周六",
        7: "每周日"
      }
    };
  },
  methods: {
    goback() {
      this.chooseList = [];
      this.$router.back(-1);
    },
    onConfirm() {
      if (!this.chooseList.length) return;
      let list = this.chooseList.sort((a, b) => a - b);
      EventBus.$emit("onChooseWeek", list);
      this.$router.back(-1);
    },
    onChoose(day) {
      day = Number(day);

      let idx = this.chooseList.indexOf(day);
      if (day === 0) {
        this.chooseList = idx < 0 ? [0] : [];
      } else {
        let _idx = this.chooseList.indexOf(0);
        _idx >= 0 && this.chooseList.splice(_idx, 1);
        if (idx < 0) {
          this.chooseList.push(day);
        } else {
          this.chooseList.splice(idx, 1);
        }
      }
          console.log(this.chooseList,'选中的日期')
    }

  },
  activated() {
    let value = this.$route.query.repeatValue || "";
    if (value) {
      value = value.split(",");
    }
    value = value.map(v => Number(v));
    this.$set(this, "chooseList", value);
  },
  components: {
    TitleBar
  }
};
</script>
<style lang="less" scoped>
.curtain-clock {
  background: #f0f0fd;
  .comfirm-btn {
    font-size: 32px;
    font-weight: bold;
    color: #999999;
    &.active {
      color: #4289ff;
    }
  }
  .main {
    padding-top: 30px;
  }
  .cell {
    width: 100%;
    height: 128px;
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 40px 0 52px;
    position: relative;
    &::after {
      position: absolute;
      left: 40px;
      right: 0;
      bottom: 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      content: "";
    }
    &:last-child {
      border-bottom: none;
      &::after {
        border: none;
      }
    }
    .left {
      font-size: 32px;
      font-weight: bold;
      color: #2f2f4a;
      flex-direction: column;
      flex: 1;
    }
    .right {
      font-size: 28px;
      color: #fff;
      align-items: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      text-align: center;
      line-height: 44px;
      box-sizing: border-box;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      &.active {
        background-color: #6165c5;
        color: #fff;
        border-color: #6165c5;
      }
    }
  }
}
</style>
