export const formatMQTTData = data => {
  if (!data) return false;
  let xValue = null;
  let yValue = null;
  let lightMode = null; // 颜色模式， color:使用色盘颜色，temprature：使用色温颜色
  let isLightOn = null; // 灯是否打开
  let xyColor = null;
  let degree = null;
  let curtaindegree = null;
  let isOnLine = null; // 是否在线
  let onLineValue = null;
  let curTemprature = null;
  let isChildMode = null;
  let curTempratureIdx = null;
  let homeTemprature = null;
  let airConditionTemprature = null;
  let airConditionTempratureMax = null;
  let airConditionTempratureMin = null;
  let airConditionTempratureMode = null;
  let airConditionWindSpeed = null;
  let curtainPercent = null;
  let airConditionChildModeMinTemperature = null;
  let measureTemprature = null; // 新风机等的温度测量值
  let measureHumidity = null; // 新风机等的湿度测量值
  let pm25Value = null; // pm2.5测量值
  let co2Value = null; // pm2.5测量值
  let vocValue = null; // voc值
  let timerDuration = null; // 新风机等的定时器倒计时
  let timerStatus = null; // 新风机等的定时器状态
  let airFresherMode = null; // 新风机工作模式 0：手动 1：自动 2： 睡眠
  let isDark = null; // 插座 效果灯 暗色模式
  let isEffectLight = null; // 插座 效果灯 开关
  let electronicTotal = null; // 插座 总耗电量
  let MFCMode = null; // 多功能控制器模式: 161-电机模式， 162-门禁模式，163-485模式
  let electrifyStatus = null; // 通电后灯光状态
  let lightOnStatus = null; // 开灯后灯光状态
  let onOffSwithDeviceStatus = null; // 开光灯等设备的设备常开状态 0-当做开关 1-当做情景并继电器可控 5-当做情景并继电器常开 6-当做情景并继电器常关（6不处理）
  let sensorPowerValue = null; // 传感器电量  // 电池电量 0-200
  let lightOnStep = null; // 灯缓亮秒数
  let lightOffStep = null; // 灯缓灭秒数
  let lightHues = null; // 灯色相
  let lightSaturation = null; // 灯饱和度
  let motorStrength = null; // 马达震感 0：关闭 40： 一档 80： 二档 120： 三档 160： 四档 200： 五档
  let doorLockStatus = null; // 门锁状态 0假锁，1上锁，2未锁, 暂不处理假锁状态（2021/12/03）
  let doorAutoLockTime = null; // 自动上锁时间 如果值是65535, 表示关闭自动上锁功能。
  let doorAutoLockStatus = null; // 门锁自动上锁功能开启/关闭 true开启， false关闭
  let doorLockElectric = null; // 门锁电量 0-200
  let doorOprateStatus = null; // 门锁开门状态， "00"：成功,其他失败
  let curtainRunWay = null; // 窗帘正向反向， 取余，0正向，1反向
  let curtainAngleGear = null; // 百叶窗角度
  let curtainMaxMinPoints = null; // 窗帘上限点和下限点：  0b0000未设置， 0b0001已设置上限点， 0b0010已设置下限点， 0b0011上下点都已设置
  let brightnessCurveValue = null; // 调光曲线 0-线性调光，1-对数调光
  let brightnessWayValue = null; // 调光方式 0-使用1到10v，1-使用0到10v
  if (data.attrs) {
    for (let item of data.attrs) {
      switch (item.attrHex) {
        case 393216:
          // 开灯、关灯
          isLightOn = Number(item.attrValue) === 1;
          break;
        case 524288:
          // value范围0-254   刻度计算方式： (value+1)/255 *100
          let _value = Number(item.attrValue) > 254 ? 254 : Number(item.attrValue) < 0 ? 0 : Number(item.attrValue);
          degree = Math.round(((_value + 1) / 255) * 100); // 刻度是从0开始要减1
          break;
        case 50331651:
          // 颜色x值
          xValue = item.attrValue;
          break;
        case 50331652:
          // 颜色y值
          yValue = item.attrValue;
          break;
        case 50331656:
          // attrValue 0:HSV颜色模式 1:颜色模式，2： 色温模式
          console.log(item.attrValue,'系欸写')
          lightMode = Number(item.attrValue) === 1 || Number(item.attrValue) === 0 ? "color" : "temprature";
          break;
        case 50331655:
          // 只有全彩灯和色温灯才显示
          // 色温计算 value/100 四舍五入再×100 最终值必须在2700-6500间且能被100整除 榜威灯是2000-6500
          curTemprature = Math.round(Number(item.attrValue) / 100) * 100;
          curTempratureIdx = (6500 - curTemprature) / 100;
          break;
        // 这里不判断，详情往下拉看下面的注释
        // case 15855616:
        //   // 1:在线，0： 离线
        //   isOnLine = Number(item.attrValue) === 1;
        //   onLineValue = Number(item.attrValue);
        //   break;
        case 4229038092:
          // 儿童模式： 222 ， 非儿童模式： 154
          isChildMode = Number(item.attrValue) === 222;
          break;
        case 33619968:
          // 室内温度 除以10
          homeTemprature = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619986:
          // 空调温度
          airConditionTemprature = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619992:
          // 空调最高温度
          airConditionTempratureMax = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619981:
          // 空调最低温度
          airConditionTempratureMin = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619990:
          // 空调最高温度
          airConditionTempratureMax = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619989:
          // 空调最低温度
          airConditionTempratureMin = (Number(item.attrValue) / 10) | 0;
          break;
        case 33619996:
          // 空调当前模式 3-制冷，4-制热，7-送风，8-除湿，1-自动 自动不处理
          airConditionTempratureMode = Number(item.attrValue);
          break;
        case 4229955584:
          // 地暖
          airFresherMode = Number(item.attrValue);
          break;
        case 33685504:
          // 空调风速 1-低2-中3-高0-自动
          airConditionWindSpeed = Number(item.attrValue);
          break;
        case 16908296:
          // 窗帘升降百分比
          curtainPercent = Number(item.attrValue);
          break;
        case 16908297:
          // 窗帘升降百分比
          curtaindegree = Number(item.attrValue);
          break;
        case 67239936: // 温度测量值
          measureTemprature = (Number(item.attrValue) / 10) | 0;
          break;
        case 67436544: // 湿度测量值
          let h = Number(item.attrValue);
          measureHumidity = h < 0 ? 0 : h;
          measureHumidity = measureHumidity / 100;
          break;
        case 4230021124: // PM2.5
          pm25Value = Number(item.attrValue);
          break;
        case 4230021126: // co2测量值
          co2Value = Number(item.attrValue);
          break;
        case 4230021125: // voc值
          vocValue = Number(item.attrValue);
          break;
        case 4228972545: // 新风机等的定时器倒计时
          timerDuration = Number(item.attrValue);
          break;
        case 4228907011: // 新风机等的定时器状态
          timerStatus = Number(item.attrValue);
          break;
        case 4230021120: // 新风机等的工作模式
          airFresherMode = Number(item.attrValue);
          break;
        case 4229038086: // 开灯后灯光状态
          lightOnStatus = Number(item.attrValue);
          break;
        case 409603: // 通电后默认开关状态
          electrifyStatus = Number(item.attrValue);
          break;
        case 4278190097: // VRV2 开关
          isLightOn = Number(item.attrValue) == 1;
          break;
        case 4278190100: // VRV2 模式 2-制冷，1-制热，0-送风，7-除湿，3-自动
          airConditionTempratureMode = Number(item.attrValue);
          break;
        case 4278190102: // VRV2 温度，取值：25 不需转换
          airConditionTemprature = Math.floor(Number(item.attrValue));
          break;
        case 4278190106: // VRV2 儿童模式
          isChildMode = Number(item.attrValue) == 1;
          break;
        case 4278190098: // VRV2 风速 16-低，48-中，80-高
          airConditionWindSpeed = Number(item.attrValue);
          break;
        case 4228907009: // 插座 效果灯开关 1-开，0-关
          isEffectLight = Boolean(~~item.attrValue);
          break;
        case 4228907010: // 插座 儿童模式
          isChildMode = Boolean(~~item.attrValue);
          break;
        case 4228907012: // 插座 工作灯亮度 1~255 1~127为暗色，128~255为亮色
          isDark = ~~item.attrValue > 1 && ~~item.attrValue <= 127;
          break;
        case 117571584: // 插座 总耗电量
          electronicTotal = ~~item.attrValue;
          break;
        case 4228907264:
          MFCMode = Number(item.attrValue);
          break;
        case 4228907008:
          //// {
          //         "attrDesc": "当做情景还是开关",
          //         "attrHex": 4228907008,
          //         "attrValue": "0"
          //   }
          onOffSwithDeviceStatus = Number(item.attrValue);
          break;
        case 65569:
          sensorPowerValue = Number(item.attrValue); // 电池电量 0-200
          doorLockElectric = Number(item.attrValue); // 锁的电池电量 0-200
          break;
        case 524306:
          lightOnStep = Math.ceil(Number(item.attrValue) / 10);
          break;
        case 524307:
          lightOffStep = Math.ceil(Number(item.attrValue) / 10);
          break;
        case 50331648:
          lightHues = Math.round((Number(item.attrValue) * 360) / 254);
          break;
        case 50331649:
          lightSaturation = Math.round(Number(item.attrValue));
          break;
        case 4228971776:
          motorStrength = Math.round(Number(item.attrValue));
          break;
        case 16842752: // 锁的状态
          doorLockStatus = Number(item.attrValue);
          break;
        case 16904193: // 锁自动上锁时间 如果值是65535, 表示关闭自动上锁功能。
          doorAutoLockTime = Number(item.attrValue);
          doorAutoLockStatus = Number(item.attrValue) !== 65535;
          break;
        case 4243221120: // attrValue：00 开门成功，其他失败
          doorOprateStatus = Number(item.attrValue) === 0;
          break;
        case 501:
          if (Number(item.attrValue) === 1) {
            curtainMaxMinPoints = curtainMaxMinPoints ? curtainMaxMinPoints & 0b0011 : 0b0001;
          }
          break;
        case 502:
          if (Number(item.attrValue) === 1) {
            curtainMaxMinPoints = curtainMaxMinPoints ? curtainMaxMinPoints & 0b0011 : 0b0010;
          }
          break;
        case 4228972032:
          let value = Number(item.attrValue);
          curtainMaxMinPoints = value & 0b0011;
          break;
        case 16908311:
          curtainRunWay = Number(item.attrValue) % 2;
          break;
        case 4228972034:
          curtainAngleGear = Number(item.attrValue);
          break;
        case 4229102609: // 调光曲线 0-线性调光，1-对数调光
          brightnessCurveValue = Number(item.attrValue);
          break;
        case 4229102610: // 调光方式 0-使用1到10v，1-使用0到10v
          brightnessWayValue = Number(item.attrValue);
          break;
      }
    }
  }
  if (xValue && yValue) {
    xyColor = xValue + " " + yValue;
  }

  // console.log("lightMode:", lightMode); // 注意，deviceDetail接口返回的deviceStateEnum 是英文枚举值：offline, online, offNetwork, binding
  // 0: "offline",
  // 1: "online",
  // 4: "offNetwork",
  // 5: "online",
  // 7: "binding",
  // 注意！！！！！ 因为mqtt和设备详情页拿到的attrs字段的值都在这里处理
  // 而通过MQTT上报的15855616在线离线状态已经在 store/index.js->setMqttMessage方法里统一转为了枚举值，(首页的在home.js处理)
  // 所以这里不需要再判断attrs字段的15855616，直接判断枚举值即可
  isOnLine = data.deviceStateEnum && data.deviceStateEnum === "online";
  console.log(isOnLine,'isOnLineisOnLine')
  onLineValue = data.deviceStateEnum === "online" ? 1 : data.deviceStateEnum === "offline" ? 0 : data.deviceStateEnum === "offNetwork" ? 4 : data.deviceStateEnum === "binding" ? 7 : 0;

  if (data.airConditioning) {
    airConditionChildModeMinTemperature = data.airConditioning.childModeMinTemperature / 10;
  }

  let result = {
    // 颜色模式， color:使用色盘颜色，temprature：使用色温颜色
    lightMode,
    // true or false
    isLightOn,
    // 1:在线，0： 离线
    isOnLine,
    // 0,1,4,7
    onLineValue,
    // 亮度值
    degree,
    curtaindegree,
    // 色温值
    temprature: curTemprature,
    //  true or false
    isChildMode,
    // 色温在色温盘的idx
    tempratureIdx: curTempratureIdx,
    // 颜色灯的xy值
    xyColor,
    airConditionTemprature,
    airConditionTempratureMax,
    airConditionTempratureMin,
    airConditionTempratureMode,
    airConditionWindSpeed,
    airConditionChildModeMinTemperature,
    homeTemprature,
    curtainPercent,
    measureTemprature, // 新风机等的温度测量值
    measureHumidity, // 新风机等的湿度测量值
    pm25Value, // pm2.5测量值
    co2Value, // pm2.5测量值
    vocValue, // voc值
    timerDuration, // 新风机等的定时器倒计时
    timerStatus, // 新风机等的定时器状态
    airFresherMode, // 新风机工作模式 0：手动 1：自动 2： 睡眠
    isEffectLight,
    electronicTotal,
    MFCMode,
    electrifyStatus,
    lightOnStatus,
    onOffSwithDeviceStatus,
    sensorPowerValue,
    lightOnStep,
    lightOffStep,
    lightHues,
    lightSaturation,
    doorLockStatus,
    doorLockElectric,
    doorAutoLockTime,
    doorAutoLockStatus,
    doorOprateStatus,
    curtainMaxMinPoints,
    curtainRunWay,
    curtainAngleGear,
    motorStrength,
    brightnessCurveValue,
    brightnessWayValue
  };
  // todo 删除
  let txt = "name: " + data.deviceName + " | ";
  for (let item in result) {
    if (result[item] !== null) {
      txt += item + ": " + result[item] + " | ";
    }
  }
  console.log(txt);
  return result;
};

export const isNumber = number => typeof number === "number" && !isNaN(number);
export const isBoolean = boolean => typeof boolean === "boolean";
/**
 * 合并mqtt消息
 * @param {*} newV
 */

export const mergeMQTTData = newV => {
  const attrs = newV.reduce((acc, item) => {
    acc.push(...item.attrs);
    return acc;
  }, []);
  const res = newV.reduce((acc, item) => {
    return { ...acc, ...item };
  });
  res.attrs = attrs;
  return res;
};
