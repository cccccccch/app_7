import http from "./http";
import { host } from "../api/config";
import {
  deviceHasScenesUrl,
  deviceCategoryUrl,
  roomDeviceUrl,
  mostUsedDeviceUrl,
  homeRoomListUrl,
  mostUseScenesUrl,
  weatherV7Url,
  groupDeviceListUrl,
  updDeviceRoomUrl,
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
  deviceAttribute,
  ValueGrade,
  deviceAttributeValueHistory,
  deviceListUrl,
  deviceListlightUrl,
  BindDeviceUrl,
  indexBindSceneUrl,
  bindDeviceKxUrl,
  slidingUrl,
  slidingEnableUrl,
  setDeviceAttrUrl,
  slotConfigUrl,

} from "./url";
//post/put... {url, params, query}
//get {url, query}
const deviceDetailRep = params => http.get(deviceDetailUrl, { params });
const deviceListRep = params => http.get(deviceListUrl, { params });
const deviceListlightRep = params => http.get(deviceListlightUrl, { params });
const BindDeviceRep = params => http.put(BindDeviceUrl + `?deviceIndex=${params.deviceIndex}&sourceDataId=${params.sourceDataId}&targetDataId=${params.targetDataId}&sourceDataTypeEnum=${params.sourceDataTypeEnum}&targetDataTypeEnum=${params.targetDataTypeEnum}`);
const deviceDetailRc01Rep = params => http.get(deviceDetailRc01, { params });
const appMsgTypeTreeRc01Rep = params => http.get(appMsgTypeTreeRc01, { params });
const modeListRep = params => http.get(modeListUrl, { params });
const lightModeChangeRep = params => http.post(lightModeChangeUrl, null, { params });
const endpointControlRep = params => http.post(endpointControlUrl, null, { params });
const sceneListRep = params => http.get(sceneListUrl, { params });
const bindSceneRep = params => http.put(bindSceneUrl, null, { params });
const indexBindSceneRep = params => http.put(indexBindSceneUrl, null, { params });

const slidingEnableRep = params => http.put(slidingEnableUrl, null, { params });
const slidingRep = params => http.put(slidingUrl, null, { params });
const execSceneRep = params => http.post(execSceneUrl + params.sceneId);
const deviceInfoUpdRep = params => http.put(deviceInfoUpdUrl, params);
const deviceDelRep = params => http.post(deviceDelUrl, params);
const addUsuallyRep = params => http.post(addUsuallyUrl, params);
const removeUsuallyRep = params => http.put(removeUsuallyUrl, params);
const roomListRep = (params, query) => http.post(deviceRoomListUrl, params, query);
const updDeviceRoomRep = params => http.put(updDeviceRoomUrl, params);
const groupDeviceListRep = params => http.get(groupDeviceListUrl, { params });
const weatherRep = params => http.get(weatherV7Url, { params });
const mostUseScenesRep = params => http.get(mostUseScenesUrl, { params });
const homeRoomListRep = params => http.get(homeRoomListUrl, { params });
const mostUsedDeviceRep = params => http.get(mostUsedDeviceUrl, { params });
const roomDeviceRep = params => http.get(roomDeviceUrl, { params });
const deviceCategoryRep = params => http.get(deviceCategoryUrl, { params });
const deviceHasScenesRep = params => http.get(deviceHasScenesUrl, { params });
const deviceSetTimeCloseRep = params => http.post(setTimeCloseUrl, params, { params });
const deviceRemoveTimeCloseRep = params => http.post(removeTimeCloseUrl, params, { params });
const familyAndAreaListRep = () => http.get(familyAndAreaListUrl);
const getDeviceScheduleTaskListRep = params => http.get(scheduleTaskListUrl, { params });
const CreateDeviceScheduleTaskRep = params => http.post(scheduleTaskAddUrl, params, { params });
const DeleteDeviceScheduleTaskRep = params => http.delete(scheduleTaskDelUrl+ params.id, params, { params });
const EnableDeviceScheduleTaskRep = params => http.put(scheduleTaskEnableUrl+ params.id, params, { params });
const UpdateDeviceScheduleTaskRep = params => http.put(scheduleTaskUpdateUrl + params.id, params, { params });  
const DisabledDeviceScheduleTaskRep = params => http.put(scheduleTaskDisabledUrl + params.id, params);
const EnableEffectLightRep = params => http.put(effectLightEnableUrl, params, { params });
const UpdateEffectLightRep = params => http.put(effectLightUpdateUrl, params, { params });
const ElectricReportStatisticsRep = params => http.get(electricReportStatisticsUrl, { params });
const gatewayDeviceSetReadRep = params => http.put(gatewayDeviceSetReadUrl, null, { params });
const appMsgUnreadCountRep = params => http.get(appMsgUnreadCountUrl, params);
const onDeviceClickRep = params => http.post(onDeviceClickUrl, null, { params });
const roomEnvironmentInfoReq = params => http.get(roomEnvironmentInfoUrl, { params });
const deviceBindSceneSwitchReq = params => http.post(deviceBindSceneSwitchUrl, null, { params });
const lockLogReq = params => http.get(lockLogUrl, { params });
const memberListReq = params => http.get(memberListUrl, { params });
const lockKeyAddReq = params => http.post(lockKeyAddUrl, params);
const queryKeyExistReq = params => http.get(queryKeyExistUrl, { params });
const checkDoorLockPswReq = params => http.put(checkDoorLockPswUrl, null, params);
const lockKeyListReq = params => http.get(lockKeyListUrl, { params });
const lockKeyDetailReq = params => http.get(lockKeyDetailUrl, { params });
const verifyDoorPswReq = params => http.get(verifyDoorPswUrl, { params });
const doorControlReq = params => http.put(doorControlUrl, null, { params });

