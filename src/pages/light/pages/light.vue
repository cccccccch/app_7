<template>
  <div id="light" :class="{ active: isLightOn }">
    <TitleBarlight :title="deviceDetail.deviceName" @goBack="goback" :showRight="!!deviceDetail.dataId" optionType="light" />
    <div class="light-wrap">
      <img src="../../../assets/images/light.png" class="light" alt="" />
      <img src="../../../assets/images/light_bot.png" class="light-bot" alt="" />
      <div class="light-box-wrap">
        <div class="light-box" :style="{ 'box-shadow': isLightOn ? `0px 0px 46px 40px rgb(${lightColor[0] | 0},${lightColor[1] | 0},${lightColor[2] | 0})` : '', opacity: lightOpacity }"></div>
      </div>
    </div>
    <div class="degrees" :class="{ fixedBot: operateAreaType.type === 4 }">
      <span class="degree-num">{{ degree }}</span>
      <span class="degree-text">灯光亮度，%</span>
    </div>
    <!-- 刻度模块 -->
    <div class="degree-wrap" ref="degreeWrap" @touchstart="onTouchDegree">
      <degree-slide @onSlide="onSlide" :curDegree="degree" @onFingerTouch="onFingerTouch($event, 'degree')" :isLightOn="isLightOn" :miniDegree="miniDegree" ref="degreeSlideComp" />
    </div>
    <!-- 底部按钮模块 -->
    <div class="panel">
      <div class="left" v-if="operateAreaType.type !== 4 && operateAreaType.type !== ''">
        <div class="item">
          <span class="icon icon-mode" @click="showModal('mode')"></span>
          <span class="name">模式</span>
        </div>
        <div class="item center" v-if="operateAreaType.type === 1 || operateAreaType.type === 3">
          <span class="icon icon-temprature" @click="showModal('temp')"></span>
          <span class="name">色温</span>
        </div>
        <div class="item" v-if="operateAreaType.type === 1 || operateAreaType.type === 2">
          <span class="icon icon-colorpanel" @click="showModal('color')"></span>
          <span class="name">颜色 </span>
        </div>
      </div>
      <div v-else></div>
      <div class="right switch icon-switch" :class="{ active: isLightOn && isOnLine }" @click="onSwithChange"></div>
    </div>
    <!-- 色温模块 -->
    <div
      class="temprature-panel"
      ref="templaturePanel"
      v-if="operateAreaType.type === 1 || operateAreaType.type === 3"
      :style="{ bottom: panelTouch.templature.curTop > 0 ? -panelTouch.templature.curTop + 'px' : '', transition: panelTouch.templature.removeTransition ? 'none' : '' }"
      @touchstart="panelTouchStart($event, 'templature')"
      @touchmove="panelTouchMove($event, 'templature')"
      @touchend="panelTouchEnd($event, 'templature')"
      v-CDUnTouch
      :class="{ active: isShowTempratureModal }"
    >
      <div class="mask" @touchstart.stop="hideModal($event, 'templature')" v-show="isShowTempratureModal"></div>
      <div class="icon" @touchstart.stop="hideModal($event, 'templature')"></div>
      <div class="btns">
        <div v-show="editTempData.editing">
          <span style="color: #979797" @click="onSavePanel('temp', false)">取消</span>
          <span @click="onSavePanel('temp', true)">保存</span>
        </div>
      </div>
      <div class="content">
        <div class="list">
          <div
            class="item iconfont"
            :class="{
              'icon-edit': item === selectTemColor && !editTempData.editing && idx === selectTemColorListIdx,
              active: (item === selectTemColor && idx === selectTemColorListIdx) || (editTempData.editing && editTempData.idx === idx),
            }"
            v-for="(item, idx) of defaultTempratureColors"
            :key="idx"
            :style="{ background: item }"
            @touchstart.stop="stopEvent"
            @touchmove.stop="stopEvent"
            @touchend.stop="onSelectTemColor($event, item, idx)"
          ></div>
        </div>
        <div class="temprature-circle-wrap">
          <temprature-select
            @touchstart.stop="stopEvent"
            ref="tempratureSelect"
            @onFingerTouch="onFingerTouch($event, 'temprature')"
            @onTempratureChange="onTempratureChange"
            :curTemprature="curTemprature"
          />
        </div>
      </div>
    </div>
    <!-- 模式模块 -->
    <div
      class="mode-panel"
      ref="modePanel"
      :style="{ top: panelTouch.mode.curTop > 0 ? panelTouch.mode.curTop + 'px' : '', transition: panelTouch.mode.removeTransition ? 'none' : '' }"
      :class="{ active: isShowModeModal }"
    >
      <div class="mask" @touchstart.stop="hideModal($event, 'mode')" v-show="isShowModeModal"></div>
      <div class="content">
        <div class="icon" @touchstart.stop="hideModal($event, 'mode')"></div>
        <div class="mode-list">
          <div class="mode-item" v-for="(item, idx) of modeLists" :key="idx" @click.stop="onSelectMode(item)" :style="{ 'background-image': `url(${item.iconUrlAbs})` }">
            <div class="roll-wrap" v-if="item.isLoading"><loading-icon v-model="item.isLoading" :strokeWidth="2" /></div>
            <span class="mode-name">{{ item.modeName }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 色盘模块 -->
    <div
      v-if="operateAreaType.type === 1 || operateAreaType.type === 2"
      class="color-panel"
      ref="colorPanel"
      :style="{ bottom: panelTouch.color.curTop > 0 ? -panelTouch.color.curTop + 'px' : '', transition: panelTouch.color.removeTransition ? 'none' : '' }"
      @touchstart="panelTouchStart($event, 'color')"
      @touchmove="panelTouchMove($event, 'color')"
      @touchend="panelTouchEnd($event, 'color')"
      :class="{ active: isShowColorModal }"
      v-CDUnTouch
    >
      <div class="mask" @touchstart.stop="hideModal($event, 'color')" v-show="isShowColorModal"></div>
      <div class="icon" @touchstart.stop="hideModal($event, 'color')"></div>
      <div class="content">
        <div class="btns">
          <div v-show="editColorData.editing">
            <span style="color: #979797" @click="onSavePanel('color', false)">取消</span>
            <span @click="onSavePanel('color', true)">保存</span>
          </div>
        </div>
        <div class="list">
          <div
            class="item iconfont"
            @touchstart.stop="stopEvent"
            @touchmove.stop="stopEvent"
            @touchend.stop="onSelectPickerColor(item, idx)"
            :class="{
              'icon-edit': item.c === selectColor && selectColorListIdx === idx && !editColorData.editing,
              active: (item.c === selectColor && selectColorListIdx === idx) || (editColorData.idx === idx && editColorData.editing),
            }"
            v-for="(item, idx) of defaultColorPickerColors"
            :key="idx"
            :style="{ background: item.c }"
          ></div>
        </div>
        <div class="color-picker-wrap">
          <color-picker @touchstart.stop="stopEvent" @onColorChange="onColorChange" @onFingerTouch="onFingerTouch($event, 'color')" ref="colorPicker" :xyColor="xyColor" />
        </div>
      </div>
    </div>
    <Modal v-model="netStatusModal" title="温馨提示" type="one" :content="modalContent" />
    <Modal v-model="deviceDisableModal" title="温馨提示" type="one" :content="deviceDisableContent" />
    <Modal v-model="chilModeModal" title="温馨提示" content="您已开启【儿童模式】，色温不可高于4500K" cancelText="我知道了" okText="前往设置" @on-ok="onChilModeOk" @on-cancel="onChilModeCancel" />
    <Modal v-model="upgradeModal" title="升级提醒" :content="upgradeContent" cancelText="暂不升级" okText="立即升级" @on-ok="onUpgradeOk" @on-cancel="onUpgradeCancel" :dismiss="false" />
  </div>
