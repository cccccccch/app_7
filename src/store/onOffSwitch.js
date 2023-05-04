const store = {
  state: {
    onOffSwithDeviceStatus: 0,
    onOffSwitchMotorStrength: 160, // 震感强度
    onOffSwitchElectrifyStatus: 255,  // 继电器状态,
    onOffSwitchDoNotDisturbEnable: false, // 勿扰模式 
    onOffSwitchScrollTop: 0, // 滚动条位置 ,
    customWeeks: [], // 自定义执行星期 
  },
  mutations: {
    setOnOffSwithDeviceStatus(state, value) {
      console.log(value,'OnOffSwithDeviceStatus-ing');
      state.onOffSwithDeviceStatus = value;
    },
    setOnOffSwitchMotorStrength(state, value) {
      state.onOffSwitchMotorStrength = value;
    },
    setOnOffSwitchElectrifyStatus(state, value) {
      state.onOffSwitchElectrifyStatus = value;
    },
    setOnOffSwitchDoNotDisturbEnable(state, value) {
      state.onOffSwitchDoNotDisturbEnable = value;
    },
    setOnOffSwitchScrollTop(state, value) {
      state.onOffSwitchScrollTop = value;
    },
    setCustomWeeks(state, value) {
      state.customWeeks = value;
    } 
  },
  getters: {
    onOffSwithDeviceStatus: (state) => state.onOffSwithDeviceStatus,
    onOffSwitchMotorStrength: (state) => state.onOffSwitchMotorStrength,
    onOffSwitchElectrifyStatus: (state) => state.onOffSwitchElectrifyStatus, 
    onOffSwitchDoNotDisturbEnable: (state) => state.onOffSwitchDoNotDisturbEnable, 
    onOffSwitchScrollTop: (state) => state.onOffSwitchScrollTop, 
    customWeeks: (state) => state.customWeeks, 
  },
};

export default store;
