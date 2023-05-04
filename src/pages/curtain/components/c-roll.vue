<template>
  <!-- EXTERNAL_ROLLER_BLIND: 0, // 卷帘
      EXTERNAL_CURTAIN: 1, // 幕布
      EXTERNAL_SHANGRI_LA_CURTAIN: 2, // 香格里拉帘
      EXTERNAL_VENETAIN_BLIND: 3, // 百叶帘
      EXTERNAL_ROMAN_SHADE: 4, // 罗马帘
      EXTERNAL_ZEBRA_CURTAIN: 5, // 斑马帘
      EXTERNAL_ZEBRA_CURTAIN: 7, // 梦幻帘
      EXTERNAL_ZONEYCOMD_BLINDS: 6 // 蜂巢帘
      EXTERNAL_ZONEYCOMD_BLINDS: 7 // 梦幻帘
       -->
  <div class="c-roll flex-jb-dc" :style="curtainType === 9 ? 'justify-content:flex-start' : ''" v-if="!reRenderCurtain" :class="{ disable: disable }">
    <!-- 卷帘 -->
    <div :class="{ disable: disable }" class="c-top one" v-if="curtainType === 0">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div class="c-move-strip" :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }" ref="moveBox" :style="{ bottom: moveData.move + 'px' }">
          <!-- <div class="strip-bar"></div> -->
          <div class="strip-item" v-for="item of stripLen" :key="item"></div>
        </div>
      </div>

      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!--香格里拉帘 -->
    <div :class="{ disable: disable }" class="c-top one2" v-if="curtainType === 2">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div
          class="c-move-strip"
          :class="{
            touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving,
            'strip-up': curtainMotion && curtainMotion === 'up',
            'strip-down': curtainMotion && curtainMotion === 'down',
          }"
          ref="moveBox"
          :style="{ bottom: moveData.move + 'px' }"
        >
          <div class="strip-bar"></div>

          <div class="strip-item-trans-wrap" v-for="item of stripLen" :key="item">
            <div class="strip-item"></div>
          </div>
        </div>
      </div>

      <div class="angle-box flex-ac-jc-dc" :class="{ disable: movePercent !== 0 }" @click.stop="clickAngleBtn('up', movePercent !== 100)" v-if="!hideBtn && curtainType === 2">
        <div class="angle-top-area flex-ac-jc-dc">
          <span class="iconfont icon-dot i-four"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-drap"></span>
        </div>
        <div class="angle-bot-area flex-ac-jc-dc" @click.stop="clickAngleBtn('down', movePercent !== 100)">
          <span class="iconfont icon-drap"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-four"></span>
        </div>
      </div>

      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!--梦幻帘 -->
    <div :class="{ disable: disable }" class="c-top seven" v-if="curtainType === 9">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div class="warp-left" :style="{ left: -moveData.move + 'px' }" :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }">
          <div class="strip-item-trans-wrap" v-for="item of 10" :key="item">
            <div ref="stripItem" class="strip-item"></div>
          </div>
        </div>
        <div
          class="warp-right"
          ref="warpRight"
          :class="{
            touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving,
            'strip-up': curtainMotion && curtainMotion === 'up',
            'strip-down': curtainMotion && curtainMotion === 'down',
          }"
          :style="{ right: -moveData.move + 'px' }"
        >
          <div class="strip-item-trans-wrap" v-for="item of 10" :key="item">
            <div ref="stripItem2" class="strip-item"></div>
          </div>
        </div>
      </div>

      <div
        class="move-btn"
        ref="moveBtn"
        v-if="!hideBtn && defaultmove"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ left: defaultmove + moveData.move + 'px' }"
        @touchstart="onBtnStart2"
        @touchmove="onBtnMove2"
        @touchend="onBtnEnd2"
      >
        <div class="btn-style">
          <div class="btn-son"></div>
          <div class="btn-son"></div>
          <div class="btn-son"></div>
        </div>
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!-- 幕布 -->
    <div :class="{ disable: disable }" class="c-top two" v-else-if="curtainType === 1">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div class="c-move-strip" :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }" ref="moveBox" :style="{ bottom: moveData.move + 'px' }">
          <div class="strip-area"></div>
        </div>
      </div>
      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ Math.round(100 - movePercent) }}%</div>
      </div>
    </div>
    <!-- 斑马帘 -->
    <div :class="{ disable: disable }" class="c-top three" v-else-if="curtainType === 5">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div
          class="c-move-strip"
          :class="{
            touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving,
            'strip-up': curtainMotion && curtainMotion === 'up',
            'strip-down': curtainMotion && curtainMotion === 'down',
          }"
          ref="moveBox"
          :style="{ bottom: moveData.move + 'px' }"
        >
          <div class="strip-bar"></div>

          <div class="strip-item-trans-wrap" v-for="item of stripLen" :key="item">
            <div class="strip-item"></div>
          </div>
          <!-- <div class="strip-item" v-for="item of stripLen" :key="item"></div> -->
        </div>
      </div>

      <div class="angle-box flex-ac-jc-dc" :class="{ disable: disable }" @click.stop="clickAngleBtn('up')" v-if="!hideBtn">
        <div class="angle-top-area flex-ac-jc-dc">
          <span class="iconfont icon-dot i-four"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-drap"></span>
        </div>
        <div class="angle-bot-area flex-ac-jc-dc" @click.stop="clickAngleBtn('down')">
          <span class="iconfont icon-drap"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-four"></span>
        </div>
      </div>

      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!-- 蜂巢帘 -->
    <div :class="{ disable: disable }" class="c-top four" v-else-if="curtainType === 6">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div
          class="c-move-strip flex-ac-jb-dc"
          :style="{ height: moveMaxHeight - moveData.move + moveBtnRect.height / 2 + 'px' }"
          :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
          ref="moveBox"
        >
          <div class="strip-item-trans-wrap" v-for="item of stripLen" :key="item">
            <div class="strip-item"></div>
          </div>
        </div>
      </div>
      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!-- 罗马帘 -->
    <div :class="{ disable: disable }" class="c-top five" v-if="curtainType === 4">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div class="curtain-top-bg"></div>
        <div class="c-move-strip" :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }" ref="moveBox" :style="{ bottom: moveData.move + 'px' }">
          <div class="curtain-bot-bg"><div></div></div>
          <div class="strip-item" v-for="item of stripLen" :key="item"></div>
        </div>
      </div>
      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <!-- 百叶帘 -->
    <div :class="{ disable: disable }" class="c-top six" v-else-if="curtainType === 3">
      <div class="c-bar" ref="CBar"></div>
      <div class="c-strip-box" ref="stripBox">
        <div
          class="c-move-strip flex-ac-jb-dc"
          :style="{ bottom: moveData.move + 'px' }"
          :class="{
            touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving,
            'strip-up': curtainMotion && curtainMotion === 'up',
            'strip-down': curtainMotion && curtainMotion === 'down',
          }"
          ref="moveBox"
        >
          <div class="strip-item-trans-wrap" v-for="item of stripLen" :key="item">
            <div class="strip-item"></div>
          </div>
        </div>
      </div>
      <div class="angle-box flex-ac-jc-dc" :class="{ disable: disable }" @click.stop="clickAngleBtn('up')" v-if="!hideBtn">
        <div class="angle-top-area flex-ac-jc-dc">
          <span class="iconfont icon-dot i-four"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-drap"></span>
        </div>
        <div class="angle-bot-area flex-ac-jc-dc" @click.stop="clickAngleBtn('down')">
          <span class="iconfont icon-drap"></span>
          <span class="iconfont icon-dot i-one"></span>
          <span class="iconfont icon-dot i-two"></span>
          <span class="iconfont icon-dot i-three"></span>
          <span class="iconfont icon-dot i-four"></span>
        </div>
      </div>
      <div
        class="move-btn iconfont icon-menu-btn"
        ref="moveBtn"
        v-if="!hideBtn"
        :class="{ touch: isTouch || (autoMoveWay && autoMoveWay !== '') || isPercentMoving }"
        :style="{ bottom: moveData.move + 'px' }"
        @touchstart="onBtnStart"
        @touchmove="onBtnMove"
        @touchend="onBtnEnd"
      >
        <div class="tips" v-show="!disable && isTouch">{{ movePercent }}%</div>
      </div>
    </div>
    <div class="c-bot" v-if="!hideBtn && curtainType !== 9">
      <div class="percent-item" @click="clickPercent(0)">{{ getCurtainPreferencePoint[0] }}%</div>
      <div class="percent-item" @click="clickPercent(1)">{{ getCurtainPreferencePoint[1] }}%</div>
      <div class="percent-item" @click="clickPercent(2)">{{ getCurtainPreferencePoint[2] }}%</div>
    </div>
    <div class="c-bot2" v-if="!hideBtn && curtainType == 9">
      <div class="percent-item2" @click="clickPercent(0, getcurtaindegree[0])">{{ getCurtainPreferencePoint[0] }}%,&nbsp;&nbsp;&nbsp;&nbsp;{{ getcurtaindegree[0] }}°</div>
      <div class="percent-item2" @click="clickPercent(1, getcurtaindegree[1])">{{ getCurtainPreferencePoint[1] }}%,&nbsp;&nbsp;&nbsp;&nbsp;{{ getcurtaindegree[1] }}°</div>
      <div class="percent-item2" @click="clickPercent(2, getcurtaindegree[2])">{{ getCurtainPreferencePoint[2] }}%,&nbsp;&nbsp;&nbsp;&nbsp;{{ getcurtaindegree[2] }}°</div>
    </div>
    <div class="divtext" v-if="!hideBtn && curtainType == 9">叶片旋转角度 | {{ Math.round(degree * 1.8) + "°" }}</div>

    <van-slider :disabled="disable || movePercent === 0" v-if="!hideBtn && curtainType === 9" @change="slideronChange" v-model="degree" bar-height="45px" :active-color="disable ? '#c0c0cd' : '#6165C5'">
      <template #button>
        <div class="custom-button">{{ Math.round(degree * 1.8) + "°" }}</div>
      </template>
    </van-slider>
  </div>
