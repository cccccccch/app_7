const store = {
  state: {
    curtainMaxMinPoint: 0b0000, // 窗帘上下限点位设置，规则参照utils/socketUtil.js
    curtainRunWay: 0, // 0正，1反
    curtainPreferencePoint: [25, 50, 75],
    curtaindegreearr: [0,0,0],
    curtainAngleGear: 1
  },
  mutations: {
    setcurtaindegree(state, value){
      state.curtaindegreearr = value;
    },
    setCurtainMaxMinPoint(state, value) {
      state.curtainMaxMinPoint = value;
    },
    setCurtainRunWay(state, value) {
      state.curtainRunWay = value;
    },
    setCurtainAngleGear(state, value) {
      state.curtainAngleGear = value;
    },
    setCurtainPreferencePoint(state, data) {
      let list = state.curtainPreferencePoint;
      if (data && data.length) {
        list = data;
      }
      state.curtainPreferencePoint = list;
    }
  },
  getters: {
    getcurtaindegree:state => state.curtaindegreearr,
    getCurtainMaxMinPoint: state => state.curtainMaxMinPoint,
    getCurtainRunWay: state => state.curtainRunWay,
    getCurtainPreferencePoint: state => state.curtainPreferencePoint,
    getCurtainAngleGear: state => state.curtainAngleGear
  }
};

export default store;
