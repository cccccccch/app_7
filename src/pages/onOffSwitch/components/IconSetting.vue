<template>
  <div class="IconSetting">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title>
        <div class="title title-bar">
          <div class="txt">请选择图标</div>
        </div>
      </template>
      <template v-slot:right><span></span></template>
    </title-bar>
    <div class="IconSetting-title">
      <div class="IconSetting-title-img">
        <img src="@/assets/images/no_scenes.png" alt="" />
      </div>
      <p>客厅灯组</p>
    </div>
    <div class="IconSetting-main">
      <div class="IconSetting-main-box">
        <div class="IconSetting-main-box-item">
          <div class="IconSetting-main-box-item-img" :class="{ active: true }">
            <img src="@/assets/images/scene_bg.png" alt="" />
          </div>
          <p>灯</p>
        </div>
        <div class="IconSetting-main-box-item">
          <div class="IconSetting-main-box-item-img">
            <img src="@/assets/images/scene_bg.png" alt="" />
          </div>
          <p>灯</p>
        </div>
        <div class="IconSetting-main-box-item">
          <div class="IconSetting-main-box-item-img">
            <img src="@/assets/images/scene_bg.png" alt="" />
          </div>
          <p>灯</p>
        </div>
        <div class="IconSetting-main-box-item">
          <div class="IconSetting-main-box-item-img">
            <img src="@/assets/images/scene_bg.png" alt="" />
          </div>
          <p>灯</p>
        </div>
      </div>
      <div class="IconSetting-main-button">
        <button>保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import titleBar from "@/components/titleBar";

export default {
  name: "IconSetting",
  components: {
    titleBar,
  },
  data() {
    return {
      index: 0,
    };
  },
  methods: {
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style scoped lang="less">
.IconSetting {
  box-sizing: border-box;
  background-color: #f0f0fd;
  margin-bottom: 25px;
  min-height: 100vh;
  div.title-bar {
    font-weight: 500 !important;
    font-size: 36px !important;
    div.txt {
      width: fit-content;
      margin: 0 auto;
      transform: translateX(60px);
    }
  }
  .IMG() {
    border-radius: 100%;
    width: 158px;
    height: 158px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .P() {
    margin-top: 10px;
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
  }
  &-title {
    margin: 65px 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &-img {
      .IMG();
      border: 2px solid #6165c5;
    }
    p {
      .P();
    }
  }
  &-main {
    height: 100%;
    background-color: #fff;
    border-radius: 16px 16px 0 0;
    position: relative;
    &-box {
      padding: 40px 78px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      &-item {
        display: flex;
        margin-top: 20px;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 158px;
        &-img {
          .IMG();
        }
        .active {
          border: 2px solid #6165c5;
        }
      }
      p {
        .P();
      }
    }
    &-button{
    position: fixed;
    bottom: 0;
    padding: 40px;
    width: 100%;
    box-sizing: border-box;
    button{
        width: 100%;
        height: 104px;
        background: #6165C5;
        border-radius: 52px;
        border: none;
        font-size: 32px;
        color: #fff;
        line-height: 104px;
    }
  }
  }
 
}
</style>