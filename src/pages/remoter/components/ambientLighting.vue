<template>
  <div class="dont-disturb-setting device-option-normal">
    <title-bar @goBack="goBack" class="title-area">
      <template v-slot:title><span class="title">氛围灯</span></template>
      <template v-slot:right><span></span></template>
    </title-bar>
    <!-- <div>
      <span id="text" v-copy>复制内容测试</span>
    </div> -->
    <!-- <div>
      <span id="text">复制内容测试</span>
      <button @click="copyToClipboard_mixin">复制</button>
    </div> -->
    <div class="main">
      <transition name="opt-slide">
        <div class="options-normal">
          <div class="cell">
            <div class="left">氛围灯</div>
            <div class="right">
              <i-switch @onClickSwitch="clickEffect" v-model="isTrunOnEffectLight" />
            </div>
          </div>
        </div>
      </transition>
      <transition name="opt-slide-two">
        <div class="options-normal">
          <div class="cell" v-if="isTrunOnEffectLight">
            <div class="left">勿扰模式</div>
            <div class="right">
              <i-switch @onClickSwitch="clickDontDistrub" v-model="doNotDisturbEnable" />
            </div>
          </div>
          <div class="cell" v-if="isTrunOnEffectLight && doNotDisturbEnable" @click="clickCell('time')">
            <div class="left">勿扰时间</div>
            <div class="right">
              <span class="tips">{{ doNotDisturb }}</span>
              <span class="iconfont icon-right"></span>
            </div>
          </div>
          <!-- <div class="cell" v-if="isTrunOnEffectLight && doNotDisturbEnable" @click="clickCell('mode')">
            <div class="left">勿扰时间效果</div>
            <div class="right">
              <span class="tips">{{ effectDesc }}</span>
              <span class="iconfont icon-right"></span>
            </div>
          </div> -->
          <div class="cell silder" v-if="isTrunOnEffectLight && doNotDisturbEnable && deviceDetail.typeCode === 'LS10'">
            <Slider @on-change="handleDegree" :initVal="degree" />
          </div>
        </div>
      </transition>
    </div>
    <transition name="countdown">
      <div class="countdown-modal" ref="countdown" @touchmove.stop.prevent @click.stop="forceFocus" v-show="countdownModal">
        <div class="mask" @click="clickOption('cancel')"></div>
        <transition name="options-ani">
          <div class="options-box" v-show="isShowOption">
            <div class="options">
              <div class="option-text first-option" @click="clickOption('dark')">
                {{ deviceDetail.typeCode === "LS10" ? "较暗" : "自定义亮度" }}
              </div>
              <div class="border"></div>
              <div class="option-text last-option" @click="clickOption('close')">关闭</div>
            </div>
            <div class="cancel" @click="clickOption('cancel')">取消</div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script>
