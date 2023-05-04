/*
 * @Author: Dywade
 * @Date: 2021-11-04 09:42:15
 * @LastEditTime: 2022-01-10 15:11:35
 * @LastEditors: Dywade
 * @Description: 
 */
const store = {
    state: {
        globalTemprature: 4500,
        lightStatus: false,
        whenLightOnStatus: 255, // 开灯后灯光状态 255-恢复关灯前状态，
        whenElectriDefaultLightStatus: 255, // 通电后默认开关状态 1-通电后默认开灯，0-通电后默认关灯255-通电后恢复断电前状态
        lightOnStep: 1,
        lightOffStep: 1,
        brightnessCurveValue: 0, //调光曲线 0-线性调光，1-对数调光
        brightnessWayValue: 0 // 调光方式 0-使用1到10v，1-使用0到10v
    },
    mutations: {
        setLightOnStatus(state, data) {
            state.whenLightOnStatus = data;
        },
        setElectriDefaultLightStatus(state, data) {
            state.whenElectriDefaultLightStatus = data;
        },
        setLightStatus(state, data) {
            state.lightStatus = data;
        },
        setCurTemprature(state, data) {
            state.globalTemprature = data;
        },
        setLightOnOffStep(state, payload) {
            if (payload.key === "lightOnStep") {
                state.lightOnStep = payload.value;
            } else if (payload.key === "lightOffStep") {
                state.lightOffStep = payload.value;
            }
        },
        setBrightnessCurveValue(state, value) {
            state.brightnessCurveValue = value
        },
        setBrightnessWayValue(state, value) {
            state.brightnessWayValue = value
        }
    },
    actions: {},
    getters: {
        getWhenLightOnStatus: state => state.whenLightOnStatus,
        getElectriDefaultLightStatus: state => state.whenElectriDefaultLightStatus,
        lightStatus: state => state.lightStatus,
        globalTemprature: state => state.globalTemprature,
        getLightOnStep: state => state.lightOnStep,
        getLightOffStep: state => state.lightOffStep,
        getBrightnessCurveValue: state => state.brightnessCurveValue,
        getBrightnessWayValue: state => state.brightnessWayValue
    }
};

export default store;
