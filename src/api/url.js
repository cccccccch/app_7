const loginUrl = "/openapi/uums/user/login";
const deviceDetailUrl = "/openapi/deviceJson/deviceDetail"; // 设备详情
const deviceDetailRc01 = "/openapi/appMsgJson/appMsgConfigQuerybyDevice"; // Rc01设备勿扰模式查询
const UpdateByDeviceRc01 = "/openapi/appMsgJson/appMsgConfigUpdateByDevice"; // Rc01设备状态修改
const appMsgTypeTreeRc01 = "/openapi/appMsgJson/appMsgTypeTreeByDevice"; // Rc01设备状态树
const modeListUrl = "/openapi/deviceJson/colorLight/modeList"; // 灯光模式列表
const lightModeChangeUrl = "/openapi/deviceJson/endpointOperateLightMode"; // 修改模式
const endpointControlUrl = "/openapi/deviceJson/endpointOperateZigbeeZcl"; // 下发设备控制指令
const sceneListUrl = "/openapi/sceneJson/sceneListByCondition"; // 按条件查询情景列表,仅返回APP创建的情景
const bindSceneUrl = "/openapi/sceneJson/sceneEndpointBindSceneId"; // 绑定情景
const execSceneUrl = "/openapi/sceneJson/appOperate/"; // 情景面板、TP玻璃面板执行情景
const deviceInfoUpdUrl = "/openapi/deviceJson/deviceUpd"; // 设备信息更改
const deviceDelUrl = "/openapi/deviceJson/deviceDel"; // 删除设备
const addUsuallyUrl = "/openapi/infoMostUsedJson/infoMostUsedAdd"; // 添加到常用
const removeUsuallyUrl = "/openapi/infoMostUsedJson/infoMostUsedRemove"; // 移除常用设备
const deviceRoomListUrl = "/openapi/room/list"; // 设备的房间列表
const updDeviceRoomUrl = "/openapi/deviceJson/v2/goalDeviceRoomUpd"; // 更新单个设备所属房间
const groupDeviceListUrl = "/openapi/deviceJson/deviceListOfLogicGroup"; // 查询编组包含的设备信息
const weatherV7Url = "/openapi/weather/weather_v7"; // 获取天气接口
const mostUseScenesUrl = "/openapi/index/usefull-scene"; // 获取首页常用情景
const homeRoomListUrl = "/openapi/family2Json/defaultAreaRoomList"; // 获取首页房间列表
const mostUsedDeviceUrl = "/openapi/index/usefull-device"; // 获取常用设备
const roomDeviceUrl = "/openapi/deviceJson/device/page-list"; // 获取房间下的设备列表
const deviceHasScenesUrl = "/openapi/sceneJson/sceneListByEndpointId"; // 获取设备所在的场景列表
const deviceCategoryUrl = "/openapi/productCategory/productCategoryListExsitFamily"; // 查询设备分组列表(当前默认家庭已经存在的设备的分组)
const setTimeCloseUrl = "/openapi/deviceJson/endpointOperateAirConditioningTimedClose"; // 终端控制endpoint-空调定时关机控制
const removeTimeCloseUrl = "/openapi/deviceJson/deleteAirConditioningTimedClose"; // 删除空调定时关机
const familyAndAreaListUrl = "/openapi/family2Json/familyAndAreaList"; // 获取家庭和区域
const scheduleTaskListUrl = "/openapi/device/schedule/task/list"; // 获取设备定时任务
const scheduleTaskAddUrl = "/openapi/device/schedule/task/add"; // 添加设备定时任务
const scheduleTaskDelUrl = "/openapi/device/schedule/task/del/"; // 删除设备定时任务
const scheduleTaskEnableUrl = "/openapi/device/schedule/task/enable/"; // 启用定时任务
const scheduleTaskUpdateUrl = "/openapi/device/schedule/task/update/"; // 修改定时任务
const scheduleTaskDisabledUrl = "/openapi/device/schedule/task/disable/"; // disable设备定时任务
const effectLightEnableUrl = "/openapi/deviceJson/effect-light/enable"; // 启用插座勿扰模式  是否启用:yes-启用,no-禁用
const effectLightUpdateUrl = "/openapi/deviceJson/effect-light/update"; // 修改效果灯勿扰效果
const electricReportStatisticsUrl = "/openapi/device/electric/report/statistics"; // 插座电量查询
const gatewayDeviceSetReadUrl = "/openapi/deviceJson/deviceSetRead"; // 新设备已读、网关已读
const appMsgUnreadCountUrl = "/openapi/appMsgJson/appMsgUnreadCount"; // 未读消息
const onDeviceClickUrl = "/openapi/deviceJson/onDeviceClick"; // 点击设备，无论是点击 开关 或者是情景 或者开关转情景
const roomEnvironmentInfoUrl = "/openapi/roomJson/roomEnvironmentInfo"; // 房间对应的温湿度等信息
const deviceBindSceneSwitchUrl = "/openapi/deviceJson/chooseSwitchScene"; // 开关灯等设备打开或关闭关联场景功能
const lockLogUrl = "/openapi/lock/lockLogList"; // 门锁日志
const lockKeyAddUrl = "/openapi/lock/lockKeyAdd"; // 添加门锁钥匙
const memberListUrl = "/openapi/familyJson/familyUserList"; // 查询默认家庭成员列表
const queryKeyExistUrl = "/openapi/lock/lockKeyExistCount"; // 查询密码是否已存在
const checkDoorLockPswUrl = "/openapi/lock/commPwdInput"; // 输入密码确认
const lockKeyListUrl = "/openapi/lock/lockKeyList"; // 门锁key列表(数字、指纹、门卡)
const lockKeyDetailUrl = "/openapi/lock/lockKeyDetail"; // 门锁key详情
const lockKeyActiveUrl = "/openapi/lock/lockKeyActive"; // 重新激活钥匙
const verifyDoorPswUrl = "/openapi/lock/commPwdCheck"; // 验证密码缓存，如果存在且合法，则不用输入密码 返回值true：要输入，false:不用输入
const doorControlUrl = "/openapi/lock/zigbeeLockEndpointOperation"; // 门锁操作指令下发
const lockKeyUpdUrl = "/openapi/lock/lockKeyUpd"; // 门锁钥匙更新（解绑）
const removeLockLogUrl = "/openapi/lock/lockLogDel"; // 门锁日志清除
const delLockKeyUrl = "/openapi/lock/lockKeyDel"; // 删除指纹
const curtainBindTypeUrl = "/openapi/device/bind/relation/saveOrUpdateSlotIndex"; // 通过设备槽位绑定关系保存或更新（仅支持卷帘外设）
const deviceTypesListUrl = "/openapi/deviceTypeJson/external/category/deviceTypes"; // 根据外设类别查询设备类型列表
const deviceCateListByIdUrl = "/openapi/product/external/category/list"; // 根据产品ID获取关联的外部设备类别集合
const checkIfGrouped = "/openapi/deviceJson/checkIfGrouped"; // 查询设备是否被分组

