/*
 * @Description: 
 * @Version: 1.0
 * @Autor: Benjamin Chiu
 * @Date: 2021-06-29 10:01:59
 * @LastEditors: Benjamin Chiu
 * @LastEditTime: 2021-09-08 15:33:07
 */
const store = {
    state: {
        airConditionStatus: false,
        oldTemperature: 26,
        Temperature: 26,
        airDuration: 0, // 空调倒计时
        airTimer: 0, // 空调倒计时
        mode: 2,  // 空调模式  0-制冷，1-制热，2-除湿，3-送风
        windSpeed: 1,  // 通电后默认风速状态 1-自动，2-小风，3-中风，4-大风
    },
    mutations: {
        setOldTemperature(state, data) {
            state.oldTemperature = data
        },
        setTemperature(state, data) {
            state.Temperature = data
        },
        setWindSpeed(state, data) {
            state.windSpeed = data
        },
        setAirConditionMode(state, data) {
            state.mode = data
        },
        setAirConditionStatus(state, data) {
            state.airConditionStatus = data
        },
        setAirDuration(state, data) {
            state.airDuration = data
        },
        setAirTimer(state, data) {
            state.airTimer = data
        }
        
    },
    actions: {},
    getters: {
        getTemperature: state => state.Temperature,
        getOldTemperature: state => state.oldTemperature,
        getAirConditionMode: state => state.mode,
        getWindSpeed: state => state.windSpeed,
        airConditionStatus: state => state.airConditionStatus,
        getAirDuration: state => state.airDuration,
        getAirTimer: state => state.airTimer
    }
}

export default store