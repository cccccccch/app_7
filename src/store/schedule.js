// 定时任务 store
const store = {
  namespaced: true,
  state: {
    EffectLight: false, // 效果灯开关状态
    DoNotDisturb: false, // 勿扰模式开关状态
    DoNotDisturbEffect: 0, // 勿扰模式 暗色 亮色 {1:较暗,2:关闭}
    PreOffMinutes: 0, // Ls10 插座 按键预约关闭 分钟
    PreOffCloseTime: 0, // Ls10 插座 按键预约关闭 倒计时（秒钟）
    PreOffTaskId: 0, // Ls10 插座 按键预约关闭 ID
    CountdownCloseTime: 0, //  倒计时（秒钟）
    CountdownTaskId: 0, //  倒计时（秒钟） ID
    CountdownType: "off", //  倒计时类型，开: on,关：off
    TimingDesc: "", //  最近一次定时
    NeedRefreshState: 0, // 插座 是否需要刷新
    ScheduleTask: [], // 插座 定时任务列表
    ScheduleDays: [], //  定时任务周期 0 1 2 3 4 5 6
    closeTime: 0 // 插座 关闭倒计时（分钟）
  },
  mutations: {
    setCloseTime(state, data) {
      state.closeTime = data;
    },
    setEffectLight(state, data) {
      state.EffectLight = data;
    },
    setDoNotDisturb(state, data) {
      state.DoNotDisturb = data;
    },
    setPreOffMinutes(state, data) {
      state.PreOffMinutes = data;
    },
    setPreOffCloseTime(state, data) {
      state.PreOffCloseTime = data;
    },
    setPreOffTaskId(state, data) {
      state.PreOffTaskId = data;
    },
    setCountdownCloseTime(state, data) {
      state.CountdownCloseTime = data;
    },
    setCountdownTaskId(state, data) {
      state.CountdownTaskId = data;
    },
    setCountdownType(state, data) {
      state.CountdownType = data;
    },
    setNeedRefreshState(state, data) {
      state.NeedRefreshState = data;
    },
    setTimingDesc(state, data) {
      state.TimingDesc = data;
    },
    setScheduleTask(state, data) {
      state.ScheduleTask = data;
    },
    setScheduleDays(state, data) {
      state.ScheduleDays = data;
    }
  },
  actions: {},
  getters: {
    getEffectLight: state => state.EffectLight,
    getDoNotDisturb: state => state.DoNotDisturb,
    getPreOffMinutes: state => state.PreOffMinutes,
    getPreOffCloseTime: state => state.PreOffCloseTime,
    getPreOffTaskId: state => state.PreOffTaskId,
    getCloseTime: state => state.closeTime,
    getCountdownCloseTime: state => state.CountdownCloseTime,
    getCountdownTaskId: state => state.CountdownTaskId,
    getCountdownType: state => state.CountdownType,
    getNeedRefreshState: state => state.NeedRefreshState,
    getTimingDesc: state => state.TimingDesc,
    getScheduleTask: state => state.ScheduleTask,
    getScheduleDays: state => state.ScheduleDays,
  }
};

export default store;
