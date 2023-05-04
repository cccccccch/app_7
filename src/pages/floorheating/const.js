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
    isOption: false,
    cmdValue1: "00",
    canHandleDegree: true,
    id: 0,
    default: false
},{
    name: '节能', 
    icon: 'icon-eco',
    shadow: '#EEE0E0',
    fontColor: '#D80200',
    cmdKey: CMD_KEY.SET_MODE,
    isOption: true,
    cmdValue1: "01",
    canHandleDegree: false,
    id: 1,
    default: true
},
{
    name: '舒适', 
    icon: 'icon-comfortable',
    id: 2,
    shadow: '#E5EEF9',
    fontColor: '#333333',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "02",
    canHandleDegree: true,
    isOption: true,
    default: false
},
{
    name: '睡眠', 
    icon: 'icon-moon',
    id: 3,
    shadow: '#E5EEF9',
    fontColor: '#333333',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "03",
    canHandleDegree: true,
    isOption: true,
    default: false
},
{
    name: '外出', 
    icon: 'icon-goout',
    id: 4,
    canHandleDegree: true,
    shadow: '#E5EEF9',
    fontColor: '#333333',
    cmdKey: CMD_KEY.SET_MODE,
    cmdValue1: "04",
    isOption: true,
    default: false
}]  