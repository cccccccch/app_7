// 编组任务 store
const store = {
  namespaced: true,
  state: {
    // { id: {deviceName:'...'}}
    subDeviceList: {}, // 子设备对象,
    curDeviceDetail: {},
  },
  mutations: {
    setSubDeviceList(state, data) {
      state.subDeviceList = data;
    },
    setCurDeviceDetail(state, data) {
        state.curDeviceDetail = data;
      }
  },
  actions: {},
  getters: {
    getSubDeviceList: state => state.subDeviceList,
    getCurDeviceDetail: state => state.curDeviceDetail
  }
};

export default store;
