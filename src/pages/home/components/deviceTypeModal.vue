<template>
  <div class="device-type-modal" v-show="value" @touchstart.stop @touchmove.stop @touchend.stop>
    <div class="mask" @click="hide"></div>
    <transition name="fade">
      <div class="main" v-show="value">
        <p class="name">
          <span>{{ curItem.name }}</span>
          <span class="iconfont icon-up" @click="hide"></span>
        </p>
        <div class="list">
          <span class="item" :class="{ active: cateId === 0 }" @click="onChoose({ id: 0, name: '所有设备' })">所有设备</span>
          <span class="item" :class="{ active: cateId === item.id }" v-for="(item, idx) of cateList" :key="idx" @click="onChoose(item)">{{ item.name }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: "device-type-modal",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    cateList: {
      type: Array,
      default() {
        return [];
      },
    },
    roomId: {
      type: Number,
      default: 0,
    },
    cateId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      curItem: {
        id: 0,
        name: "所有设备",
      },
    };
  },
  methods: {
    hide() {
      this.$emit("input", false);
    },
    onChoose(item) {
      this.curItem = item;
      this.$emit("on-choose", item);
      this.hide();
    },
  },
  watch: {
    cateList(newV) {
      if (newV && Array.isArray(newV) && newV.length) {
        let has = false;
        for (let item of newV) {
          if (item.id === this.cateId) {
            this.curItem = item;
            has = true;
            break;
          }
        }
        if (!has) {
          this.curItem = { id: 0, name: "所有设备" };
        }
      } else {
        this.curItem = { id: 0, name: "所有设备" };
      }
    },
  },
};
</script>
<style lang="less" scoped>
.device-type-modal {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 40px 0;
  z-index: 9;
  .mask {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .main {
    width: 100%;
    padding: 40px 40px 60px 40px;
    background: #fff;
    box-sizing: border-box;
    border-radius: 40px;
    z-index: 2;
    .name {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      font-size: 32px;
      font-weight: bold;
      color: #2f2f4a;
      .iconfont {
        font-size: 32px;
        color: #444464;
      }
    }
    .list {
      max-height: 392px;
      overflow-y: auto;
      .item {
        display: inline-block;
        padding: 26px 34px;
        background: #f1f1f3;
        border-radius: 10px;
        font-size: 26px;
        font-weight: 400;
        color: #5e5e83;
        margin-right: 24px;
        margin-bottom: 24px;
        &.active {
          background-color: #6165c5;
          color: #fff;
        }
      }
    }
  }
  .fade-enter-active {
    transition: all 0.2s ease-in-out;
  }
  .fade-leave-active {
    transition: all 0.2s ease-in-out;
  }
  .fade-enter,
  .fade-leave-to {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