// let clickOutside = "";
import copyToClipboard from "../../../mixins/copyToClipboard";
import titleBar from "@/components/titleBar";
import { EnableEffectLightRep, UpdateEffectLightRep, endpointControlRep, setDeviceAttrUrlReq, UpdateByDeviceRc01Req } from "@/api/request";
import { CMD_KEY } from "../../socket/cmdkey";
import { mapGetters, mapMutations } from "vuex";
import iSwitch from "@/components/switch";
import Slider from "../../socket/components/Slider.vue";
export default {
  mixins: [copyToClipboard],
  name: "EffectLightSetting",
  data() {
    return {
      closeTimeMinutes: 15,
      isTrunOnEffectLight: false,
      doNotDisturbEnable: false,
      isShowOption: false,
      countdownModal: false,
      workTimer: 0,
      degree: 0,
    };
  },
  directives: {
    copy: {
      // 指令的定义
      inserted(dom, obj) {
        console.log(dom.innerHTML);
        clickOutside = (e) => {
          // 点击当前指令所在dom区域外才执行相应方法
          // 当前点击的dom是否属于指令所在dom内
          // 指令所在dom包含点击的dom  contains
          // console.log('clickOutside')
          // e.target就是当前点击的dom
          if (dom.contains(e.target)) {
            navigator.clipboard.writeText(dom.innerHTML);
            alert("复制成功 ");
          }
        };
        document.addEventListener("click", clickOutside);
      },
      unbind() {
        document.removeEventListener("click", clickOutside);
      },
    },
  },
  methods: {
    ...mapMutations(["setDeviceDetail"]),
    test() {
      // let a = {
      //   num: 1,
      //   valueOf: function () {
      //     return this.num++;
      //   },
      // };
      // console.log(a==1&&a==2&&a==3);
      let a = [5,6,8,55,6,99,1]
      const b = a.sort((a,b)=>a-b)
      console.log(b.reverse()[0]);
      const c = Math.max.apply(null,a)
      console.log(c);
      const d =a.reduce((p,v)=>p>=v?p:v)
      console.log(d,'red');
      const e = Math.max(...a)
      console.log(`%c数组${a}%c最大值为${e} %c`,'color:#fff;font-size:10px;background:#35495e;padding:5px;border-radius:3px 0 0 3px','color:#fff;padding:5px;font-size:10px;background:#41b883;border-radius:0 3px 3px 0','background:transparent');
    },

    onChange() {},

    copyToClipboard() {
      //获取复制目标标签
      const txt = document.querySelector("#text");
      //由于目标标签可能非input 则创建一个input并加入当前body
      const input = document.createElement("input");
      //设置input框只读 防止ios输入框弹起
      input.setAttribute("readonly", "readonly");
      document.body.appendChild(input);
      // 文本内容
      input.setAttribute("value", txt.innerText);
      // 解决ios选中区域缺失 若length依然未获取到全部内容 则setSelectionRange(0, 9999)
      input.setSelectionRange(0, input.value.length);
      // 选中区域
      input.select();
      // navigator.clipboard.writeText()此方法存在安全域问题
      // 某些浏览器禁用了非安全域的 navigator.clipboard 对象，这时候navigator.clipboard不可用，就需要我们使用已弃用的document.execCommand(‘copy’)
      // navigator.clipboard.writeText(val.target.innerText)
      document.execCommand("copy") ? this.$Toast.show({ title: "复制成功", postion: "middle" }) : this.$Toast.show({ title: "复制失败", postion: "middle" });
      // if(document.execCommand('copy')){
      //     // document.execCommand('copy')
      //     this.$Toast.show({ title: "复制成功" ,postion:'middle'});
      // }else{
      //     this.$Toast.show({ title: "复制失败" ,postion:'middle'});
      // }
      //清除当前选中区的选中状态
      document.execCommand("unselect", "false", null);
      // 清除创建的input
      document.body.removeChild(input);
    },

    goBack() {
      this.$router.back();
    },

    async clickEffect() {
      let params = {
        endpointId: this.globalDataId,
        attrKey: CMD_KEY.SET_WORK_LIGHT_ON_OFF,
        attrValue: !this.isTrunOnEffectLight ? "0" : "1",
      };
      let { data, error } = await setDeviceAttrUrlReq(params);
      if (!error) {
      } else {
        this.isTrunOnEffectLight = !this.isTrunOnEffectLight;
      }
    },
    forceFocus(e) {
      e && e.preventDefault();
      e && e.stopPropagation();
    },
    async clickDontDistrub() {
      let { data, error } = await EnableEffectLightRep({
        endpointId: this.globalDataId,
        ifEnableEnum: this.doNotDisturbEnable ? "yes" : "no",
      });

      if (!error) {
      } else {
        this.doNotDisturbEnable = !this.doNotDisturbEnable;
      }
    },
    clickCell(name) {
      if (name === "mode") {
        this.isShowOption = true;
        this.countdownModal = true;
      } else if (name === "time") {
        this.$router.push({
          name: "DoNotDisturbSetting",
          query: { slideWay: "left" },
        });
      }
    },
    handleDegree(val) {
      this.degree = val;
      // TODO 发送指令
    },
    closeCountdownModal() {
      this.isShowOption = false;
      this.countdownModal = false;
    },
    clickOption(optionName) {
      if (optionName == "cancel") {
        this.closeCountdownModal();
      } else if (optionName == "dark") {
        this.updateEffectLight("1");
      } else if (optionName == "close") {
        this.updateEffectLight("2");
      }
    },
    onTimeChange(data) {
      this.closeTimeMinutes = data.hour * 60 + data.minute;
    },
    async updateEffectLight(type) {
      let { error } = await UpdateEffectLightRep({
        endTimeMinutes: this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_end_time_minutes,
        endpointId: this.globalDataId,
        startTimeMinutes: this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_start_time_minutes,
        type,
      });
      if (!error) {
        const data = this.deviceDetail;
        data.deviceAttributeValueVoList.effect_light_dnd_mode_type = type;
        this.setDeviceDetail(data);
        this.closeCountdownModal();
      }
    },
  },
  created() {
    this.test();
    if (this.deviceDetail.deviceAttributeValueVoList) {
      this.doNotDisturbEnable = this.deviceDetail.deviceAttributeValueVoList.effect_light_dnd_mode_if_enable === "1";
    }
    this.isTrunOnEffectLight = this.getSocketEffectLight;
  },
  beforeRouteEnter(to, from, next) {
    if (from.meta.level > to.meta.level) {
      to.query.slideWay = "right";
    }
    next();
  },
  computed: {
    ...mapGetters(["deviceDetail", "globalFamilyId", "globalDataId", "globalDeviceMac"]),
    ...mapGetters({ getSocketEffectLight: "schedule/getEffectLight" }),
    doNotDisturb() {
      if (this.deviceDetail.deviceAttributeValueVoList) {
        const detail = this.deviceDetail.deviceAttributeValueVoList;
        let start = detail.effect_light_dnd_mode_start_time_minutes;
        let end = detail.effect_light_dnd_mode_end_time_minutes;

        start = isNaN(start) ? 1260 : ~~start;
        end = isNaN(end) ? 1980 : ~~end;
        return `${Math.floor(start / 60)}: ${(start % 60).toString().padStart(2, "0")} - ${end >= 24 * 60 ? "次日" : ""}${Math.floor(end / 60) % 24}: ${(end % 60).toString().padStart(2, "0")}`;
      } else {
        return "";
      }
    },
    effectDesc() {
      const secondary = this.deviceDetail.typeCode === "LS10" ? "较暗" : "自定义亮度";
      const { effect_light_dnd_mode_type } = this.deviceDetail.deviceAttributeValueVoList || {};
      if (effect_light_dnd_mode_type === "1") {
        return secondary;
      } else {
        return "关闭";
      }
    },
  },
  watch: {
    getSocketEffectLight(val) {
      this.isTrunOnEffectLight = val;
    },
  },
  components: {
    titleBar,
    iSwitch,
    Slider,
  },
};
</script>
<style lang="less" scoped>
@import "../../../common/css/device-option.less";
.dont-disturb-setting {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0fd;
  font-weight: 400;
  color: #000000;
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
      color: #797979;
    }
  }
  .main {
    flex: 1;
    .silder {
      padding-left: 12px;
      padding-right: 52px;
    }
  }
  .countdown-modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99;
    .mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }

    .options-box {
      position: absolute;
      z-index: 2;
      left: 0;
      right: 0;
      bottom: 0;
      border-top-left-radius: 50px;
      border-top-right-radius: 50px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
      .options {
        height: 234px;
        border-radius: 16px;
        background: #ffffff;
        width: 100%;
        flex-direction: column;
        align-items: center;
        display: flex;
        margin-bottom: 16px;
        justify-content: space-evenly;
        .border {
          width: 100%;
          height: 2px;
          background: rgba(17, 17, 17, 0.3);
          opacity: 0.5;
        }
        .option-text {
          padding: 16px;
          text-align: center;
          width: 100%;
          height: 45px;
          font-size: 32px;

          font-weight: 400;
          color: #4289ff;
          line-height: 45px;
        }
        .first-option {
        }
        .last-option {
        }
      }
      .cancel {
        transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
        height: 117px;
        font-size: 32px;
        width: 100%;
        color: #959495;
        background: #ffffff;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s ease-out;
}
.slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(-100%);
}
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.15s;
}
.countdown-enter, .countdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.options-box-show {
  transform: translateY(0) !important;
}
.options-ani-enter-active {
  animation: slide-in 0.15s linear;
}

.options-ani-leave-active {
  animation: slide-in 0.15s linear reverse;
}

@keyframes slide-in {
  0% {
    transform: translateY(267px);
  }
  100% {
    transform: translateY(0) !important;
  }
}
</style>
