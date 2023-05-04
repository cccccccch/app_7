// 新风、地暖、插座都是用此store
const store = {
    state: { 
        ventilatorMode: 0,  // 空调模式  0-制冷，1-制热，2-除湿，3-送风
        ventilatorWindSpeed: 1,  // 通电后默认风速状态 1-自动，2-小风，3-中风，4-大风
        ventilatorTaskId: 0, // 定时器ID
        ventilatorTemperature: 0, // 温度
        ventilatorOriginTemperature: 0, // 原始温度
        taskStartTimeMs: 0,// 倒计时开始时间戳 
        taskMinutes: 0,// 倒计时时间长度（分钟）
        socketEffectLight: false, // 插座效果灯开关状态
        socketDoNotDisturb: false, // 插座勿扰模式开关状态
        socketDoNotDisturbEffect: 0, // 插座勿扰模式 暗色 亮色 {1:较暗,2:关闭}
        closeTime: 0, // 插座 关闭倒计时（分钟）
    },
    mutations: { 
        setVentilatorTaskId(state, data) {
            state.ventilatorTaskId = data
        },
        setCloseTime(state, data) {
            state.closeTime = data
        },
        setVentilatorWindSpeed(state, data) {
            state.ventilatorWindSpeed = data
        },
        setVentilatorMode(state, data) {
            state.ventilatorMode = data
        },
        setVentilatorOriginTemperature(state, data) {
            state.ventilatorOriginTemperature = data
        },
        setVentilatorTemperature(state, data) {
            state.ventilatorTemperature = data
        },
        setSocketEffectLight(state, data) {
            state.socketEffectLight = data
        },
        setSocketDoNotDisturb(state, data) {
            state.socketDoNotDisturb = data
        },
        setTaskStartTimeMs(state, data) {
            state.taskStartTimeMs = data
        },
        setTaskMinutes(state, data) {
            state.taskMinutes = data
        }, 
    },
    actions: {},
    getters: {
        getVentilatorTaskId: state => state.ventilatorTaskId, 
        getVentilatorMode: state => state.ventilatorMode,
        getVentilatorWindSpeed: state => state.ventilatorWindSpeed,
        getVentilatorOriginTemperature: state => state.ventilatorOriginTemperature,
        getVentilatorTemperature: state => state.ventilatorTemperature,
        getSocketEffectLight: state => state.socketEffectLight,
        getSocketDoNotDisturb: state => state.socketDoNotDisturb, 
        getTaskStartTimeMs: state => state.taskStartTimeMs, 
        getCloseTime: state => state.closeTime,
        getTaskMinutes: state => state.taskMinutes,
    }
}

export default store