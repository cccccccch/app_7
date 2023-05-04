import { CMD_KEY } from './cmdkey'
import weak from "../../assets/svgs/air_fresh_gear_weak.svg"; 
import moderate from "../../assets/svgs/air_fresh_gear_moderate.svg";
import strong from "../../assets/svgs/air_fresh_gear_strong.svg";
import turnoff from "../../assets/svgs/air_fresh_gear_turnoff.svg"; 
export const TEMPRATUREMODE = {

}
export const MODELIST = [
{
    name: '手动', 
    icon: 'icon-mode',
    shadow: '#EEE0E0',
    fontColor: '#D80200',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "00",
    id: 0,
    isOptions: false,
    default: false
},{
    name: '自动', 
    icon: 'icon-auto',
    shadow: '#EEE0E0',
    fontColor: '#D80200',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "01",
    id: 1,
    isOptions: true,
    default: true
    
},
{
    name: '睡眠', 
    icon: 'icon-sleep',
    id: 2,
    shadow: '#E5EEF9',
    fontColor: '#333333',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "02",
    isOptions: true,
    default: false
}] 

export const WINDSPEED = [
{
    name: '关闭',
    icon: 'icon-wind-low',
    id: 0,
    bg: turnoff,
    isOptions: false,
    cmdValue: '00',
    cmdKey: CMD_KEY.SET_FAN_SPEED,
}, 
{
    name: '小风',
    icon: 'icon-wind-low',
    id: 1,
    bg: weak,
    isOptions: true,
    cmdValue: '01',
    cmdKey: CMD_KEY.SET_FAN_SPEED,
},
{
    name: '中风',
    icon: 'icon-wind-middle',
    id: 2,
    bg: moderate,
    isOptions: true,
    cmdValue: '02',
    cmdKey: CMD_KEY.SET_FAN_SPEED,
},
{
    name: '强风',
    icon: 'icon-wind-strong',
    id: 3,
    cmdValue: '03',
    bg: strong,
    cmdKey: CMD_KEY.SET_FAN_SPEED,  
    isOptions: true
}]