</template>
<script>
import { endpointControlRep, groupDeviceListRep } from "../../../api/request";
import { mapGetters } from "vuex";
// import { Slider } from 'vant';
export default {
  name: "c-roll",
  props: {
    hideBtn: {
      type: Boolean,
      default: false,
    },
    disable: {
      type: Boolean,
      default: false,
    },
    curtainPercent: {
      type: Number,
      default: 0,
    },
    autoMoveWay: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      venetainExist: false, // 是否存在百叶帘
      stripLen: 24,
      moveData: {
        start: 0,
        move: 0,
        end: 0,
      },
      moveBtnRect: {
        height: 0,
      },
      moveMaxHeight: 0,
      moveMaxWidth: 0,
      isTouch: false,
      movePercent: 0,
      loopAutoHandler: null,
      loopPercentHandler: null,
      reRenderCurtain: false,
      curtainMotion: "", // 百叶帘动效
      curtainMotionTimer: null,
      isPercentMoving: false, // 是否点击百分比的动画执行中
      degree: 0,
      defaultmove: 0,
      // sevenDegree:{transform: rotateY(10deg)}
    };
  },
  created() {},
  methods: {
    async slideronChange() {
      this.$emit("onMoveCurtain");
      let params = {
        cmdKey: "roll_set_angle",
        endpointId: this.globalDataId,
        cmdValue1: Math.round(this.degree * 1.8),
      };
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "操作失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    clickAngleBtn(type, flag) {
      if (this.disable) {
        this.$emit("onMove");
        return;
      }
      if (flag) {
        this.$emit("onMove");
        return;
      }
      this.curtainMotion = type;
      this.handleSetAngle(type);
      // 这个定时器会还原设置
      clearTimeout(this.curtainMotionTimer);
      this.curtainMotionTimer = setTimeout(() => {
        this.curtainMotion = "";
        clearTimeout(this.curtainMotionTimer);
      }, 1000);
    },
    clickPercent(idx, degree) {
      if (this.disable) {
        this.$emit("onMove");
        return;
      }
      // let y = this.moveMaxHeight * percent;
      // this.moveData.end = y;
      // this.moveData.move = y;
      if (degree) {
        this.$refs.stripItem.forEach((item) => {
          if (degree === 90) {
            item.style.transform = `rotateY(${Math.round(88)}deg)`;
          } else {
            item.style.transform = `rotateY(${Math.round(degree)}deg)`;
          }
        });
        this.$refs.stripItem2.forEach((item) => {
          if (degree === 90) {
            item.style.transform = `rotateY(${Math.round(88)}deg)`;
          } else {
            item.style.transform = `rotateY(${Math.round(degree)}deg)`;
          }
        });

        setTimeout(() => {
          this.setpre(degree);
        }, 3000);
      }

      let percent = idx === 0 ? this.getCurtainPreferencePoint[0] : idx === 1 ? this.getCurtainPreferencePoint[1] : this.getCurtainPreferencePoint[2];
      if (this.curtainType === 1) {
        percent = percent;
      }
      this.handleSetPercent(Math.round(percent));

      this._setPercentMove(percent);
    },
    async setpre(val) {
      this.$emit("onMoveCurtain");
      let params = {
        cmdKey: "roll_set_angle",
        endpointId: this.globalDataId,
        cmdValue1: Math.round(val),
      };
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "操作失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    onBtnStart(e) {
      if (this.disable) return;
      this._destroyMotion();
      this.isTouch = true;
      const y = e.changedTouches[0].clientY;
      this.moveData.start = y; //开始位置
   
    },
    onBtnStart2(e) {
      if (this.disable) return;
      this._destroyMotion();
      this.isTouch = true;
      const x = e.changedTouches[0].clientX;
      this.moveData.start = x; //初始位置
    },
    onBtnMove(e) {
      if (this.disable) {
        this.$emit("onMove");
        return;
      }
      const y = e.changedTouches[0].clientY;

      const dy = this.moveData.start - y; //移动的距离

      let move = this.moveData.end + dy; //移动的距离

      move = move < 0 ? 0 : move > this.moveMaxHeight ? this.moveMaxHeight : move;
      this.moveData.move = move;

      this.movePercent = 100 - Math.round((move / this.moveMaxHeight) * 100);
    },

    onBtnMove2(e) {
      if (this.disable) {
        this.$emit("onMove");
        return;
      }

      const x = e.changedTouches[0].clientX;

      const dx = x - this.moveData.start;


      let move = this.moveData.end + dx;
      move = move < 0 ? 0 : move;
   
      this.moveData.move = move > this.moveMaxWidth ? this.moveMaxWidth : move;
      this.movePercent = 100 - Math.round((move / this.moveMaxWidth) * 100);
      if (this.movePercent > 100) {
        this.movePercent = 100;
      }
      if (this.movePercent < 0) {
        this.movePercent = 0;
      }
   
    },
    onBtnEnd(e) {
      if (this.disable) return;
      this.isTouch = false;
      this.moveData.end = this.moveData.move;
      let v = 100 - Math.round((this.moveData.move / this.moveMaxHeight) * 100);
      this.handleSetPercent(v);
    },
    onBtnEnd2(e) {
      if (this.disable) return;
      this.isTouch = false;
      this.moveData.end = this.moveData.move;
      let v = 100 - Math.round((this.moveData.move / this.moveMaxWidth) * 100);
      this.handleSetPercent(v);
    },
    initStripLen() {
      //初始化进来

      if (this.curtainType === 9) {
        const node = this.$refs.warpRight;
        if (!node) return;
        let rect = node.getBoundingClientRect();
        console.log(rect, "rectrectrectrectrectrect");
        this.moveMaxWidth = rect.width - 10;
        // this.moveData.move = this.moveMaxWidth;
      } else {
        const node = this.$refs.stripBox;
        if (!node) return;
        let rect = node.getBoundingClientRect();
        if (!rect || !rect.height) return;
        const moveBox = this.$refs.moveBox.children[0];
        const moveRect = moveBox.getBoundingClientRect();
        this.moveBtnRect = !this.hideBtn ? this.$refs.moveBtn.getBoundingClientRect() : { height: 0 };
        let itemH = moveRect.height || 24;
        if (this.curtainType === 6 || this.curtainType === 3) {
          itemH = 18;
        }
        this.moveMaxHeight = rect.height - this.moveBtnRect.height / 2 - (this.curtainType === 4 ? this.moveBtnRect.height * 0.8 : 0);
        let len = Math.ceil(rect.height / itemH);
        if (len < 20) {
          len = 20;
        }
        this.stripLen = len;
     
        this._setCurtainPosition();
      }
    },
    _setCurtainPosition() {
      if (this.hideBtn) {
        if (this.curtainType !== 9) {
          this.moveData.move = this.moveMaxHeight * 0.62;
        } else {
          this.moveData.move = this.moveMaxWidth * 0.62;
        }

  
      } else {

        if (this.curtainType !== 9) {
          this.moveData.move = Math.round((this.moveMaxHeight * this.curtainPercent) / 100);
        } else {
          this.moveData.move = Math.round((this.moveMaxWidth * this.curtainPercent) / 100);
        }

        this.moveData.end = this.moveData.move;
        this.movePercent = 100 - this.curtainPercent;
      }
    },
    _setdegree(value) {
      this.degree = Math.round(value / 1.8);
    },
    // 上升下降动画
    _setAutoMotion() {
      this._destroyMotion();
      if (this.autoMoveWay === "" || !this.autoMoveWay) return;
      this.loopAuto();
    },
    loopAuto() {
      // 手指触摸期间不执行任何MQTT操作或动画
      // console.log("进了这里");
      if (this.autoMoveWay === "pause" || !this.autoMoveWay || this.isTouch) {
        // console.log("进了这里1");
        this._destroyMotion();
        return;
      }
      let move = this.moveData.move + (this.autoMoveWay === "up" ? 0.5 : -0.5);

      if ((move > this.moveMaxHeight || move < 0 || this.isTouch) && this.curtainType !== 9) {
        this.loopAutoHandler && cancelAnimationFrame(this.loopAutoHandler);
      } else if ((move > this.moveMaxWidth || move < 0 || this.isTouch) && this.curtainType === 9) {
        this.loopAutoHandler && cancelAnimationFrame(this.loopAutoHandler);
      } else {
  
        this.moveData.move = move;
        this.moveData.end = move;
        this.movePercent = this.curtainType === 9 ? 100 - Math.round((move / this.moveMaxWidth) * 100) : 100 - Math.round((move / this.moveMaxHeight) * 100);
        this.loopAutoHandler = requestAnimationFrame(this.loopAuto);
      }
    },
    // 设置百分比 偏好点动画，这里为了方便维护，暂时和上升下降动画分开写
    _setPercentMove(percent, isFirst) {
      if (this.curtainType === 9) {
        const node = this.$refs.warpRight;
        if (!node) return;
        let rect = node.getBoundingClientRect();

        this.defaultmove = rect.width + 4;
     

        let distance = Math.round((this.moveMaxWidth * (100 - percent)) / 100);
        this._destroyMotion();
        if (this.isTouch) return; // 手指触摸期间不执行任何MQTT操作或动画
        if (distance === this.moveData.move) return;
        if (isFirst) {
          this.movePercent = Math.round(100 - percent);

          this.moveData.end = ((100 - percent) / 100) * this.moveMaxWidth;
          this.moveData.move = ((100 - percent) / 100) * this.moveMaxWidth;
   
          return;
        }
        let way = this.moveData.move < distance ? "up" : "down";
        this.isPercentMoving = true;
        this.loopPercent = () => {
          let move = this.moveData.move + (way === "up" ? 0.5 : -0.5);
          if ((way === "up" && move > distance) || (move < distance && way === "down") || this.isTouch) {
            this.isPercentMoving = false;
            this.loopPercentHandler && window.cancelAnimationFrame(this.loopPercentHandler);
          } else {
            this.moveData.move = move;
            //  console.log("等于几2", this.moveData.move);
            this.moveData.end = move;
            this.movePercent = 100 - Math.round((move / this.moveMaxWidth) * 100);

            this.loopPercentHandler = window.requestAnimationFrame(this.loopPercent);
          }
        };
        this.loopPercent();
      } else {
        let distance = Math.round((this.moveMaxHeight * (100 - percent)) / 100);
    
        this._destroyMotion();
        if (this.isTouch) return; // 手指触摸期间不执行任何MQTT操作或动画
        if (distance === this.moveData.move) return;
        if (isFirst) {
          this.movePercent = Math.round(100 - percent);

          this.moveData.end = ((100 - percent) / 100) * this.moveMaxHeight;
          this.moveData.move = ((100 - percent) / 100) * this.moveMaxHeight;
      
          return;
        }
        let way = this.moveData.move < distance ? "up" : "down";
        this.isPercentMoving = true;
        this.loopPercent = () => {
          let move = this.moveData.move + (way === "up" ? 0.5 : -0.5);
          if ((way === "up" && move > distance) || (move < distance && way === "down") || this.isTouch) {
            this.isPercentMoving = false;
            this.loopPercentHandler && window.cancelAnimationFrame(this.loopPercentHandler);
          } else {
            this.moveData.move = move;
     
            this.moveData.end = move;
            this.movePercent = 100 - Math.round((move / this.moveMaxHeight) * 100);

            this.loopPercentHandler = window.requestAnimationFrame(this.loopPercent);
          }
        };
        this.loopPercent();
      }
    },
    loopPercent(distance) {
      if (this.isTouch) {
        // 手指触摸期间不执行任何MQTT操作或动画
        this._destroyMotion();
        return;
      }
      let way = this.moveData.move < distance ? "up" : "down";
      this.isPercentMoving = true;
      let move = this.moveData.move + (way === "up" ? 0.5 : -0.5);
      if ((way === "up" && move > distance) || (move < distance && way === "down") || this.isTouch) {
        this.isPercentMoving = false;
        this.loopPercentHandler && cancelAnimationFrame(this.loopPercent);
      } else {
        this.moveData.move = move;
   
        this.moveData.end = move;
        if (this.curtainType !== 9) {
          this.movePercent = 100 - Math.round((move / this.moveMaxHeight) * 100);
        } else {
          this.movePercent = 100 - Math.round((move / this.moveMaxWidth) * 100);
        }

        this.loopPercentHandler = requestAnimationFrame(this.loopPercent);
      }
    },
    // 销毁动画
    _destroyMotion() {
      this.loopAutoHandler && cancelAnimationFrame(this.loopAutoHandler);
      this.loopPercentHandler && cancelAnimationFrame(this.loopPercentHandler);
      this.isPercentMoving = false;
    },
    async handleSetPercent(percent) {
      this.$emit("onMoveCurtain"); //没有mqtt消息
      percent = percent > 100 ? 100 : percent < 0 ? 0 : percent;
      let params = {
        cmdKey: "windowCoveringGoToLiftPercent",
        endpointId: this.globalDataId,
        cmdValue1: percent,
      };
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "操作失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    async handleSetAngle(type) {
      let params = {
        cmdKey: "roll_curtains_set_attr",
        endpointId: this.globalDataId,
        cmdValue1: type === "up" ? 7 : 8,
      };
      let result = await endpointControlRep(params);
      if (!result || result.error) {
        let msg = (result && result.error && result.error.msg) || "设置角度失败";
        this.$Toast.show({ title: msg, postion: "middle" });
      }
    },
    // 判断编组是否包含百叶帘
    async checkCurtain() {
      let params = { dataId: this.globalDataId, dataTypeEnum: "endpoint" };
      let { data, error } = await groupDeviceListRep(params);
      if (data && !error) {
        this.venetainExist = data.data.some((e) => e.typeCode == "EXTERNAL_VENETAIN_BLIND");
      }
    },
  },

  beforeDestroy() {
    this._destroyMotion();
  },
  watch: {
    deviceDetail() {
      this.reRenderCurtain = true;
      let timer = setTimeout(() => {
        this.reRenderCurtain = false;
        this.$nextTick(() => {
          this.initStripLen();
        });
      }, 30);
    },
    degree: {
      // immediate: true,
      // deep: true,
      handler(val) {


        this.$refs.stripItem.forEach((item) => {
          if (val === 50) {
            item.style.transform = `rotateY(${Math.round(88)}deg)`;
          } else {
            item.style.transform = `rotateY(${Math.round(val * 1.8)}deg)`;
          }
        });
        this.$refs.stripItem2.forEach((item) => {
          if (val === 50) {
            item.style.transform = `rotateY(${Math.round(88)}deg)`;
          } else {
            item.style.transform = `rotateY(${Math.round(val * 1.8)}deg)`;
          }
        });
      },
    },
  },
  computed: {
    ...mapGetters(["globalDataId", "getCurtainTypeCodes", "deviceDetail", "getCurtainPreferencePoint", "getcurtaindegree"]),
    curtainType() {
      // 编组是否存在百叶帘
      if (this.deviceDetail.ifLogicGroupEnum == "yes" && this.venetainExist) {
        return 3;
      }
      let has =
        this.deviceDetail &&
        this.deviceDetail.deviceBindInfoVoList &&
        this.deviceDetail.deviceBindInfoVoList[0] &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList &&
        this.deviceDetail.deviceBindInfoVoList[0].bindDataList[0];
  
      return !has ? 0 : this.getCurtainTypeCodes[has["typeCode"]];
    },
  },
  mounted() {
    // console.log("curtainType", this.curtainType);

    this.checkCurtain();
    this.initStripLen();
  },
};
</script>
<style lang="less" scoped>
.custom-button {
  width: 85px;
  height: 85px;
  color: black;
  font-size: 26px;
  line-height: 85px;
  text-align: center;
  border-radius: 50% 50%;
  background: #fff;
}
.btn-style {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .btn-son {
    width: 2px;
    height: 30px;
    background: #2f2f4a;
    align-items: center;
    margin-left: 5px;
    margin-right: 5px;
    // margin-right: 10px;
  }
}
.c-roll {
  width: 100%;
  height: 100%;
  &.disable {
    .c-top {
      .move-btn {
        color: #c0c0c0;
      }
    }
    .c-bot {
      .percent-item {
        color: #c0c0cd;
        border-color: #c0c0cd;
      }
    }
  }
  .divtext {
    margin-top: 46px;
    margin-bottom: 50px;
    font-size: #000000;
  }
  .c-top.seven {
    height: 650px;
    flex: 0;
  }
  .c-top {
    // flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0;
    height: calc(100% - 150px);
    position: relative;
    &.one {
      .angle-box {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translate(0, -50%);
        width: 80px;
        height: 100px;
        &.disable {
          .iconfont {
            font-size: 12px;
            line-height: 30px;
            color: rgba(154, 154, 154, 0.5);
          }
        }
        .iconfont {
          font-size: 12px;
          line-height: 30px;
          color: #bed4fe;
          &.i-two {
            font-size: 40px;
          }
          &.i-three {
            font-size: 50px;
          }
          &.i-four {
            font-size: 70px;
          }
          &.icon-drap {
            font-size: 40px;
            margin-bottom: 20px;
          }
        }
        .angle-top-area {
          .icon-drap {
            margin: 20px 0 40px;
            transform: rotate(180deg);
          }
        }
      }
    }
    &.one2 {
      .angle-box {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translate(0, -50%);
        width: 80px;
        height: 100px;
        &.disable {
          .strip-item {
            background-color: #c9c9c9 !important;
          }
          .iconfont {
            font-size: 12px;
            line-height: 30px;
            color: rgba(154, 154, 154, 0.5);
          }
        }
        .iconfont {
          font-size: 12px;
          line-height: 30px;
          color: #bed4fe;
          &.i-two {
            font-size: 40px;
          }
          &.i-three {
            font-size: 50px;
          }
          &.i-four {
            font-size: 70px;
          }
          &.icon-drap {
            font-size: 40px;
            margin-bottom: 20px;
          }
        }
        .angle-top-area {
          .icon-drap {
            margin: 20px 0 40px;
            transform: rotate(180deg);
          }
        }
      }
      .c-move-strip {
        background: none !important;
        &.strip-up {
          .strip-item-trans-wrap {
            .strip-item {
              animation: curtain-strip-up 1s linear;
            }
          }
        }
        &.strip-down {
          .strip-item-trans-wrap {
            .strip-item {
              animation: strip-down 1s linear;
            }
          }
        }
      }
      .strip-item-trans-wrap {
        perspective: 100px;
        width: 100%;

        box-sizing: border-box;
        flex: 1 !important;
        // padding: 0 14px;
      }
      .strip-item {
        // height: 100% !important;

        // background: linear-gradient(rgba(234, 242, 255, 0.93) 0%, #d4e3ff 100%);
        border-top: none !important;
        background: #c5d9fe;
        transform: rotateX(0deg);
        transition: all 0.3s ease-in-out;
      }
    }
    &.one,
    &.one2,
    &.two,
    &.three,
    &.four,
    &.five,
    &.six {
      .c-bar {
        flex: 0 0 22px;
        height: 22px;
        width: 100%;
        background: linear-gradient(180deg, #d1d1d1 0%, #8f8f8f 100%);
        box-shadow: 0px 0px 19px 1px rgba(0, 0, 0, 0.04);
        border-radius: 4px;
      }
      .c-strip-box {
        width: 540px;
        flex: 1;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
        background-color: #fff;
        overflow: hidden;
        position: relative;
        .c-move-strip {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(180deg, #ffffff 0%, #e0ebfe 0%, #c5d9fe 100%);
          display: flex;
          flex-direction: column-reverse;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          transition: all 0.25s ease-in-out 0s;
          &.touch {
            transition: none;
          }
        }
        .strip-bar {
          height: 22px;
          flex: 0 0 22px;
          background: linear-gradient(360deg, rgba(139, 178, 254, 0.91) 0%, rgba(217, 231, 253, 0.93) 100%);
        }
        .strip-item {
          height: 54px;
          border-top: 2px solid #fff;
          box-sizing: border-box;
          flex: 0 0 54px;
          &:first-child {
            border-bottom: 2px solid #fff;
          }
        }
      }

      &.disable {
        .c-strip-box {
          .c-move-strip {
            background: linear-gradient(360deg, rgba(154, 154, 154, 0.91) 0%, rgba(232, 232, 232, 0.93) 100%);
          }
        }
        .strip-bar {
          background: linear-gradient(360deg, rgba(151, 151, 151, 0.91) 0%, rgba(219, 219, 219, 0.93) 100%);
        }
      }
    }
    &.two {
      height: 428px;
      flex: 0 0 428px;
      &.disable {
        .c-bar {
          background: linear-gradient(180deg, #d1d1d1 0%, #8f8f8f 100%);
        }
        .strip-area {
          &::after {
            background-color: #f8f8f8;
          }
        }
      }
      .c-bar {
        flex: 0 0 26px;
        height: 26px;
        background: linear-gradient(360deg, rgba(139, 178, 254, 0.91) 0%, rgba(217, 231, 253, 0.93) 100%);
        box-shadow: none;
      }
      .c-strip-box {
        background-color: unset;
        box-shadow: none;
      }
      .strip-area {
        position: relative;
        height: 100%;
        width: 100%;
        &::after {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 18px;
          bottom: 18px;
          background-color: #f4f8ff;
          content: " ";
        }
      }
    }
    &.three {
      .angle-box {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translate(0, -50%);
        width: 80px;
        height: 100px;
        &.disable {
          .iconfont {
            font-size: 12px;
            line-height: 30px;
            color: rgba(154, 154, 154, 0.5);
          }
        }
        .iconfont {
          font-size: 12px;
          line-height: 30px;
          color: #bed4fe;
          &.i-two {
            font-size: 40px;
          }
          &.i-three {
            font-size: 50px;
          }
          &.i-four {
            font-size: 70px;
          }
          &.icon-drap {
            font-size: 40px;
            margin-bottom: 20px;
          }
        }
        .angle-top-area {
          .icon-drap {
            margin: 20px 0 40px;
            transform: rotate(180deg);
          }
        }
      }
      &.disable {
        .strip-item {
          background-color: #c9c9c9 !important;
        }
      }
      .c-move-strip {
        background: none !important;
        &.strip-up {
          .strip-item-trans-wrap {
            .strip-item {
              animation: curtain-strip-up 1s linear;
            }
          }
        }
        &.strip-down {
          .strip-item-trans-wrap {
            .strip-item {
              animation: strip-down 1s linear;
            }
          }
        }
      }
      .strip-item-trans-wrap {
        perspective: 100px;
        width: 100%;
        padding: 0 14px;
        box-sizing: border-box;
        flex: 1 !important;
        &:nth-child(2n-1) {
          opacity: 0.4;
        }
        .strip-item {
          background-color: #c5d9fe;
        }
      }
    }
    &.four {
      .angle-box {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translate(0, -50%);
        width: 80px;
        height: 100px;
        &.disable {
          .iconfont {
            font-size: 12px;
            line-height: 30px;
            color: rgba(154, 154, 154, 0.5);
          }
        }
        .iconfont {
          font-size: 12px;
          line-height: 30px;
          color: #bed4fe;
          &.i-two {
            font-size: 40px;
          }
          &.i-three {
            font-size: 50px;
          }
          &.i-four {
            font-size: 70px;
          }
          &.icon-drap {
            font-size: 40px;
            margin-bottom: 20px;
          }
        }
        .angle-top-area {
          .icon-drap {
            margin: 20px 0 40px;
            transform: rotate(180deg);
          }
        }
      }
      &.disable {
        .strip-item {
          height: 100% !important;
          border-top: none !important;
          background: linear-gradient(#c5c5c5 0%, #e8e8e8 100%);
          transform: rotateX(10deg);
        }
      }
      .c-move-strip {
        background: none !important;
      }
      .strip-item-trans-wrap {
        perspective: 100px;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
        flex: 1 !important;
        &:nth-child(2n) {
          transform: rotateX(180deg);
          .strip-item {
            border: none !important;
          }
        }
      }
      .strip-item {
        height: 100% !important;
        border-top: none !important;
        background: linear-gradient(#d4e3ff 0%, rgba(234, 242, 255, 0.93) 100%);
        transform: rotateX(10deg);
      }
    }
    &.five {
      &.disable {
        .curtain-top-bg {
          background-image: url("../../../static/images/device/curtain/curtain_rome_top_disable.png");
        }
        .curtain-bot-bg {
          > div {
            background-image: url("../../../static/images/device/curtain/curtain_rome_bot_disable.png");
          }
        }
      }
      .curtain-top-bg {
        position: absolute;
        top: -4px;
        left: -8px;
        right: -8px;
        width: 104%;
        height: 80px;
        background-image: url("../../../static/images/device/curtain/curtain_rome_top.png");
        background-size: cover;
        background-repeat: no-repeat;
        z-index: 8;
      }
      .c-move-strip {
        overflow: unset !important;
        &::after {
          content: "";
          position: absolute;
          left: 25%;
          top: -82px;
          bottom: 0;
          border-left: 1px solid #fff;
          z-index: 5;
          height: 100%;
        }
        &::before {
          content: "";
          position: absolute;
          right: 25%;
          top: -82px;
          bottom: 0;
          border-left: 1px solid #fff;
          z-index: 5;
          height: 100%;
        }
      }
      .curtain-bot-bg {
        width: 100%;
        height: 114px;
        flex: 0 0 114px;
        z-index: 4;
        background-color: #fff;
        > div {
          width: 100%;
          height: 100%;
          background-image: url("../../../static/images/device/curtain/curtain_rome_bot.png");
          background-size: cover;
          background-repeat: no-repeat;
        }
      }
      .move-btn {
        transform: translate(-50%, -30%);
      }
    }
    &.six {
      width: 100%;
      box-sizing: border-box;
      padding: 0 20px;
      position: relative;
      &.disable {
        .strip-item {
          background: linear-gradient(rgba(154, 154, 154, 0.91) 0%, rgba(232, 232, 232, 0.93) 100%);
        }
      }
      .c-move-strip {
        background: none !important;
        &.strip-up {
          .strip-item-trans-wrap {
            .strip-item {
              animation: curtain-strip-up 1s linear;
            }
          }
        }
        &.strip-down {
          .strip-item-trans-wrap {
            .strip-item {
              animation: curtain-strip-down 1s linear;
            }
          }
        }
      }
      .angle-box {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translate(0, -50%);
        width: 80px;
        height: 100px;
        &.disable {
          .iconfont {
            font-size: 12px;
            line-height: 30px;
            color: rgba(154, 154, 154, 0.5);
          }
        }
        .iconfont {
          font-size: 12px;
          line-height: 30px;
          color: #bed4fe;
          &.i-two {
            font-size: 40px;
          }
          &.i-three {
            font-size: 50px;
          }
          &.i-four {
            font-size: 70px;
          }
          &.icon-drap {
            font-size: 40px;
            margin-bottom: 20px;
          }
        }
        .angle-top-area {
          .icon-drap {
            margin: 20px 0 40px;
            transform: rotate(180deg);
          }
        }
      }
      .c-bar {
        width: 526px;
      }
      .c-strip-box {
        width: 462px;
      }
      .strip-item-trans-wrap {
        perspective: 100px;
        width: 100%;
        padding: 0 14px;
        box-sizing: border-box;
        flex: 1 !important;
      }
      .strip-item {
        height: 100% !important;
        border-top: none !important;
        background: linear-gradient(#d4e3ff 0%, rgba(234, 242, 255, 0.93) 100%);
        transform: rotateX(20deg);
        transition: all 0.3s ease-in-out;
      }
    }
    &.seven {
      flex: 1;
      &.disable {
        .c-strip-box {
          .warp-left,
          .warp-right {
            .strip-item-trans-wrap {
              .strip-item {
                background: linear-gradient(360deg, rgba(154, 154, 154, 0.91) 0%, rgba(232, 232, 232, 0.93) 100%);
              }
              .strip-bar {
                background: linear-gradient(360deg, rgba(151, 151, 151, 0.91) 0%, rgba(219, 219, 219, 0.93) 100%);
              }
            }
          }
        }
      }
      .c-bar {
        flex: 0 0 22px;
        height: 22px;
        width: 100%;
        background: linear-gradient(180deg, #d1d1d1 0%, #8f8f8f 100%);
        box-shadow: 0px 0px 19px 1px rgba(0, 0, 0, 0.04);
        border-radius: 4px;
      }
      .c-strip-box {
        width: 590px;
        // height: 600px;
        flex: 1;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
        background-color: #fff;
        overflow: hidden;
        position: relative;
        display: flex;
        justify-content: space-between;
        .warp-left {
          display: flex;
          height: 100%;
          width: 290px;
          position: relative;
          overflow: hidden;
          .strip-item-trans-wrap {
            flex: 1 !important;
            overflow: hidden;

            height: 100%;
            // perspective: 10px;

            .strip-item {
              overflow: hidden;
              // float: left;
              // perspective: 100px;
              box-sizing: border-box;
              border-right: 1px solid #ffffff;
              height: 100%;
              width: 100%;
              background: linear-gradient(180deg, #ffffff 0%, #e0ebfe 0%, #c5d9fe 99.95%);
              border-radius: 0px 0px 100px 100px;
              // transform: rotateY(10deg);
            }
          }
        }
        .warp-right {
          display: flex;
          align-content: flex-end;
          position: relative;
          // transition: all 0.25s ease-in-out 0s;
          height: 100%;
          width: 290px;
          .strip-item-trans-wrap {
            // perspective: 10px;
            width: 100%;
            // box-sizing: border-box;
            flex: 1 !important;
            .strip-item {
              box-sizing: border-box;
              border-right: 1px solid #ffffff;
              height: 100%;
              background: linear-gradient(180deg, #ffffff 0%, #e0ebfe 0%, #c5d9fe 99.95%);
              border-radius: 0px 0px 100px 100px;
            }
          }
        }
      }
      .move-btn {
        position: absolute;
        top: 50%;
        left: 290px;
        transform: translate(-50%, -50%);
        width: 90px;
        height: 90px;
        border-radius: 50%;
        line-height: 90px;
        text-align: center;
        background-color: #fff;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
        z-index: 8;
        font-size: 40px;
        transition: all 0.25s ease-in-out 0s;
        &.touch {
          transition: none;
        }
        .tips {
          position: absolute;
          top: -80px;
          left: 50%;
          font-size: 24px;
          color: #2f2f4a;
          border-radius: 4px;
          box-shadow: 0px 6px 6px 0px #ccdefe;
          background-color: #fff;
          box-sizing: border-box;
          width: 120px;
          height: 60px;
          line-height: 60px;
          text-align: center;
          transform: translateX(-50%);
          &::after {
            position: absolute;
            display: inline-block;
            top: 48px;
            left: 50%;
            width: 0;
            height: 0px;
            content: "";
            border-style: solid;
            border-width: 10px;
            border-color: #fff #fff transparent transparent;
            transform: translate(-50%, 0) rotate(135deg);
            box-shadow: 2px -2px 2px #ccdefe;
          }
        }
      }
    }
    .move-btn {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      width: 90px;
      height: 90px;
      border-radius: 50%;
      line-height: 90px;
      text-align: center;
      background-color: #fff;
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
      z-index: 8;
      font-size: 40px;
      transition: all 0.25s ease-in-out 0s;
      &.touch {
        transition: none;
      }
      .tips {
        position: absolute;
        top: -80px;
        left: 50%;
        font-size: 24px;
        color: #2f2f4a;
        border-radius: 4px;
        box-shadow: 0px 6px 6px 0px #ccdefe;
        background-color: #fff;
        box-sizing: border-box;
        width: 120px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        transform: translateX(-50%);
        &::after {
          position: absolute;
          display: inline-block;
          top: 48px;
          left: 50%;
          width: 0;
          height: 0px;
          content: "";
          border-style: solid;
          border-width: 10px;
          border-color: #fff #fff transparent transparent;
          transform: translate(-50%, 0) rotate(135deg);
          box-shadow: 2px -2px 2px #ccdefe;
        }
        // &.bottom {
        //   top: 120px;
        //   box-shadow: 0px -2px 6px 0px rgba(80, 173, 255, 0.3);
        //   &::after {
        //     top: -8px;
        //     border-color: #fff #fff transparent transparent;
        //     transform: translate(-50%, 0) rotate(-45deg);
        //   }
        // }
      }
    }
  }
  .c-bot {
    height: 60px;
    flex: 0 0 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 0 36px;
    margin-top: 88px;
    .percent-item {
      width: 160px;
      height: 60px;
      border-radius: 30px;
      border: 1px solid #5e5e83;
      text-align: center;
      line-height: 58px;
      box-sizing: border-box;
      font-size: 24px;
      color: #5e5e83;
    }
  }
  .c-bot2 {
    height: 60px;
    flex: 0 0 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    // padding: 0 36px;
    margin-top: 46px;
    .percent-item2 {
      width: 160px;
      height: 60px;
      border-radius: 30px;
      border: 1px solid #5e5e83;
      text-align: center;
      line-height: 58px;
      box-sizing: border-box;
      font-size: 24px;
      color: #5e5e83;
    }
  }
}
@keyframes curtain-strip-up {
  50% {
    transform: rotateX(40deg);
  }
  100% {
    transform: rotateX(20deg);
  }
}
@keyframes curtain-strip-down {
  50% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(20deg);
  }
}
@keyframes strip-down {
  50% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-20deg);
  }
}
</style>
