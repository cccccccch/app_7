export const CMD_KEY = {
    OPEN: 'open', // 开
    CLOSE: 'close', // 关
    SET_MODE_COOL: 'airConditioning_set_mode_cool',// 制冷
    SET_MODE_HEAT: 'airConditioning_set_mode_heat',// 制热
    SET_MODE_FAN: 'airConditioning_set_mode_fan',// 送风
    SET_MODE_DEHUMIDIFICATION: 'airConditioning_set_mode_dehumidification',// 除湿
    SET_MODE_AUTO: 'airConditioning_set_mode_auto',// 自动（风速自动使用该指令）
    SET_TEMPERATURE: 'airConditioning_set_temperature',// 温度调节至
    SET_MIN_TEMPERATURE: 'airConditioning_set_min_temperature',// 设置最低温度
    SET_MAX_TEMPERATURE: 'airConditioning_set_max_temperature',// 设置最高温度
    SET_FAN_SPEED: 'airConditioning_set_fan_speed',// 风速调节至
    ADD_1_DEGREES: 'airConditioning_add_1_degrees_celsius',// 温度+1℃ 
    SUB_1_DEGREES: 'airConditioning_sub_1_degrees_celsius',// 温度-1℃ 
    OPEN_CHILD_MODE: 'airConditioning_open_child_mode',// 开启儿童模式
    CLOSE_CHILD_MODE: 'airConditioning_close_child_mode',// 关闭儿童模式
    
}

export const CMD_KEY_VRV2 = {
    OPEN: 'vrv2_open', // 开
    CLOSE: 'vrv2_close', // 关
    TOGGLE: 'vrv2_toggle', // 开关切换
    SET_MODE_COOL: 'vrv2_set_mode_cool',// 制冷
    SET_MODE_HEAT: 'vrv2_set_mode_heat',// 制热
    SET_MODE_FAN: 'vrv2_set_mode_fan',// 送风
    SET_MODE_DEHUMIDIFICATION: 'vrv2_set_mode_dehumidification',// 除湿
    SET_MODE_AUTO: 'vrv2_set_mode_auto',// 自动（风速自动使用该指令）
    SET_TEMPERATURE: 'vrv2_set_temperature',// 温度调节至 	单位：1°
    SET_FAN_SPEED: 'vrv2_set_fan_speed',// 风速调节至
    ADD_1_DEGREES: 'vrv2_add_temperature_1',// 温度+1℃ 
    SUB_1_DEGREES: 'vrv2_sub_temperature_1',// 温度-1℃ 
    SET_CHILD_MODE: 'vrv2_set_child_mode',// 开启儿童模式 0-关闭，1-开启 
}