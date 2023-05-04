<template>
  <div class="door-log">
    <title-bar class="nav-title" @goBack="goback" :showRight="false" :secondTitle="false">
      <template v-slot:title><p class="title">用锁记录</p></template>
    </title-bar>
    <div class="main" @scroll="onScroll" v-show="hasDataLen" ref="main">
      <div>
        <div class="section" v-for="(item, index) in dataList" :key="index">
          <div class="date-area">
            <div class="date">
              <span class="day">{{ item.day }}</span>
              <span class="month">{{ item.month }}</span>
            </div>
            <span class="week">{{ item.week }}</span>
          </div>
          <div class="log-list">
            <div class="line"></div>
            <div class="item" v-for="(subItem, subIdx) of item.list" :key="subIdx">
              <span class="dot"></span>
              <div class="content">
                <p class="info" v-show="( (subItem.lockKeyName && subItem.lockKeyName !== ' ') || subItem.operUserName ) && subItem.lockLogInfo !=='室内开锁'">{{  (subItem.lockKeyName && subItem.lockKeyName !== ' ') ? subItem.lockKeyName : subItem.operUserName  }}</p>
                <p class="result">{{ subItem.lockLogInfo }}</p>
                <span class="time">{{ subItem.hourMinute }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-more" v-show="hasDataLen || (!this.isLoadAll && this.isLoading)">{{ !this.isLoading && this.isLoadAll ? "已加载全部数据" : "加载中···" }}</div>
    </div>
    <div class="empty-area" v-show="!hasDataLen">
      <div class="empty" v-show="!isLoading && !hasDataLen">
        <img src="../../../static/images/device/doorlock/door_log_empty.png" alt="" />
        <p>暂无开锁记录</p>
      </div>
    </div>
    <Modal v-model="delModal" title="温馨提示" content="是否清空该门锁所有记录？" cancelText="取消" okText="确认" @on-ok="handleRemoveLog" @on-cancel="onCancelDel" />
    <div class="iconfont icon-remove_log remove-log" @click="clickRemoveLog" v-show="hasDataLen && getLockAdmin"></div>
  </div>
</template>
<script>
import { lockLogReq, removeLockLogReq } from "../../../api/request";
import TitleBar from "../components/titleBardoor";
import Modal from "../../../components/modals/modal/Modal";
import { mapGetters } from "vuex";
export default {
  name: "DoorLog",
  data() {
    return {
      isFirstLoading: false,
      isLoading: false,
      isLoadAll: false,
      dataList: {},
      hasDataLen: false,
      delModal: false,
      page: {
        currentPage: 0,
        pageSize: 8
      },
      monthList: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
      weekList: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    };
  },
  methods: {
    goback() {
      this.$router.back();
    },
    async getData() {
      this.isLoading = true;
      let result = await lockLogReq({ endpointId: this.globalDataId, currentPage: this.page.currentPage, pageSize: this.page.pageSize });
      this.$nextTick(() => {
        this.isLoading = false;
        this.isFirstLoading = false;
      });
      if (result && !result.error) {
        let list = result.data.data || [];
        if (list.length) {
          this.hasDataLen = true;
        }
        list && list.length && this.formatList(list);
        this.isLoadAll = result.data.page && result.data.page.isLast;
        let timer = setTimeout(() => {
          if (!this.isLoadAll && list && list.length) {
            let main = this.$refs.main;
            if (main.scrollHeight - (main.scrollTop + main.offsetHeight) < 50) {
              this.page.currentPage += 1;
              this.getData();
            }
          }
          timer && clearTimeout(timer);
        }, 200);
      } else {
        this.$Toast.show({ title: "数据错误", postion: "middle" });
      }
    },
    formatList(dataList) {
      let list = dataList;
      let obj = this.dataList;
      let that = this;
      list.map(v => {
        let { year, month, day, hours, minutes, seconds, week } = that.formatTime(v.operTime);

        let key = `${year}-${month + 1}-${day}`; // 注意，这里拿到的月份是0-11,不是1-12
        v.hourMinute = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
        if (!obj[key]) {
          obj[key] = {};
        }
        if (!obj[key].list) {
          obj[key].list = [];
        }
        obj[key].list.push(v);
        if (!obj[key].month) {
          obj[key].month = that.monthList[month];
        }
        if (!obj[key].day) {
          obj[key].day = day;
        }
        if (!obj[key].week) {
          obj[key].week = that.weekList[week];
        }
      });
    },
    formatTime(date) {
      let t = date.replace(/-/g, "/");
      let time = new Date(t);
      let year = time.getFullYear();
      let month = time.getMonth();
      let day = time.getDate();
      let hours = time.getHours();
      let minutes = time.getMinutes();
      let seconds = time.getSeconds();
      let week = time.getDay();
      return { year, month, day, hours, minutes, seconds, week }; // 注意，这里返回的月份是0-11,不是1-12
    },
    onScroll(e) {
      let scrollTop = e.target.scrollTop;
      let scrollHeight = e.target.scrollHeight;
      let offsetHeight = e.target.offsetHeight;
      if (scrollTop + offsetHeight + 50 > scrollHeight && !this.isLoading && !this.isLoadAll) {
        this.page.currentPage += 1;
        this.getData();
      }
    },
    onCancelDel() {
      this.delModal = false;
    },
    clickRemoveLog() {
      this.delModal = true;
    },
    async handleRemoveLog() {
      let result = await removeLockLogReq({ endpointId: this.globalDataId });
      if (result && !result.error) {
        this.hasDataLen = false;
        this.dataList = {};
        this.$Toast.show({ title: "清除成功", postion: "middle" });
      } else {
        this.$Toast.show({ title: "清除失败", postion: "middle" });
      }
    }
  },
  created() {
    this.isFirstLoading = true;
    this.getData();
  },
  computed: {
    ...mapGetters(["globalDataId", "getLockAdmin"])
  },
  components: { TitleBar, Modal }
};
</script>
<style lang="less" scoped>
.door-log {
  background-color: #fbfbfc;
  -webkit-tap-highlight-color: transparent;
  .nav-title {
    height: 88px;
    flex: 0 0 88px;
    .title {
      flex: 1;
      text-align: center;
      height: 88px;
      line-height: 88px !important;
      font-size: 40px;
    }
  }
  .main {
    flex: 0 0 92vh;
    height: 92vh;
    overflow-y: auto;
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .section {
      width: 100%;
      box-sizing: border-box;
      padding: 40px 40px 0;
    }
    .date-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #c0c0cd;
      .day {
        font-size: 36px;
        font-weight: bold;
        color: #5e5e83;
        margin-right: 28px;
      }
      .month {
        font-size: 20px;
      }
      .week {
        font-size: 24px;
      }
    }
    .log-list {
      width: 100%;
      position: relative;
      .line {
        position: absolute;
        top: 60px;
        bottom: 60px;
        left: 9px;
        border-left: 2px dashed #979797;
        z-index: 0;
      }
      .item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 128px;
        margin-top: 30px;
        .dot {
          position: relative;
          z-index: 1;
          width: 20px;
          height: 20px;
          border: 4px solid #979797;
          border-radius: 50%;
          box-sizing: border-box;
          margin: 0 30px 0 0;
          background-color: #fff;
          flex: 0 0 20px;
        }
        .content {
          flex: 1;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          padding: 24px 30px;
          background-color: #fff;
          box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          .info {
            font-size: 32px;
            color: #2f2f4a;
            margin-bottom: 16px;
            width: 90%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          .result {
            font-size: 24px;
            color: #5e5e83;
            width: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          .time {
            position: absolute;
            right: 30px;
            top: 20px;
            font-size: 24px;
            color: #c0c0cd;
          }
        }
      }
    }
  }
  .empty-area {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .empty {
      > img {
        width: 438px;
        height: 310px;
      }
      p {
        font-size: 28px;
        color: #2f2f4a;
        text-align: center;
        opacity: 0.6;
      }
    }
  }
  .loading-more {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    margin-top: 30px;
    font-size: 28px;
    color: rgba(0, 0, 0, 0.5);
  }
  .remove-log {
    position: fixed;
    right: 48px;
    bottom: 128px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #6165c5;
    color: #fff;
    font-size: 40px;
    text-align: center;
    line-height: 80px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
    &:active {
      opacity: 0.8;
    }
  }
}
</style>