</template>

<script>
import DegreeSlide from "../../../components/DegreeSlide";
import TempratureSelect from "../../../components/TempratureSelect";
import ColorPicker from "../../../components/ColorPicker";
import { CDUnTouch } from "../../../directive/index";
import { templatureColor, hex2rgb, rgb2hex } from "../../../utils/index";
import LoadingIcon from "../../../components/rollLoading";
import { deviceDetailRep, modeListRep, lightModeChangeRep, endpointControlRep } from "../../../api/request";
import { mapGetters, mapMutations } from "vuex";
import { deviceZigbeeType } from "../../../utils/index";
import TitleBarlight from "../../../components/titleBar";
import Modal from "../../../components/modals/modal/Modal";
import { execNativeFunc } from "../../../utils/bridge";
import pageMixins from "../mixins/index";
import { formatMQTTData } from "../../../utils/socketUtil";

export default {
  name: "Light",
  mixins: [pageMixins],
  data() {
    return {
      netStatusModal: false,
      modalContent: "",
      deviceZigbeeType: deviceZigbeeType,
      deviceType: "",
      windowHeight: 1,
      lightMode: "1", // 颜色模式， 1:使用色盘颜色，2：使用色温颜色
      isOnLine: true, // 设备在线/离线
      isLightOn: true, // 设备开启/关闭
      degree: 0, // 当前刻度
      miniDegree: false, // 是否需要缩小刻度条
      templatureColorArr: templatureColor, // 当前色温对应颜色,用于图片的灯光展示
      templatureColor2: [], // 当前色温对应颜色,用于图片的灯光展示
      isShowTempratureModal: false,
      isShowModeModal: false,
      isShowColorModal: false,
      selectTemColor: "",
      selectTemColorListIdx: "",
      selectColor: "", // 用于灯的颜色，默认颜色列表的颜色
      selectColorListIdx: "",
      curTemprature: 6500, // 当前色温值
      selectMode: 0, // 当前点击的模式
      curColor: "", // 用于灯的颜色，是一个rgb数组
      xyColor: "", // 当前设备XY颜色值
      isFristClickTemprature: true, // 是否是第一次点击色温弹窗，第一次需要设置位置
      modeLists: [], // 模式列表
      isSettingMode: false, // 是否正在设置模式
      editTempData: {
        editing: false, // 是否是处于编辑色温
        color: "",
        idx: 0,
      },
      editColorData: {
        editing: false,
        xy: "",
        color: "",
        idx: 0,
      },
      fingerTouchObject: {
        //用于确认某个组件正在被操作
        target: "", // temprature： 色温模块， color: 颜色模块, degree：亮度模块
      },
      touchTimers: {
        // 定时器， 手指操作松开时，在指定时间内如果mqtt返回的数据与手指操作产生的数据一致，则不更新对应指示器的位置
        templatureTimer: {
          timer: null,
          data: {},
        },
        colorTimer: {
          timer: null,
          data: {},
        },
        degreeTimer: {
          timer: null,
          data: {},
        },
      },
      panelTouch: {
        templature: {
          startY: 0,
          maxTop: 0,
          curTop: 0,
          removeTransition: false,
        },
        color: {
          startY: 0,
          maxTop: 0,
          curTop: 0,
          removeTransition: false,
        },
        mode: {
          startY: 0,
          maxTop: 0,
          curTop: 0,
          removeTransition: false,
        },
      },
      operateAreaType: {
        type: "", // 1：全彩  2：颜色  3：色温 4：单色
      },
      netStatus: {
        0: "offline",
        1: "online",
        4: "offNetwork",
        5: "online",
        7: "binding",
        binding: "配置中",
        online: "在线",
        offline: "离线",
        offNetwork: "离网",
      },
      chilModeModal: false,
      deviceDisableContent: "设备未开启，暂不支持该操作",
      deviceDisableModal: false,
      upgradeContent: "发现新版本",
      upgradeModal: false,
      lightOperateTimer: null, // 避免灯组频繁操作开关按钮
      waitMqttDegreeList: [], // 记录下发成功的刻度，避免跳动
      isDimmingLamp: false, // 是否是单色灯，单色灯没有颜色模式和色温模式，只有亮度
    };
  },
  methods: {
    ...mapMutations([
      "setLightStatus",
      "setCurTemprature",
      "setGlobalDeviceStatus",
      "changeTempratureColors",
      "setDataToNative",
      "changeColorPickerColors",
      "setGlobalMac",
      "setDeviceDetail",
      "setChildMode",
      "setLightOnStatus",
      "setElectriDefaultLightStatus",
      "setLightOnOffStep",
      "setBrightnessCurveValue",
      "setBrightnessWayValue",
    ]),
    goback() {
      if (this.deviceDataModify) {
        execNativeFunc("deviceHadModify", 1);
      }
      execNativeFunc("onNavigateTo", { type: 0 });
    },
    // 离线状态下触摸刻度尺
    onTouchDegree() {
      if (!this.isOnLine) {
        this._showOfflineModal();
        return;
      }
      if (!this.isLightOn) {
        this.deviceDisableContent = "设备未开启，暂不支持该操作";
        this.deviceDisableModal = true;
        return;
      }
    },
    //儿童模式确认
    onChilModeOk() {
      this.onChilModeCancel();
      this.isShowTempratureModal = false;
      this.$router.push({ name: "childMode", query: { slideWay: "left" } });
      this.handleTemprature({ templature: 4500 });
    },
    //儿童模式取消
    onChilModeCancel() {
      this.curTemprature = 4500;
      if (this.editTempData.editing) {
        let color = this.defaultTempratureColors[this.selectTemColorListIdx];
        let idx = "";
        for (let i = 0, len = templatureColor.length; i < len; i++) {
          if (templatureColor[i] === color) {
            idx = i;
            break;
          }
        }
        this.curTemprature = 6500 - idx * 100;
      } else {
        this._resetColorAndTempEdit();
      }
      this.$nextTick(() => {
        this.$refs.tempratureSelect._setIndicatorByTemprature(this.curTemprature);
      });
      this.handleTemprature({ templature: this.curTemprature });
    },
    panelTouchStart(evt, type) {
      if (!type || !this.panelTouch[type]) return;
      this.panelTouch[type].startY = evt.changedTouches[0].clientY;
      this.panelTouch[type].maxTop = this.$refs[type + "Panel"].getBoundingClientRect().height;
    },
    panelTouchMove(evt, type) {
      if (!type || !this.panelTouch[type] || this.panelTouch[type].maxTop <= 0) return;
      let moveY = evt.changedTouches[0].clientY - this.panelTouch[type].startY;
      moveY = moveY > 0 ? moveY : 0;
      if (moveY > 0) {
        this.panelTouch[type].removeTransition = true;
      }
      this.panelTouch[type].curTop = moveY;
    },
    panelTouchEnd(evt, type) {
      if (!type || !this.panelTouch[type]) return;
      if (this.panelTouch[type].curTop > 80) {
        this.isShowTempratureModal = false;
        this.isShowModeModal = false;
        this.isShowColorModal = false;
        this.hideModal(evt, type);
      } else {
        this.panelTouch[type].curTop = 0;
      }
    },
    hideModal(event, type) {
      this.panelTouch[type].curTop = 0;
      this.panelTouch[type].maxTop = 0;
      this.panelTouch[type].startY = 0;
      this.panelTouch[type].removeTransition = false;
      if (type === "templature") {
        this.miniDegree = false;
        this.isShowTempratureModal = false;
        this._miniDegree();
        this.editTempData.editing && this.onSavePanel("temp", false);
      } else if (type === "mode") {
        this.isShowModeModal = false;
      } else if (type === "color") {
        this.miniDegree = false;
        this.isShowColorModal = false;
        this._miniDegree();
        this.editColorData.editing && this.onSavePanel("color", false);
      }
    },
    stopEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    // 手指是否正在触摸某个组件
    onFingerTouch(flag, type) {
      this.fingerTouchObject.target = flag ? type : "";
    },
    // 模式选择
    onSelectMode(item) {
      if (item.isLoading) return;
      if (this.childMode && item.colorTemp > 4500) {
        this.chilModeModal = true;
        return;
      }
      this.selectMode = item.id;
      item.isLoading = true;
      this._resetColorAndTempEdit();
      this.handleChangeLightMode(item);
    },
    // 色温默认列表选择
    onSelectTemColor(event, color, idx) {
      event.stopPropagation();

      this.lightMode = "2";
      if (this.editTempData.editing) return;
      let isOverChildMode = false;
      if (this.selectTemColorListIdx !== idx) {
        for (let i = 0, len = this.templatureColorArr.length; i < len; i++) {
          if (this.templatureColorArr[i] === color) {
            let templature = 6500 - i * 100;
            if (this.childMode && templature > 4500) {
              isOverChildMode = true;
              this.chilModeModal = true;
              break;
            }
            this.handleTemprature({ color: color, templature: templature, isTouchEnd: true });
            break;
          }
        }
        if (!isOverChildMode) {
          this.selectTemColor = color;
          this.selectTemColorListIdx = idx;
          this.$refs.tempratureSelect._setIndicatorByColor(color);
        }
      } else {
        // 编辑
        this.editTempData.editing = true;
        this.editTempData.color = color;
        this.editTempData.idx = idx;
      }
    },
    // 颜色色盘默认列表选择
    onSelectPickerColor(item, idx) {
      if (this.editColorData.editing) return;
      let rgb = hex2rgb(item.c);
      if (this.selectColorListIdx !== idx) {
        this.selectColor = item.c;
        this.selectColorListIdx = idx;
        this.$refs.colorPicker._initIndicatorPosition(item.xy, true);
      } else {
        this.editColorData.xy = item.xy;
        this.editColorData.idx = idx;
        this.editColorData.color = item.c;
        this.editColorData.editing = true;
      }
      this.onColorChange({ color: rgb, curXY: item.xy, isTouchEnd: true });
    },
    // 非在线状态弹窗
    _showOfflineModal() {
      // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
      // offline, online, offNetwork, binding
      let txt = "暂时无法操作";
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
    // 色温、色盘弹框
    showModal(type) {
      if (!this.isOnLine) {
        // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
        // offline, online, offNetwork, binding
        this._showOfflineModal();
        return;
      }
      if (!this.isLightOn) {
        this.deviceDisableContent = "设备未开启，暂不支持该操作";
        this.deviceDisableModal = true;
        return;
      }
      this.miniDegree = true;
      if (type === "temp") {
        this.isShowTempratureModal = true;
        this._miniDegree();
        return;
      }
      if (type === "color") {
        this._miniDegree();
        this.isShowColorModal = true;
        return;
      }
      if (type === "mode") {
        this.isShowModeModal = true;
        return;
      }
    },
    // 色温、色盘编辑状态保存/取消
    onSavePanel(type, isSave) {
      if (type === "temp") {
        if (!isSave) {
          this.$refs.tempratureSelect._setIndicatorByColor(this.editTempData.color);
          let index = this.editTempData.idx;
          for (let i = 0, len = this.templatureColorArr.length; i < len; i++) {
            if (this.templatureColorArr[i] === this.editTempData.color) {
              index = i;
              break;
            }
          }
          this.handleTemprature({ templature: 6500 - index * 100, color: templatureColor[index] });
          this.changeTempratureColors({ idx: this.editTempData.idx, color: templatureColor[index] });
        } else {
          this.setDataToNative({ key: "tempratureColors", data: this.defaultTempratureColors });
        }
        this.$nextTick(() => {
          this.editTempData.editing = false;
          this.editTempData.color = "";
          this.editTempData.idx = 0;
          this.selectTemColorListIdx = "";
        });
        this.lightMode = "2";
      } else if (type === "color") {
        this.lightMode = "1";
        this.editColorData.editing = false; //这里需要提前置为false，避免下面调用_initIndicatorPosition方法时，该组件emit一个onSwithChange事件造成默认颜色列表数据出错
        if (!isSave) {
          let xy = this.editColorData.xy;
          let params = { idx: this.editColorData.idx, color: this.editColorData.color, xy: this.editColorData.xy };
          this.handleChangeColor({ curXY: this.editColorData.xy }); // 如果点击了取消，重置回之前的颜色
          this.changeColorPickerColors(params);
          this.selectColor = this.editColorData.xy === this.xyColor ? this.editColorData.color : "";
          this.$refs.colorPicker && this.$refs.colorPicker._initIndicatorPosition(xy);
        } else {
          this.setDataToNative({ key: "pickerColors", data: this.defaultColorPickerColors });
          this.selectColor = this.editColorData.color;
        }
        this.$nextTick(() => {
          this.editColorData.xy = "";
          this.editColorData.color = "";
          this.editColorData.idx = 0;
          this.selectColorListIdx = "";
        });
      }
    },
    _resetColorAndTempEdit() {
      this.selectTemColor = "";
      this.selectTemColorListIdx = "";
      this.selectColor = ""; // 用于灯的颜色，默认颜色列表的颜色
      this.selectColorListIdx = "";
      this.editTempData = {
        editing: false, // 是否是处于编辑色温
        color: "",
        idx: 0,
      };
      this.editColorData = {
        editing: false,
        xy: "",
        color: "",
        idx: 0,
      };
    },
    // 开关切换
    onSwithChange(data) {
      if (!this.isOnLine) {
        this._showOfflineModal();
        return;
      }
      if (this.lightOperateTimer) return;
      this.lightOperateTimer = setTimeout(() => {
        this.lightOperateTimer = null;
        this.lightOperateTimer && clearTimeout(this.lightOperateTimer);
      }, 300);
      // 灯组key: open/close, 单个灯: toggle.   value值随意， on/off皆可
      // 通过ifLogicGroupEnum判断是否是分组
      let type = this.deviceDetail.ifLogicGroupEnum === "yes" ? "group" : "sigle";
      let params = {
        endpointId: this.globalDataId,
        cmdKey: "toggle",
      };
      if (type === "group") {
        let value = this.isLightOn ? "close" : "open";
        params.cmdKey = value;
      }
      this.handleToggle(params);
    },
    // 刻度变化
    onSlide(value, isTouchEnd) {
      let _value = value > 99 ? 99 : value < 0 ? 0 : value;
      this.degree = value + 1;
      isTouchEnd && this.handleDegreeChange(value + 1);
    },
    // 色温变化
    onTempratureChange(data) {

      this.lightMode = "2";
      if (this.childMode && data.templature > 4500) {

        this.chilModeModal = true;
        return;
      }
      if (data && data.templature) {

        if (data.isTouchEnd) {
          this.handleTemprature(data);

        } else {
   

          this.templatureColor2 = hex2rgb(data.color);
  
          this.curTemprature = data.templature;
        }
      }
      // 如果是编辑状态
      if (this.editTempData.editing) {
        this.changeTempratureColors({ idx: this.editTempData.idx, color: data.color });
      } else {
        if (this.selectTemColor.toLowerCase() !== data.color) {
          this._resetColorAndTempEdit();
        }
      }
      this.selectTemColor = "";
    },
    // 颜色变化
    onColorChange(data) {
  
      if (!data || !data.color) return;

      this.curColor = data.color;
      this.lightMode = "1";
      let color = rgb2hex(data.color);
      if (data.isTouchEnd) {
        this.handleChangeColor(data);
        this._compareColor(data.curXY);
      }
      // 如果是编辑颜色状态
      if (this.editColorData.editing) {
        this.changeColorPickerColors({ idx: this.editColorData.idx, color, xy: data.curXY });
      } else {
        if (this.selectColor.toLowerCase() !== color) {
          this._resetColorAndTempEdit();
        }
      }
    },
    _compareColor(xyValue) {
      for (let item of this.defaultColorPickerColors) {
        if (item.xy === xyValue) {
          this.selectColor = item.c;
          break;
        } else {
          this.selectColor = "";
        }
      }
    },
    _miniDegree() {
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
    _getWindowHeight(flag) {
      this.$nextTick(() => {
        let node = document.querySelector("#app");
        this.windowHeight = node && node.getBoundingClientRect().height;
      });
    },
    _initData(data = {}, disableEmit) {
      if (!data.attrs) return;
      const mResult = formatMQTTData(data);
      if (mResult) {
        if (typeof mResult.isLightOn === "boolean") {
          this.isLightOn = mResult.isLightOn;
          this.setLightStatus(this.isLightOn);
        }
        if (typeof mResult.degree === "number") {
          if (this.waitMqttDegreeList.length && mResult.degree === this.waitMqttDegreeList[0]) {
            this.waitMqttDegreeList.shift();
          } else {
            this.waitMqttDegreeList = [];
            if (this.fingerTouchObject.target !== "degree") {
              this.degree = mResult.degree; // 刻度是从0开始要减1
              this.$refs.degreeSlideComp._initDegree(this.degree);
              this.$refs.degreeSlideComp.setLinesOffset();
              this.onSlide(this.degree - 1);
            }
          }
        }
        if (typeof mResult.lightMode === "string") {
          this.lightMode = mResult.lightMode === "color" ? "1" : "2";
        } else {
          if (this.operateAreaType.type === 3) {

            this.lightMode = "2";
          }
        }
        if (typeof mResult.xyColor === "string" && (this.operateAreaType.type === 1 || this.operateAreaType.type === 2)) {
          this.xyColor = mResult.xyColor;
          if (!this.editColorData.editing) {
            // 当前手指并不触摸颜色模块，且如果在手指最后一次触摸颜色模块4秒内，mqtt返回的值如果和手指最后一次触摸的值相同，
            // 则不需要更新颜色模块指示器的位置
            if (this.fingerTouchObject.target !== "color") {
              if (!this.touchTimers.colorTimer.timer || !this.xyColor === this.touchTimers.colorTimer.data.value) {
                // 如果值不同，清除计时器并更新位置
                this.touchTimers.colorTimer.timer && clearTimeout(this.touchTimers.colorTimer.timer);
                this.touchTimers.colorTimer.data = {};
                this.touchTimers.colorTimer.timer = null;
                this.$nextTick(() => {
                  this.$refs.colorPicker && this.$refs.colorPicker._initIndicatorPosition(this.xyColor, disableEmit || this.lightMode !== "1");

                  this.curColor = window.xyColors[this.xyColor] && window.xyColors[this.xyColor].c;
         
                });
              }
            }
          }
        }
        if (typeof mResult.lightOnStatus === "number") {
          this.setLightOnStatus(mResult.lightOnStatus);
        }
        if (typeof mResult.electrifyStatus === "number") {
          this.setElectriDefaultLightStatus(mResult.electrifyStatus);
        }
        if (typeof mResult.temprature === "number") {
      

          if (this.operateAreaType.type === 1 || this.operateAreaType.type === 3) {
            this.curTemprature = mResult.temprature;
            let idx = mResult.tempratureIdx;
            
            this.templatureColor2 = hex2rgb(templatureColor[idx]);
       
            // 当前手指并不触摸色温模块，且如果在手指最后一次触摸色温模块4秒内，mqtt返回的值如果和手指最后一次触摸的值相同，
            // 则不需要更新色温模块指示器的位置
            if (!this.editTempData.editing) {
              if (this.fingerTouchObject.target !== "temprature") {
                if (!this.touchTimers.templatureTimer.timer || this.curTemprature !== this.touchTimers.templatureTimer.data.value) {
                  // 如果值不同，清除计时器并更新位置
                  this.touchTimers.templatureTimer.timer && clearTimeout(this.touchTimers.templatureTimer.timer);
                  this.touchTimers.templatureTimer.data = {};
                  this.touchTimers.templatureTimer.timer = null;
                  this.$nextTick(() => {
                    this.$refs.tempratureSelect._setIndicatorByTemprature(this.curTemprature);
                  });
                }
              }
            }
          }
        }
        if (typeof mResult.isChildMode === "boolean") {
          this.setChildMode(mResult.isChildMode);
          if (mResult.isChildMode && this.curTemprature > 4500) {
            this.$nextTick(() => {
              this.$refs.tempratureSelect._setIndicatorByTemprature(4500);
            });
          }
        }
        if (typeof mResult.lightOnStep === "number") {
          this.setLightOnOffStep({ key: "lightOnStep", value: mResult.lightOnStep });
        }
        if (typeof mResult.lightOffStep === "number") {
          this.setLightOnOffStep({ key: "lightOffStep", value: mResult.lightOffStep });
        }
        if (typeof mResult.brightnessCurveValue === "number") {
          this.setBrightnessCurveValue(mResult.brightnessCurveValue);
        }
        if (typeof mResult.brightnessWayValue === "number") {
          this.setBrightnessWayValue(mResult.brightnessWayValue);
        }
        // 最后再设置在离线离线状态
        if (typeof mResult.isOnLine === "boolean") {
          this.isOnLine = mResult.isOnLine;
          if (!mResult.isOnLine) {
            this.isLightOn = false;
            this.setLightStatus(false);
          }
          this.setGlobalDeviceStatus(mResult.onLineValue);
        }
      }
    },
    checkUpgrade(data) {
      if (data.deviceStateEnum === "online" && data.ifUpgradeAble && data.hasNewVersion) {
        if (data.upgradeType === 0 || data.upgradeType === 2) {
          this.upgradeContent = data.versionDesc || this.upgradeContent;
          this.upgradeModal = true;
        }
      }
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
    // 初始化获取数据
    getData() {
      this.getDeviceData();
    },
    async getDeviceData() {
      let { data, error } = await deviceDetailRep({ dataId: this.globalDataId, dataTypeEnum: this.globalDeviceType });
      if (data && !error) {
        let type = data.data.zigbeeTypeEnum || "";
        this.deviceType = deviceZigbeeType[type];
        this.setGlobalMac(data.data.deviceMac || "");
        this.setDeviceDetail(data.data);
        let lightType = this.deviceZigbeeType[data.data.zigbeeTypeEnum];
        this.operateAreaType.type =
          lightType === "ZIGBEE_TYPE_HOME_ALL_LIGHT"
            ? 1
            : lightType === "ZIGBEE_TYPE_HOME_COLOR_LIGHT"
            ? 2
            : lightType === "ZIGBEE_TYPE_HOME_TEMPERATURE_LIGHT"
            ? 3
            : lightType === "ZIGBEE_TYPE_HOME_BRIGHTNESS_LIGHT"
            ? 4
            : "";
        this.getModeList(this.operateAreaType.type);
        this.checkUpgrade(data.data);
        // 是否是单色灯，单色灯没有颜色模式和色温模式，只有亮度
        this.isDimmingLamp = data.data.zigbeeTypeEnum === "DimmingLamp";
        if (data.data.deviceStateEnum !== "online") {
          let txt = `设备${this.netStatus[data.data.deviceStateEnum]}，暂时无法操作`;
          if (this.netStatus[data.data.deviceStateEnum] === "配置中") {
            txt = "设置配置中，请稍等片刻";
          }
          this.modalContent = txt;
          this.isLightOn = false;
          this.isOnLine = false;
          this.netStatusModal = true;
          // 离线: 0; 在线: 1, 5; 离网: 4; 入网中: 7;
          // offline, online, offNetwork, binding
          let num = data.data.deviceStateEnum === "offNetwork" ? 4 : data.data.deviceStateEnum === "binding" ? 7 : data.data.deviceStateEnum === "online" ? 1 : 0;
          this.setGlobalDeviceStatus(num);
        } else {
          this.setGlobalDeviceStatus(1);
        }
        this.$nextTick(() => {
          this._initData(data.data, true);
        });
      } else {
        this.$Toast.show({ title: error.msg });
      }
      // this.$nextTick(() => {
      //   if (this.$refs.tempratureSelect) {
      //     this.$refs.tempratureSelect._initPanel();
      //     this.$refs.tempratureSelect._setIndicatorByTemprature(this.curTemprature,2);
      //   }
      // });
    },
    async getModeList(type) {
      // type: 1全彩， 2：颜色， 3：色温， 4： 单色
      let showStationEnum = type === 1 ? "rgbcw2Mode" : type === 2 ? "rgb2Mode" : type === 3 ? "colorMode" : "";
      let { data, error } = await modeListRep({ showStationEnum: showStationEnum });
      if (data && !error) {
        data.data.map((v) => {
          v.isLoading = false; // 添加loading属性，用于点击时的动画
        });
        this.modeLists = data.data || [];
      }
    },
    async handleChangeLightMode(mode) {
      this.isSettingMode = true;
      let { data, error } = await lightModeChangeRep({
        endpointId: this.globalDataId,
        modeCode: mode.modeCode,
      });
      this.isSettingMode = false;
    },
    async handleToggle(params) {
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.isLightOn = !this.isLightOn;
        this.setLightStatus(this.isLightOn);
      }
    },
    async handleDegreeChange(value) {
      let params = {
        cmdKey: "brightness_set_percent",
        cmdValue1: value,
        endpointId: this.globalDataId,
      };
      this.waitMqttDegreeList.push(Number(value));
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {
        this.degree = value;
      } else {
        let timer = setTimeout(() => {
          this._initData(this.deviceDetail);
          timer && clearTimeout(timer);
        }, 1000);
      }
    },
    async handleTemprature(obj) {
     
      let params = {
        cmdKey: "colorTemp_set_k",
        cmdValue1: obj.templature,
        endpointId: this.globalDataId,
      };
      this.setCurTemprature(obj.templature);
      let { data, error } = await endpointControlRep(params);
      if (data && !error) {

        let idx = (6500 - obj.templature) / 100;
        this.templatureColor2 = hex2rgb(templatureColor[idx]);
 
        this.curColor = this.templatureColor2;

        this.curTemprature = obj.templature;
        this._setTimer(obj, "templature");
      } else {
        this._initData(this.deviceDetail);
      }
    },
    async handleChangeColor(obj) {
      let params = {
        cmdKey: "colorValue_set_xyY",
        cmdValue1: obj.curXY,
        endpointId: this.globalDataId,
      };
      let { data, error } = await endpointControlRep(params);
  
      if (data && !error) {
        if (obj.color) {
     
          this.curColor = obj.color;
        }
        this.lightMode = "1";
        this._setTimer(obj, "color");
      } else {
        this._initData(this.deviceDetail);
      }
    },
    _setTimer(data, type) {
      if (type === "templature") {
        this.touchTimers.templatureTimer.timer && clearTimeout(this.touchTimers.templatureTimer.timer);
        this.touchTimers.templatureTimer.data = { value: data.templature };
        this.touchTimers.templatureTimer.timer = setTimeout(() => {
          this.touchTimers.templatureTimer.data = {};
          this.touchTimers.templatureTimer.timer && clearTimeout(this.touchTimers.templatureTimer.timer);
        }, 4000);
      } else if (type === "color") {
        this.touchTimers.colorTimer.timer && clearTimeout(this.touchTimers.colorTimer.timer);
        this.touchTimers.colorTimer.data = { value: data.curXY };
        this.touchTimers.colorTimer.timer = setTimeout(() => {
          this.touchTimers.colorTimer.data = {};
          this.touchTimers.colorTimer.timer && clearTimeout(this.touchTimers.colorTimer.timer);
        }, 4000);
      } else if (type === "degree") {
      }
    },
  },
  watch: {
    globalMattData(newV, oldV) {
      for (let i = 0; i < newV.length; i++) {
        this._initData(newV[i]);
      }
    },
    globalDeviceStatus(newV) {
      if (Number(newV) === 1 || Number(newV) === 5) {
        this.isLightOn = true;
      } else {
        this.isLightOn = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      "deviceDataModify",
      "defaultTempratureColors",
      "globalDeviceType",
      "globalData",
      "defaultColorPickerColors",
      "globalDataId",
      "globalMattData",
      "globalDeviceStatus",
      "deviceDetail",
      "childMode",
    ]),
    lightOpacity() {
      return (50 + this.degree / 2) / 100;
    },
    lightColor() {
      // 单色灯
      // console.log(this.isDimmingLamp,'什么颜色')
      // if (this.isDimmingLamp) {
      //   return [];
      // }
      // 单组灯
      // console.log(this.lightMode, "什么类型");
      if (this.lightMode === "1") {

        return this.curColor ? this.curColor : [0, 0, 0];
      } else if (this.lightMode === "2") {

        return this.templatureColor2 ? this.templatureColor2 : [0, 0, 0];
      }
      //  console.log(this.lightMode, "什么类型111111");
      return hex2rgb(this.templatureColorArr[this.templatureColorArr.length - 1]);
    },
  },
  created() {
    this.getData();
    // console.log(hex2rgb(templatureColor[0]), "初始化");
  },
  directives: {
    CDUnTouch,
  },
  components: {
    DegreeSlide,
    TempratureSelect,
    ColorPicker,
    LoadingIcon,
    TitleBarlight,
    Modal,
  },
};
</script>
<style lang="less">
#light {
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
    bottom: -100vh;
    right: 0;
    left: 0;
    height: 55vh;
    min-height: 750px;
    background-color: #fff;
    box-shadow: 0px -4px 40px 0px rgba(0, 0, 0, 0.06);
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
      margin-top: 20px;
      width: 60px;
      height: 8px;
      flex: 0 0 8px;
      background: #d8d8d8;
      border-radius: 6px;
      align-self: center;
      z-index: 2;
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
      height: 100px;
      padding: 0 40px;
      box-sizing: border-box;
      font-size: 30px;
      color: #4289ff;
      z-index: 2;
      > div {
        height: 100px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .content {
      width: 100%;
      z-index: 2;
      .list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0 36px;
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
      .temprature-circle-wrap,
      .color-picker-wrap {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 26px 0;
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
    .content {
      position: relative;
      width: 100%;
      height: 100%;
      background: #fff;
      z-index: 2;
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      display: flex;
      align-items: center;
      flex-direction: column;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
      .mode-list {
        flex: 1;
        width: 100%;
        height: calc(100% - 8px);
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
    }
  }
}
</style>