//ss10
const deviceAttribute = "/openapi/deviceAttributeValue/deviceAttributeCalibrationValue"; //
const ValueGrade = "/openapi/deviceAttributeValue/deviceAttributeValueGrade"; // 
const deviceAttributeValueHistory = "/openapi/deviceAttributeValue/deviceAttributeValueHistory"; // 
const deviceListUrl = "/openapi/deviceJson/deviceList"; // 窗帘
const deviceListlightUrl = "/openapi/deviceJson/deviceListOfLevelSupport"; // 灯组
const BindDeviceUrl = "/openapi/sceneScreenJson/indexBindDevice"; // 灯组
const indexBindSceneUrl = '/openapi/sceneScreenJson/indexBindScene';
const bindDeviceKxUrl = '/openapi/deviceJson/bindDeviceKx';
const  slidingUrl= '/openapi/deviceJson/sliding';//滑动控制功能- 亮度渐变 色温渐变
const  slidingEnableUrl= '/openapi/deviceJson/slidingEnable';////滑动控制功能-配置 未配置
const  setDeviceAttrUrl= '/openapi/deviceJson/setDeviceAttr';
const  slotConfigUrl= '/openapi/deviceSlot/slotConfig';

export {
  setDeviceAttrUrl,
  slidingEnableUrl,
  slidingUrl,
  bindDeviceKxUrl,
  indexBindSceneUrl,
  BindDeviceUrl,
  deviceListUrl,
  deviceListlightUrl,
  deviceAttribute,
  ValueGrade,
  deviceAttributeValueHistory,
  deviceHasScenesUrl,
  deviceCategoryUrl,
  roomDeviceUrl,
  mostUsedDeviceUrl,
  homeRoomListUrl,
  mostUseScenesUrl,
  weatherV7Url,
  groupDeviceListUrl,
  loginUrl,
  deviceDetailUrl,
  deviceDetailRc01,
  modeListUrl,
  lightModeChangeUrl,
  endpointControlUrl,
  sceneListUrl,
  bindSceneUrl,
  execSceneUrl,
  deviceInfoUpdUrl,
  deviceDelUrl,
  addUsuallyUrl,
  removeUsuallyUrl,
  deviceRoomListUrl,
  updDeviceRoomUrl,
  setTimeCloseUrl,
  removeTimeCloseUrl,
  familyAndAreaListUrl,
  scheduleTaskListUrl,
  scheduleTaskAddUrl,
  scheduleTaskDelUrl,
  scheduleTaskEnableUrl,
  scheduleTaskUpdateUrl, 
  scheduleTaskDisabledUrl,
  effectLightEnableUrl,
  effectLightUpdateUrl,
  electricReportStatisticsUrl,
  gatewayDeviceSetReadUrl,
  appMsgUnreadCountUrl,
  onDeviceClickUrl,
  roomEnvironmentInfoUrl,
  deviceBindSceneSwitchUrl,
  lockLogUrl,
  lockKeyAddUrl,
  memberListUrl,
  queryKeyExistUrl,
  checkDoorLockPswUrl,
  lockKeyListUrl,
  lockKeyDetailUrl,
  verifyDoorPswUrl,
  doorControlUrl,
  lockKeyUpdUrl,
  removeLockLogUrl,
  delLockKeyUrl,
  curtainBindTypeUrl,
  deviceTypesListUrl,
  deviceCateListByIdUrl,
  lockKeyActiveUrl,
  checkIfGrouped,
  UpdateByDeviceRc01,
  appMsgTypeTreeRc01,
  slotConfigUrl,
};
