import { CMD_KEY, CMD_KEY_VRV2 } from './cmdkey' 
import { deviceZigbeeType } from "@/utils/index"; 

import closedPic from "@/assets/svgs/closed.svg"; 
import refrigerationPic from "@/assets/svgs/refrigeration.png";
import heatingPic from "@/assets/svgs/heating.png";
import arefactionPic from "@/assets/svgs/arefaction.png";
import ventilatePic from "@/assets/svgs/ventilate.png";

const mode = [
//     {
//     name: '关闭',
//     img: closedPic,
//     icon: 'icon-refrigeration',
//     id: 0,
//     vrv2_id: -1,
//     canHandleDegree: true,
//     degree: 0,
//     showDegree: false,
//     canHandleSpeed: false,
//     isOption: false,
//     zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning],
// },
{
    name: '制冷',
    img: refrigerationPic,
    icon: 'icon-refrigeration',
    degree: 25,
    id: 3,
    vrv2_id: 2,
    canHandleDegree: true,
    canHandleSpeed: true,
    showDegree: true,
    shadow: '#E5EEF9',
    key: 'SET_MODE_COOL',
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning],
    isOption: true
},
{
    name: '制热',
    img: heatingPic,
    icon: 'icon-heating',
    degree: 22,
    showDegree: true,
    shadow: '#F9EFE3',
    id: 4,
    vrv2_id: 1,
    canHandleDegree: true,
    canHandleSpeed: true,
    key: 'SET_MODE_HEAT',
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning],
    isOption: true
},
{
    name: '除湿',
    img: arefactionPic,
    showDegree: false,
    degree: 0,
    icon: 'icon-arefaction',
    canHandleSpeed: true,
    shadow: '#E5F5F7',
    key: 'SET_MODE_DEHUMIDIFICATION',
    zigbeeType: [deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning],
    id: 8,
    canHandleDegree: false,
    vrv2_id: 7, 
    isOption: true
},
{
    name: '送风',
    img: ventilatePic,
    shadow: '#E3F6EF',
    icon: 'icon-ventilate',
    degree: 0,
    canHandleSpeed: true,
    showDegree: false,
    key: 'SET_MODE_FAN',
    id: 7,
    canHandleDegree: false,
    vrv2_id: 0,
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning],
    isOption: true
}]


const windSpeed = [
{
    name: '小风',
    icon: 'icon-wind-low',
    id: 1,
    default: false,
    cmdValue: '01',
    vrv2_id: 16,
    cmdVrv2Value: '16',
    key: CMD_KEY.SET_FAN_SPEED,
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning]
},
{
    name: '中风',
    icon: 'icon-wind-middle',
    id: 2,
    vrv2_id: 48,
    default: false,
    cmdValue: '02',
    cmdVrv2Value: '48',
    cmdKey: CMD_KEY.SET_FAN_SPEED,
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning]
},
{
    name: '大风',
    icon: 'icon-wind-strong',
    id: 3,
    vrv2_id: 80,
    cmdValue: '03',
    cmdVrv2Value: '80',
    key: CMD_KEY.SET_FAN_SPEED, 
    zigbeeType: [deviceZigbeeType.TemperatureController, deviceZigbeeType.VRV2, deviceZigbeeType.AirConditioning], 
    default: false
},{
    name: '自动',
    icon: 'icon-wind-auto',
    id: 0, 
    cmdValue: '00',
    key: 'SET_FAN_SPEED',
    default: true,
    zigbeeType: [deviceZigbeeType.TemperatureController]
}]

const range = {
        ChildMode:  new Map([[
                deviceZigbeeType.VRV2, {
                    maxTemperature: 32,
                    minTemperature: 25
                }
            ],[
                deviceZigbeeType.TemperatureController, {
                    maxTemperature: 30,
                    minTemperature: 25
                }
            ],[
                deviceZigbeeType.AirConditioning, {
                    maxTemperature: 32,
                    minTemperature: 25
                }
            ]]),
        Normal: new Map([[
            deviceZigbeeType.VRV2, {
                maxTemperature: 32,
                minTemperature: 16
            }
        ],[
            deviceZigbeeType.TemperatureController, {
                maxTemperature: 30,
                minTemperature: 16
            }
        ],[
            deviceZigbeeType.AirConditioning, {
                maxTemperature: 32,
                minTemperature: 16
            }
        ]]) 
} 

/**
 * 渲染页面用的，模式
 * @param {*} zigbeeType 
 * @returns 
 */
export const getModeList = (zigbeeType) => {
    let s = []
    if(zigbeeType) {
        s = mode.filter(i => i.zigbeeType.indexOf(zigbeeType) > -1)
    } else {
        s = [mode[0]]
    } 
    return mode.map(s => { 
        s.id = deviceZigbeeType.VRV2 === zigbeeType ? s.vrv2_id : s.id
        return s
    })
}

export const getSpeedList = (zigbeeType) => {  
    let s = []
    if(zigbeeType) {
        s = windSpeed.filter(i => i.zigbeeType.indexOf(zigbeeType) > -1)
    } else {
        s = [windSpeed[0]]
    } 
    // console.log('zigbeeType:',zigbeeType,'; s:', s)
    const res = s.map(s => { 
        s.id = deviceZigbeeType.VRV2 === zigbeeType ? s.vrv2_id : s.id
        return s
    }) 
    // console.log('zigbeeType:',zigbeeType,';res:',res)
    return res
}

/**
 * 获取温度可调节范围
 * @param {*} zigbeeType 
 * @param {*} isChildMode 是否为儿童模式
 * @returns 
 */
export const getTemperatureRange = (zigbeeType, isChildMode = false) => {
    const data = isChildMode ? range.ChildMode : range.Normal 
    const res = data.get(zigbeeType)
    return res || {
        maxTemperature: 32,
        minTemperature: 16
    } 
}

/**
 * 根据zigbeeType获取空调、风机盘管、VRV2空调模式选项（风机盘管没有除湿功能）
 * @param {*} zigbeeType 
 * @returns 选项列表
 */
export const getModeOptions = (zigbeeType) => {
    return mode.filter(item => item.isOption && item.zigbeeType.includes(zigbeeType)).map(s => {
        s.cmdKey = deviceZigbeeType.VRV2 === zigbeeType ? CMD_KEY_VRV2[s.key] : CMD_KEY[s.key]
        return s
    })
}

/**
 * 根据zigbeeType获取空调、风机盘管、VRV2风速模式选项（VRV2空调没有自动风速）
 * @param {*} zigbeeType 
 * @returns 
 */
export const getSpeedOptions = (zigbeeType) => {
    return windSpeed.filter(item => item.zigbeeType.includes(zigbeeType)).map(s => { 
        s.cmdKey = deviceZigbeeType.VRV2 === zigbeeType ? CMD_KEY_VRV2['SET_FAN_SPEED'] : CMD_KEY['SET_FAN_SPEED']
        s.cmdValue = deviceZigbeeType.VRV2 === zigbeeType ? s.cmdVrv2Value : s.cmdValue
        return s
    })
}

export const CONFIG = {
    isSupportChildMode: [deviceZigbeeType.AirConditioning, deviceZigbeeType.VRV2], // 是否支持儿童模式,
}