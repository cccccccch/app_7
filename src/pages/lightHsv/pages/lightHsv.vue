<template>
  <div id="lightHsv" :class="{ active: mqttData.isLightOn && mqttData.isOnLine }">
    <TitleBarHSV :title="deviceDetail.deviceName" @goBack="goback" optionType="light" />
    <div class="light-wrap">
      <img src="../../../assets/images/light.png" class="light" alt="" />
      <img src="../../../assets/images/light_bot.png" class="light-bot" alt="" />
      <div class="light-box-wrap">
        <div
          class="light-box"
          :style="{ 'box-shadow': mqttData.isLightOn ? `0px 0px 46px 40px rgba(${lightColor[0] | 0},${lightColor[1] | 0},${lightColor[2] | 0}, ${lightColor[3]})` : '', opacity: lightOpacity }"
        ></div>
      </div>
    </div>
    <div class="degrees">
      <span class="degree-num">{{ mqttData.degree }}</span>
      <span class="degree-text">灯光亮度，%</span>
    </div>
    <!-- 刻度模块 -->
    <div class="degree-wrap" ref="degreeWrap" @touchstart="showPanel(true)">
      <degree-slide @onSlide="onSlide" @onFingerTouch="onFingerTouch($event, 'degree')" :curDegree="mqttData.degree" :isLightOn="mqttData.isLightOn" :miniDegree="miniDegree" ref="degreeSlideComp" />
    </div>
    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="left" v-if="lightDeviceType !== 4 && lightDeviceType !== ''">
        <div class="item" @click="showPanel(true, modePanelData, 'mode')">
          <span class="icon icon-mode"></span>
          <span class="name">模式</span>
        </div>
        <div class="item center" v-if="lightDeviceType === 1 || lightDeviceType === 3" @click="showPanel(true, tempraturePanelData, 'temprature')">
          <span class="icon icon-temprature"></span>
          <span class="name">色温</span>
        </div>
        <div class="item" v-if="lightDeviceType === 1 || lightDeviceType === 2" @click="showPanel(true, colorPanelData, 'color')">
          <span class="icon icon-colorpanel"></span>
          <span class="name">颜色 </span>
        </div>
      </div>
      <div class="right switch icon-switch" :class="{ active: mqttData.isLightOn && mqttData.isOnLine }" @click="onSwithChange"></div>
    </div>
    <!-- 模式弹窗 -->
    <div class="mode-panel" :class="{ active: modePanelData.isShow }" @transitionend="onTransitionEnd">
      <div
        class="mask"
        :style="{ opacity: (300 - modePanelData.movingTop) / 300 < 0.1 ? 0.1 : (300 - modePanelData.movingTop) / 300 }"
        v-show="modePanelData.isShow"
        @touchstart.prevent="showPanel(false, modePanelData, 'mode')"
      ></div>
      <div
        class="content"
        :style="{ top: modePanelData.movingTop + 'px', transition: modePanelData.isMoving ? 'none' : '' }"
        @touchstart="onTouchModeStart"
        @touchmove="onTouchModeMove"
        @touchend="onTouchModeEnd"
      >
        <div class="icon" @click="showPanel(false, modePanelData, 'mode')"></div>
        <div class="mode-list" @touchstart.stop @touchmove.stop>
          <div class="mode-item" v-for="(item, idx) of modeLists" @click.stop="onSelectMode(item)" :key="idx" :style="{ 'background-image': `url(${item.iconUrlAbs})` }">
            <div class="roll-wrap" v-if="item.isLoading"><loading-icon v-model="item.isLoading" :strokeWidth="2" /></div>
            <span class="mode-name">{{ item.modeName }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 色温弹窗 -->
    <div class="temprature-panel" :class="{ active: tempraturePanelData.isShow }" @transitionend="onTransitionEnd">
      <div class="mask" v-show="tempraturePanelData.isShow" @touchstart.prevent="showPanel(false, tempraturePanelData, 'temprature')"></div>
      <div
        class="content"
        :style="{ top: tempraturePanelData.movingTop + 'px', transition: tempraturePanelData.isMoving ? 'none' : '' }"
        @touchstart="onTouchTempratureStart"
        @touchmove="onTouchTempratureMove"
        @touchend="onTouchTempratureEnd"
      >
        <div class="icon" @click="showPanel(false, tempraturePanelData, 'temprature')"></div>
        <div class="btns">
          <div v-show="tempraturePanelData.isEdit">
            <span style="color: #979797" @click.stop="cancelTempratureEdit">取消</span>
            <span @click.stop="saveTempratureEdit">保存</span>
          </div>
        </div>
        <div class="list">
          <div
            class="item iconfont"
            :class="{
              'icon-edit': !tempraturePanelData.isEdit && idx === tempraturePanelData.selectedIdx,
              active: tempraturePanelData.isEdit && idx === tempraturePanelData.selectedIdx,
            }"
            v-for="(item, idx) of defaultTempratureColors"
            :key="idx"
            :style="{ background: item }"
            @click.stop="onSelectTemColor(item, idx)"
          ></div>
        </div>
        <div class="pie-area" @touchstart.stop @touchmove.stop>
          <temprature-select
            :lightType="lightCateType"
            @onFingerTouch="onFingerTouch($event, 'temprature')"
            @onTempratureChange="onTempratureChange"
            ref="tempratureSelect"
            :curTemprature="mqttData.curTemprature"
          />
        </div>
      </div>
    </div>
    <!-- 颜色弹窗 -->
    <div class="color-panel" :class="{ active: colorPanelData.isShow }" @transitionend="onTransitionEnd">
      <div class="mask" v-show="colorPanelData.isShow" @touchstart.prevent="showPanel(false, colorPanelData, 'color')"></div>
      <div
        class="content"
        :style="{ top: colorPanelData.movingTop + 'px', transition: colorPanelData.isMoving ? 'none' : '' }"
        @touchstart="onTouchColorStart"
        @touchmove="onTouchColorMove"
        @touchend="onTouchColorEnd"
      >
        <div class="icon" @click="showPanel(false, colorPanelData, 'color')"></div>
        <div class="btns">
          <div v-show="colorPanelData.isEdit">
            <span style="color: #979797" @click.stop="cancelColorEdit">取消</span>
            <span @click.stop="saveColorEdit">保存</span>
          </div>
        </div>
        <div class="list">
          <div
            class="item iconfont"
            :class="{
              'icon-edit': !colorPanelData.isEdit && idx === colorPanelData.selectedIdx,
              active: colorPanelData.isEdit && idx === colorPanelData.selectedIdx,
            }"
            v-for="(item, idx) of hsvColorPickerColors"
            :key="idx"
            :style="{ background: item ? 'rgba(' + item.rgba[0] + ',' + item.rgba[1] + ',' + item.rgba[2] + ',' + item.rgba[3] + ')' : '' }"
            @click.stop="onSelectColor(item, idx)"
          ></div>
        </div>
        <div class="color-picker-area" @touchstart.stop @touchmove.stop>
          <ColorPickerHsv @onFingerTouch="onFingerTouch($event, 'color')" @colorChange="colorChange" ref="colorPicker" />
        </div>
      </div>
    </div>
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="chilModeModal" title="温馨提示" content="您已开启【儿童模式】，色温不可高于4500K" cancelText="我知道了" okText="前往设置" @on-ok="onChilModeOk" @on-cancel="onChilModeCancel" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
  </div>