const bindDeviceKxReq = params => http.put(bindDeviceKxUrl, null, { params });
const lockKeyUpdReq = params => http.post(lockKeyUpdUrl, params);
const removeLockLogReq = params => http.put(removeLockLogUrl, null, { params });
const delLockKeyReq = params => http.put(delLockKeyUrl, null, { params });
const lockKeyActiveReq = params => http.post(lockKeyActiveUrl, null, { params });
const curtainBindTypeReq = params => http.post(curtainBindTypeUrl, params);
const UpdateByDeviceRc01Req = params => http.post(UpdateByDeviceRc01 + `?deviceMac=${params.deviceMac}&ifEnableEnum=${params.ifEnableEnum}&appMsgTypeCode=${params.appMsgTypeCode}`);
const deviceTypesListReq = params => http.get(deviceTypesListUrl, { params });
const deviceCateListByIdReq = params => http.get(deviceCateListByIdUrl, { params });
const checkIfGroupedReq = params => http.get(checkIfGrouped, { params });

const deviceAttributeReq = params => http.get(deviceAttribute, { params });
const ValueGradeReq = params => http.get(ValueGrade, { params });
const deviceAttributeValueHistoryReq = params => http.get(deviceAttributeValueHistory, { params });
const setDeviceAttrUrlReq = params => http.put(setDeviceAttrUrl, null, { params });
const slotConfigUrlReq = params => http.put(slotConfigUrl, null,{ params });

export {
  setDeviceAttrUrlReq,
  slidingEnableRep,
  slidingRep,
  indexBindSceneRep,
  deviceAttributeReq,
  deviceListlightRep,
  ValueGradeReq,
  deviceAttributeValueHistoryReq,
  deviceHasScenesRep,
  deviceCategoryRep,
  roomDeviceRep,
  mostUsedDeviceRep,
  homeRoomListRep,
  mostUseScenesRep,
  weatherRep,
  groupDeviceListRep,
  updDeviceRoomRep,
  deviceDetailRep,
  deviceDetailRc01Rep,
  modeListRep,
  lightModeChangeRep,
  endpointControlRep,
  sceneListRep,
  bindSceneRep,
  execSceneRep,
  deviceInfoUpdRep,
  deviceDelRep,
  addUsuallyRep,
  removeUsuallyRep,
  roomListRep,
  deviceRemoveTimeCloseRep,
  deviceSetTimeCloseRep,
  familyAndAreaListRep,
  getDeviceScheduleTaskListRep,
  CreateDeviceScheduleTaskRep,
  DeleteDeviceScheduleTaskRep,
  EnableDeviceScheduleTaskRep,
  UpdateDeviceScheduleTaskRep, 
  DisabledDeviceScheduleTaskRep,
  EnableEffectLightRep,
  UpdateEffectLightRep,
  ElectricReportStatisticsRep,
  gatewayDeviceSetReadRep,
  appMsgUnreadCountRep,
  onDeviceClickRep,
  roomEnvironmentInfoReq,
  deviceBindSceneSwitchReq,
  lockLogReq,
  lockKeyAddReq,
  memberListReq,
  queryKeyExistReq,
  checkDoorLockPswReq,
  lockKeyListReq,
  lockKeyDetailReq,
  verifyDoorPswReq,
  doorControlReq,
  lockKeyUpdReq,
  removeLockLogReq,
  delLockKeyReq,
  curtainBindTypeReq,
  deviceTypesListReq,
  deviceCateListByIdReq,
  lockKeyActiveReq,
  checkIfGroupedReq,
  UpdateByDeviceRc01Req,
  appMsgTypeTreeRc01Rep,
  deviceListRep,
  BindDeviceRep,
  bindDeviceKxReq,
  slotConfigUrlReq,
};