</template>

<script>
import DegreeSlide from "../../../components/DegreeSlide";
import TempratureSelect from "../../../components/TempratureSelect";
import ColorPickerHsv from "../components/ColorPicker";
import { CDUnTouch } from "../../../directive/index";
import { templatureColor, hex2rgb, deviceZigbeeType, templatureColor_BW } from "../../../utils/index";
import LoadingIcon from "../../../components/rollLoading";
import { deviceDetailRep, modeListRep, lightModeChangeRep, endpointControlRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import TitleBarHSV from "../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import { formatMQTTData } from "../../../utils/socketUtil";
import pageMixins from "../mixins/index";

export default {
  name: "lightHsv",
  mixins: [pageMixins],
  data() {
    return {
      lightCateType: 0, // 0普通灯，1榜威灯， 这两种等的色温范围不同
      mqttData: {
        isLightOn: false,
        isOnLine: false,
        onLineValue: 0,
        curTemprature: 2700,
        degree: 1,
        lightOnStep: 1,
        lightOffStep: 1,
        lightHues: 0,
        lightSaturation: 0,
      },
      chilModeModal: false,
      miniDegree: false,
      lightOpacity: 0.6,
      modePanelData: {
        isShow: false,
        isMoving: false,
        movingTop: 0,
        startY: 0,
      },
      tempraturePanelData: {
        isShow: false,
        isMoving: false,
        movingTop: 0,
        startY: 0,
        selectedIdx: -1,
        isEdit: false,
        selectColor: "",
        curColor: "",
        waitMqttList: [], // 避免色盘乱跳
        timer: null, // 定时器，如果4s内没有mqtt上来，就返回上一次有效的mqtt值
        lastMqttTemprature: null, // 上一次有效的mqtt值
      },
      colorPanelData: {
        isShow: false,
        isMoving: false,
        movingTop: 0,
        startY: 0,
        selectedIdx: -1,
        isEdit: false,
        curItem: "",
        waitMqttList: [], // 避免色盘乱跳
        timer: null, // 定时器，如果4s内没有mqtt上来，就返回上一次有效的mqtt值
        lastMqttColor: { h: 0, s: 0 }, // 上一次有效的mqtt值
      },
      modeLists: [],
      lightColor: [255, 255, 255, 1],
      deviceDisableContent: "",
      deviceDisableModal: false,
      lightOperateTimer: null, // 开关按钮点击间隔， 500ms
      onFingerTouchTarget: null, // color, temprature, degree
      upgradeContent: "发现新版本",
      upgradeModal: false,
      lightDeviceType: "", // 1：全彩  2：颜色  3：色温 4：单色
      templatureColor: templatureColor,
      waitMQTTtimeout: 12000, // mqtt timeout
    };
  },
  methods: {
    ...mapMutations([
      "setLightStatus",
      "setCurTemprature",
      "setGlobalDeviceStatus",
      "changeTempratureColors",
      "setDataToNative",
      "changeHsvPickerColors",
      "setGlobalMac",
      "setDeviceDetail",
      "setChildMode",
      "setLightOnStatus",
      "setElectriDefaultLightStatus",
      "setLightOnOffStep",
    ]),
    goback() {
      if (this.getDeviceDelFromCurHomeList) {
        execNativeFunc("onDataChannel", {
          type: 2,
        });
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    onUpgradeOk() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      }
      execNativeFunc("onNavigateTo", { type: 1, data: this.deviceDetail });
    },
    onUpgradeCancel() {
      if (this.deviceDetail.upgradeType !== 2) {
        this.upgradeModal = false;
      } else {
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
    // 手指是否正在触摸某个组件
    onFingerTouch(flag, type) {
      this.onFingerTouchTarget = flag ? type : null;
    },
    colorChange(data) {
      if (data.isTouchEnd) {
        this.handleChangeColor(data);
      }
      if (this.colorPanelData.isEdit) {
        // 如果是编辑状态
        this.changeHsvPickerColors({ h: data.hue, s: data.saturation, idx: this.colorPanelData.selectedIdx, rgba: data.rgba });
      } else {
        this.colorPanelData.curItem = "";
        this.colorPanelData.selectedIdx = -1;
      }
      this.setLightShadowColor("color", { color: data.rgba });
    },
    // 色温弹窗取消默认颜色编辑
    cancelTempratureEdit() {
      this.$refs.tempratureSelect._setIndicatorByColor(this.tempraturePanelData.curColor);
      let index = this.tempraturePanelData.selectedIdx;
      for (let i = 0, len = this.templatureColor.length; i < len; i++) {
        if (this.templatureColor[i] === this.tempraturePanelData.curColor) {
          index = i;
          break;
        }
      }
      this.handleTemprature({ templature: 6500 - index * 100, color: this.templatureColor[index] });
      this.changeTempratureColors({ idx: this.tempraturePanelData.selectedIdx, color: this.templatureColor[index] });
      this.$nextTick(() => {
        this.tempraturePanelData.isEdit = false;
        this.tempraturePanelData.curColor = "";
        this.tempraturePanelData.selectedIdx = -1;
        this.tempraturePanelData.selectColor = "";
      });
    },
    // 色温默认列表选择确认
    saveTempratureEdit() {
      this.setDataToNative({ key: "tempratureColors", data: this.defaultTempratureColors });
      this.$nextTick(() => {
        this.tempraturePanelData.isEdit = false;
        this.tempraturePanelData.curColor = "";
        this.tempraturePanelData.selectedIdx = -1;
        this.tempraturePanelData.selectColor = "";
      });
    },
    cancelColorEdit() {
      this.$refs.colorPicker._getPositionByHue(this.colorPanelData.curItem.h, this.colorPanelData.curItem.s);
      this.changeHsvPickerColors({ h: this.colorPanelData.curItem.h, s: this.colorPanelData.curItem.s, idx: this.colorPanelData.selectedIdx, rgba: this.colorPanelData.curItem.rgba });
      this.setLightShadowColor("color", { color: this.colorPanelData.curItem.rgba });
      this.handleChangeColor({ hue: this.colorPanelData.curItem.h, saturation: this.colorPanelData.curItem.s });
      this.$nextTick(() => {
        this.colorPanelData.isEdit = false;
        this.colorPanelData.curItem = null;
        this.colorPanelData.selectedIdx = -1;
      });
    },
    saveColorEdit() {
      this.setDataToNative({ key: "hsvPickerColors", data: this.hsvColorPickerColors });
      this.$nextTick(() => {
        this.colorPanelData.isEdit = false;
        this.colorPanelData.curItem = null;
        this.colorPanelData.selectedIdx = -1;
      });
    },
    // 颜色默认列表选择
    onSelectColor(item, idx) {
      if (this.colorPanelData.isEdit) return;
      this.setLightShadowColor("color", { color: item.rgba });
      if (this.colorPanelData.selectedIdx !== idx) {
        this.colorPanelData.curItem = item;
        this.colorPanelData.selectedIdx = idx;
        this.$refs.colorPicker._getPositionByHue(item.h, item.s);
        this.handleChangeColor({ hue: item.h, saturation: item.s });
      } else {
        // 编辑
        this.colorPanelData.isEdit = true;
        this.colorPanelData.selectColor = item.color;
      }
    },
    // 色温默认列表选择
    onSelectTemColor(color, idx) {
      if (this.tempraturePanelData.isEdit) return;
      this.setLightShadowColor("temprature", { color });
      if (this.tempraturePanelData.selectedIdx !== idx) {
        this.tempraturePanelData.curColor = color;
        let isOverChildMode = false;
        for (let i = 0, len = this.templatureColor.length; i < len; i++) {
          if (this.templatureColor[i] === color) {
            let templature = 6500 - i * 100;
            if (this.childMode && templature > 4500) {
              isOverChildMode = true;
              this.chilModeModal = true;
              break;
            }
            this.handleTemprature({ color: color, templature: templature });
            break;
          }
        }
        if (!isOverChildMode) {
          this.tempraturePanelData.selectedIdx = idx;
          this.$refs.tempratureSelect._setIndicatorByColor(color);
        }
      } else {
        // 编辑
        this.tempraturePanelData.isEdit = true;
        this.tempraturePanelData.selectColor = color;
      }
    },
    //儿童模式确认
    onChilModeOk() {
      this.showPanel(false, this.tempraturePanelData, "temprature");
      this.setChildModeLimit();
      this.$router.push({ name: "childMode", query: { slideWay: "left" } });
    },
    //儿童模式取消
    onChilModeCancel() {
      this.setChildModeLimit();
      if (this.tempraturePanelData.isEdit) {
        let idx = 22; // 儿童模式最高色温idx是22
        this.tempraturePanelData.selectColor = this.templatureColor[idx];
      } else {
        this.tempraturePanelData.selectedIdx = -1;
      }
    },
    setChildModeLimit() {
      this.mqttData.curTemprature = 4500;
      this.handleTemprature({ templature: this.mqttData.curTemprature });
      this.$nextTick(() => {
        this.$refs.tempratureSelect._setIndicatorByTemprature(this.mqttData.curTemprature);
      });
    },
    // 开关切换
    onSwithChange(data) {

      if (!this.mqttData.isOnLine) {
        this._showOfflineModal();
        return;
      }
      if (this.lightOperateTimer) return;
      this.lightOperateTimer = setTimeout(() => {
        this.lightOperateTimer = null;
        this.lightOperateTimer && clearTimeout(this.lightOperateTimer);
      }, 500);
      // 灯组key: open/close, 单个灯: toggle.   value值随意， on/off皆可
      // 通过ifLogicGroupEnum判断是否是分组
      let type = this.deviceDetail.ifLogicGroupEnum === "yes" ? "group" : "sigle";
      let params = {
        endpointId: this.globalDataId,
        cmdKey: "toggle",
      };
      if (type === "group") {
        let value = this.mqttData.isLightOn ? "close" : "open";
        params.cmdKey = value;
      }
      this.handleToggle(params);
    },
    // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
      console.log(this.globalDeviceStatus, "this.globalDeviceStatusthis.globalDeviceStatusthis.globalDeviceStatus");
      let num = Number(this.globalDeviceStatus);
      if (typeof num !== "number") return;
      if (num === 4) {
        txt = "设备离网，请重新入网使用";
      } else if (num === 7) {
        txt = "设备配置中，请稍等片刻";
      } else {
        txt = "设备离线，暂时无法操作";
      }
      this.deviceDisableContent = txt;
      this.deviceDisableModal = true;
    },
    // 设置图片灯显示的颜色
    setLightShadowColor(type, data) {
      if (type === "temprature") {
        let idx = 0;
        if (data.templature) {
          idx = (6500 - data.templature) / 100;
          idx = idx > this.templatureColor.length - 1 ? this.templatureColor.length - 1 : idx;
        }
        let color = data.color || this.templatureColor[idx];
        this.lightColor = [...hex2rgb(color), 1];
      } else if (type === "color") {
        this.lightColor = data.color;
      }
    },
    // 点击按钮，弹出弹窗 or 关闭弹窗
    showPanel(value, data, type) {

      if (value) {
        if (!this.mqttData.isOnLine) {
          return this._showOfflineModal();
        }
        if (!this.mqttData.isLightOn) {
          this.deviceDisableContent = "设备未开启，暂不支持该操作";
          this.deviceDisableModal = true;
          return;
        }
      }
      if (!data || !type) return;
      data.isShow = value;
      if (value && (type === "color" || type === "temprature")) {
        this.miniDegree = true;
      } else {
        if (!value && type === "temprature" && this.tempraturePanelData.isEdit) {
          this.cancelTempratureEdit();
        }
        this.miniDegree = false;
        this.tempraturePanelData.selectedIdx = -1;
        (this.colorPanelData.isEdit || this.colorPanelData.selectedIdx >= 0) && this.cancelColorEdit();
      }
      this._handleMiniDegree();
    },
    _handleMiniDegree() {
      let time = this.miniDegree ? 150 : 0;
      let timer = setTimeout(() => {
        let degreeSlideComp = this.$refs.degreeSlideComp;
        if (!degreeSlideComp) return;
        let num = this.miniDegree ? 16 : 28;
        degreeSlideComp.setDPR(num);
        // 保证dpr等设置成功后再重置刻度线
        this.$nextTick(() => {
          degreeSlideComp.setLinesOffset();
        });
        timer && clearTimeout(timer);
      }, time);
    },
    // ---------------------没错，这里就是故意这样写的 start------------------------- //
    onTouchTempratureStart(e) {
      this.handleTouchPanelStart(e, this.tempraturePanelData);
    },
    onTouchTempratureMove(e) {
      this.handleTouchPanelMove(e, this.tempraturePanelData);
    },
    onTouchTempratureEnd(e) {
      this.handleTouchPanelEnd(e, this.tempraturePanelData);
    },
    onTouchModeStart(e) {
      this.handleTouchPanelStart(e, this.modePanelData);
    },
    onTouchModeMove(e) {
      this.handleTouchPanelMove(e, this.modePanelData);
    },
    onTouchModeEnd(e) {
      this.handleTouchPanelEnd(e, this.modePanelData);
    },
    onTouchColorStart(e) {
      this.handleTouchPanelStart(e, this.colorPanelData);
    },
    onTouchColorMove(e) {
      this.handleTouchPanelMove(e, this.colorPanelData);
    },
    onTouchColorEnd(e) {
      this.handleTouchPanelEnd(e, this.colorPanelData);
    },
    // ---------------------没错，这里就是故意这样写的 end------------------------- //
    handleTouchPanelStart(e, data) {
      data.isMoving = true;
      data.startY = e.changedTouches[0].clientY;
    },
    handleTouchPanelMove(e, data) {
      let top = e.changedTouches[0].clientY - data.startY;
      if (top <= 0) return;
      data.movingTop = top;
    },
    handleTouchPanelEnd(e, data) {
      data.isMoving = false;
      if (data.movingTop > 80) {
        data.isShow = false;
      } else {
        data.movingTop = 0;
        data.startY = 0;
      }
    },
    onTransitionEnd() {
      this.$nextTick(() => {
        this.modePanelData.movingTop = 0;
        this.modePanelData.startY = 0;
        this.tempraturePanelData.movingTop = 0;
        this.tempraturePanelData.startY = 0;
        this.colorPanelData.movingTop = 0;
        this.colorPanelData.startY = 0;
      });
    }, // 模式选择
    onSelectMode(item) {
      if (item.isLoading) return;
      this.selectMode = item.id;
      item.isLoading = true;
      this.handleChangeLightMode(item);
    },
    // 色温变化
    onTempratureChange(data) {
      this.setLightShadowColor("temprature", data);
      if (this.childMode && data.templature > 4500) {
        this.chilModeModal = true;
        return;
      }
      if (data && data.isTouchEnd) {
        this.handleTemprature(data);
      }
      // 如果是编辑状态
      if (this.tempraturePanelData.isEdit) {
        this.changeTempratureColors({ idx: this.tempraturePanelData.selectedIdx, color: data.color });
      } else {
        this.tempraturePanelData.selectedIdx = -1;
      }
    },
    // 刻度变化
    onSlide(value, isTouchEnd) {
      let _value = value > 99 ? 99 : value < 0 ? 0 : value;
      this.mqttData.degree = value + 1;
      isTouchEnd && this.handleDegreeChange(value + 1);
    },
    setTempratureTimer(isClear) {
      if (isClear && this.tempraturePanelData.timer) {
        clearTimeout(this.tempraturePanelData.timer);
        return;
      }
      let that = this;
      this.tempraturePanelData.timer && clearTimeout(this.tempraturePanelData.timer);
      this.tempraturePanelData.timer = setTimeout(() => {
        if (typeof that.tempraturePanelData.lastMqttTemprature === "number" && that.onFingerTouchTarget !== "temprature" && !that.tempraturePanelData.isEdit) {
          that.mqttData.curTemprature = that.tempraturePanelData.lastMqttTemprature;
          that.$refs.tempratureSelect._setIndicatorByTemprature(that.tempraturePanelData.lastMqttTemprature);
        }
        this.tempraturePanelData.waitMqttList = [];
      }, this.waitMQTTtimeout);
    },
    setColorTimer(isClear) {
      if (isClear && this.colorPanelData.timer) {
        clearTimeout(this.colorPanelData.timer);
        return;
      }
      let that = this;
      this.colorPanelData.timer && clearTimeout(this.colorPanelData.timer);
      this.colorPanelData.timer = setTimeout(() => {
        if (typeof that.colorPanelData.lastMqttColor.s === "number" && typeof that.colorPanelData.lastMqttColor.h === "number" && that.onFingerTouchTarget !== "color" && !that.colorPanelData.isEdit) {
          that.mqttData.lightHues = that.colorPanelData.lastMqttColor.h;
          that.mqttData.lightSaturation = that.colorPanelData.lastMqttColor.s;
          that.$refs.colorPicker._getPositionByHue(that.colorPanelData.lastMqttColor.h, that.colorPanelData.lastMqttColor.s);
        }
        this.colorPanelData.waitMqttList = [];
      }, this.waitMQTTtimeout);
    },
    checkUpgrade(data) {
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
    },
    // 状态渲染
    handleRender(data) {
      const mResult = formatMQTTData(data);

      console.log(mResult, " formatMQTTData(mResult)");
      if (typeof mResult.lightMode === "string") {
        if (this.lightDeviceType !== 1) {
          if (this.lightDeviceType === 2) {
            mResult.lightMode = "color";
          } else {
            mResult.lightMode = "temprature";
            this.setLightShadowColor("temprature", { templature: mResult.temprature || 2700 });
          }
        }
        this.mqttData.lightMode = mResult.lightMode;
      }
      if (typeof mResult.onLineValue === "number") {
        this.mqttData.onLineValue = mResult.onLineValue;
        this.setGlobalDeviceStatus(mResult.onLineValue);
      }
      if (typeof mResult.temprature === "number" && this.onFingerTouchTarget !== "temprature") {
        let min = this.deviceDetail.zigbeeTypeEnum === "RGBCW_BW" || this.deviceDetail.zigbeeTypeEnum === "CW_BW" ? 2000 : 2700;
        mResult.temprature = mResult.temprature > 6500 ? 6500 : mResult.temprature < min ? min : mResult.temprature;
        this.tempraturePanelData.lastMqttTemprature = mResult.temprature;
        this.tempraturePanelData.timer && clearTimeout(this.tempraturePanelData.timer);
        if (this.tempraturePanelData.isEdit) return;
        let list = this.tempraturePanelData.waitMqttList;
        if (list.length) {
          if (list[0] === mResult.temprature && mResult.temprature !== list[list.length - 1]) {
            this.tempraturePanelData.waitMqttList.splice(0, 1);
          } else if (mResult.temprature === list[list.length - 1]) {
            this.tempraturePanelData.waitMqttList = [];
            this.setTempratureTimer(true);
          } else {
            this.tempraturePanelData.waitMqttList = [];
            this.mqttData.curTemprature = mResult.temprature;
            this.$refs.tempratureSelect._setIndicatorByTemprature(mResult.temprature);
            this.setLightShadowColor("temprature", { templature: mResult.temprature });
          }
        } else {
          this.mqttData.curTemprature = mResult.temprature;
          this.$refs.tempratureSelect._setIndicatorByTemprature(mResult.temprature);
          this.setLightShadowColor("temprature", { templature: mResult.temprature });
        }
      }
      if (typeof mResult.degree === "number") {
        if (this.onFingerTouchTarget !== "degree") {
          this.mqttData.degree = mResult.degree;
          this.$refs.degreeSlideComp._initDegree(mResult.degree);
          this.$refs.degreeSlideComp.setLinesOffset();
        }
      }
      if (typeof mResult.isLightOn === "boolean") {
        this.mqttData.isLightOn = mResult.isLightOn;
        if (!this.mqttData.isLightOn) {
          this.showPanel(false, this.tempraturePanelData, "temprature");
          this.showPanel(false, this.colorPanelData, "color");
        }
        this.setLightStatus(mResult.isLightOn);
      }
      if (typeof mResult.isChildMode === "boolean") {
        this.setChildMode(mResult.isChildMode);
        if (mResult.isChildMode && this.mqttData.curTemprature > 4500) {
          this.$nextTick(() => {
            this.$refs.tempratureSelect._setIndicatorByTemprature(4500);
          });
        }
      }
      if (typeof mResult.lightOnStep === "number") {
        this.mqttData.lightOnStep = mResult.lightOnStep;
        this.setLightOnOffStep({ key: "lightOnStep", value: mResult.lightOnStep });
      }
      if (typeof mResult.lightOffStep === "number") {
        this.mqttData.lightOffStep = mResult.lightOffStep;
        this.setLightOnOffStep({ key: "lightOffStep", value: mResult.lightOffStep });
      }

      if (typeof mResult.lightHues === "number" && typeof mResult.lightSaturation === "number" && this.onFingerTouchTarget !== "color") {
        this.colorPanelData.lastMqttColor.h = mResult.lightHues;
        this.colorPanelData.lastMqttColor.s = mResult.lightSaturation;
        this.colorPanelData.timer && clearTimeout(this.colorPanelData.timer);
        if (this.colorPanelData.isEdit) return;
        let list = this.colorPanelData.waitMqttList;
        if (list.length) {
          if (list[0].h === mResult.lightHues && list[0].s === mResult.lightSaturation && list[list.length - 1].h !== mResult.lightHues && list[list.length - 1].s !== mResult.lightSaturation) {
            this.colorPanelData.waitMqttList.splice(0, 1);
          } else if (list[list.length - 1].h === mResult.lightHues && list[list.length - 1].s === mResult.lightSaturation) {
            this.colorPanelData.waitMqttList = [];
            this.setColorTimer(true);
          } else {
            this.colorPanelData.waitMqttList = [];
            this.mqttData.lightHues = mResult.lightHues;
            this.mqttData.lightSaturation = mResult.lightSaturation;
            let rgba = "";
            if (this.$refs.colorPicker) {
              rgba = this.$refs.colorPicker._getPositionByHue(mResult.lightHues, mResult.lightSaturation);
            }

            mResult.lightMode === "color" && this.setLightShadowColor("color", { color: rgba });
          }
        } else {
          this.mqttData.lightHues = mResult.lightHues;
          this.mqttData.lightSaturation = mResult.lightSaturation;
          let rgba = "";
          if (this.$refs.colorPicker) {
            rgba = this.$refs.colorPicker._getPositionByHue(mResult.lightHues, mResult.lightSaturation);
          }
          // let rgba = this.$refs.colorPicker._getPositionByHue(mResult.lightHues, mResult.lightSaturation);
          mResult.lightMode === "color" && this.setLightShadowColor("color", { color: rgba });
        }
      }
      if (typeof mResult.lightOnStatus === "number") {
        this.setLightOnStatus(mResult.lightOnStatus);
      }
      if (typeof mResult.electrifyStatus === "number") {
        this.setElectriDefaultLightStatus(mResult.electrifyStatus);
      }
      if (typeof mResult.isOnLine === "boolean") {
    
        this.mqttData.isOnLine = mResult.isOnLine;
        if (!mResult.isOnLine) {
          this.mqttData.isLightOn = false;
          this.setLightStatus(false);
          this.showPanel(false, this.tempraturePanelData, "temprature");
          this.showPanel(false, this.colorPanelData, "color");
        }
      }
    
    },
    async getModeList(type) {
      // type: RGBCW3全彩， RGB3：颜色， CW3：色温 注意榜威灯传参不一样
      let showStationEnum = type === "RGBCW3" ? "rgbcw2Mode" : type === "RGB3" ? "rgb2Mode" : type === "CW3" ? "colorMode" : type === "RGBCW_BW" ? "rgbcwBWMode" : type === "CW_BW" ? "colorMode" : "";
      let { data, error } = await modeListRep({ showStationEnum: showStationEnum });
      if (data && !error) {
        data.data.map((v) => {
          v.isLoading = false; // 添加loading属性，用于点击时的动画
        });
        this.modeLists = data.data || [];
      }
    },
    async handleChangeLightMode(item) {
      await lightModeChangeRep({ endpointId: this.globalDataId, modeCode: item.modeCode });
    },
    async handleChangeColor(options) {
      let params = {
        cmdKey: "colorValue_set_hs",
        cmdValue1: (((options.hue * 254) / 360) | 0) + " " + options.saturation,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.colorPanelData.waitMqttList.push({ h: options.hue, s: options.saturation });
      }
      this.setColorTimer();
    },
    async handleTemprature(obj) {
      let params = {
        cmdKey: "colorTemp_set_k",
        cmdValue1: obj.templature,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.tempraturePanelData.waitMqttList.push(obj.templature);
        this.mqttData.curTemprature = obj.templature;
        this.setLightShadowColor("temprature", obj);
      }
      this.setTempratureTimer();
    },
    async handleToggle(params) {
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.mqttData.isLightOn = !this.mqttData.isLightOn;
        this.setLightStatus(this.mqttData.isLightOn);
      }
    },
    async handleDegreeChange(value) {
      let params = {
        cmdKey: "brightness_set_percent",
        cmdValue1: value,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.mqttData.degree = value;
      } else {
      }
    },
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      if (data && !error) {
        let type = deviceZigbeeType[data.data.zigbeeTypeEnum];
        // 1：全彩  2：颜色  3：色温 4：单色
        this.lightDeviceType =
          type === "ZIGBEE_TYPE_HOME_ALL_LIGHT_HSV"
            ? 1
            : type === "ZIGBEE_TYPE_HOME_COLOR_LIGHT_HSV"
            ? 2
            : type === "ZIGBEE_TYPE_HOME_TEMPERATURE_LIGHT_HSV"
            ? 3
            : type === "ZIGBEE_TYPE_HOME_BRIGHTNESS_LIGHT_HSV"
            ? 4
            : "";
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        this.getModeList(data.data.zigbeeTypeEnum);
        this.checkUpgrade(data.data);
        if (data.data.zigbeeTypeEnum === "RGBCW_BW" || data.data.zigbeeTypeEnum === "CW_BW") {
          this.lightCateType = 1; // 榜威灯
          this.templatureColor = templatureColor_BW;
        }
        this.$nextTick(() => {
          this.handleRender(data.data);
          if (data.data.deviceStateEnum !== "online") {
            this._showOfflineModal();
          }
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
    },
  },

  watch: {
    globalMattData(newV, oldV) {
      for (let i = 0; i < newV.length; i++) {
        this.handleRender(newV[i]);
      }
    },
  },
  computed: {
    ...mapGetters([
      "deviceDataModify",
      "defaultTempratureColors",
      "globalDeviceType",
      "globalData",
      "hsvColorPickerColors",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "childMode",
      "getDeviceDelFromCurHomeList",
    ]),
  },
  created() {
    this.getDeviceData();
  },
  directives: {
    CDUnTouch,
  },
  components: {
    DegreeSlide,
    TempratureSelect,
    ColorPickerHsv,
    LoadingIcon,
    TitleBarHSV,
    Modal,
  },
};
</script>
<style lang="less">
#lightHsv {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  color: rgba(0, 0, 0, 0.6);
  background: #fbfbfc;
  transition: all 0.2s ease-in-out;
  &.active {
    color: #000;
  }
  .light-wrap {
    font-size: 0;
    position: relative;
    .light {
      position: relative;
      width: 324px;
      height: 310px;
      margin-top: 110px;
      margin-left: 80px;
      z-index: 5;
    }
    .light-bot {
      position: absolute;
      top: 388px;
      left: 81px;
      height: 29px;
      z-index: 1;
    }
    .light-box-wrap {
      position: absolute;
      top: 390px;
      left: 40px;
      width: 400px;
      height: 500px;
      overflow: hidden;
      border-radius: 18%;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      z-index: 2;
      display: flex;
      justify-content: center;
      background-color: transparent;
      padding-top: 10px;
    }
    .light-box {
      width: 4px;
      height: 4px;
      border-radius: 50%;
    }
  }
  .degree-wrap {
    position: absolute;
    right: 0;
    top: 168px;
    width: 200px;
    overflow: hidden;
  }
  .degrees {
    margin-left: 90px;
    margin-top: 165px;
    display: flex;
    flex-direction: column;
    &.fixedBot {
      position: fixed;
      bottom: 80px;
      left: 0;
    }
    .degree-num {
      font-size: 160px;
      font-weight: bold;
    }
    .degree-text {
      font-size: 32px;
      font-weight: bold;
      color: #767676;
    }
  }
  .panel {
    position: absolute;
    bottom: 80px;
    left: 70px;
    right: 60px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .left {
      display: flex;
      align-items: center;
      flex: 1;
      .item {
        display: flex;
        align-items: center;
        flex-direction: column;
        &.center {
          margin: 0 40px;
        }
        .icon {
          display: inline-block;
          font-family: "iconfont" !important;
          width: 100px;
          height: 100px;
          background: #ffffff;
          box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.04);
          border-radius: 40px;
          font-size: 50px;
          text-align: center;
          line-height: 100px;
        }
        .name {
          margin-top: 18px;
          font-size: 24px;
        }
      }
    }
    .right {
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
      &.switch {
        border-radius: 50%;
        font-family: "iconfont" !important;
        background: #ffffff;
        box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.05);
        line-height: 140px;
        text-align: center;
        font-size: 50px;
        &.active {
          box-shadow: 0px 0px 30px 0px rgba(216, 2, 0, 0.16);
          color: #d80200;
        }
      }
    }
  }
  .color-panel,
  .mode-panel,
  .temprature-panel {
    position: absolute;
    bottom: -840px;
    right: 0;
    left: 0;
    height: 760px;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    display: flex;
    flex-direction: column;
    z-index: 9;
    transition: bottom 0.2s linear;
    &.active {
      bottom: 0;
    }
    .icon {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translate(-50%);
      width: 60px;
      height: 8px;
      flex: 0 0 8px;
      background: #d8d8d8;
      border-radius: 6px;
      align-self: center;
      z-index: 2;
    }
    .content {
      position: relative;
      width: 100%;
      height: 100%;
      background: #fff;
      z-index: 2;
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
      transition: top 0.15s ease-in-out;
      box-shadow: 0px -4px 40px 0px rgba(0, 0, 0, 0.06);
    }
  }
  .color-panel,
  .temprature-panel {
    .mask {
      position: fixed;
      top: 0;
      right: 200px;
      left: 0;
      bottom: 0vh;
      background-color: transparent;
      z-index: 1;
      &::after {
        position: absolute;
        top: 0;
        right: -200px;
        height: 120px;
        left: 0;
        content: " ";
      }
    }
    .btns {
      width: 100%;
      padding: 0 40px;
      box-sizing: border-box;
      font-size: 30px;
      height: 40px;
      line-height: 40px;
      color: #4289ff;
      z-index: 2;
      margin-top: 32px;
      > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .list {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 32px 36px 24px;
      .item {
        width: 80px;
        height: 80px;
        flex: 0 0 80px;
        border-radius: 50%;
        text-align: center;
        line-height: 80px;
        color: #fff;
        font-size: 40px;
        &.active {
          position: relative;
          &::after {
            position: absolute;
            left: 2px;
            right: 2px;
            top: 2px;
            bottom: 2px;
            content: " ";
            border-radius: 50%;
            border: 3px solid #fff;
          }
        }
      }
    }
  }
  .mode-panel {
    .mask {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.2);
    }
    .mode-list {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      padding: 0 40px;
      margin-top: 30px;
      box-sizing: border-box;
      overflow-y: auto;
      align-content: flex-start;
      -webkit-overflow-scrolling: touch;
    }
    .mode-item {
      position: relative;
      width: 324px;
      height: 176px;
      background: #f0f0f0;
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      .roll-wrap {
        width: 100px;
        height: 100px;
        > div {
          position: relative;
          z-index: 2;
        }
        &::after {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          content: " ";
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }
      }
      .mode-name {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        font-size: 36px;
        color: #fff;
      }
    }
  }
  .color-picker-area {
    width: 100%;
    height: 100%;
  }
}
</style>
