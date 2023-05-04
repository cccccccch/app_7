/*
 * @Author: Dywade
 * @Date: 2021-12-10 09:51:53
 * @LastEditTime: 2022-01-12 17:09:40
 * @LastEditors: Dywade
 * @Description:
 */
const store = {
  state: {
    passwordForOpen: "",
    addNormalDoorKeyData: null, // 设置新增永久密码参数，用于不同路由切换保存参数，当切换回新增密码页的时候记得清空
    isAddKeySuccess: false, // 是否新增密码成功，用于返回门锁页弹出toast
    isChangeLinkUser: false, // 是否变更了关联用户，用于从密码详情页返回授权管理指纹列表数据更新(删除或换绑)
    isLockAdmin: false, // 是否是管理员
    doorAutoLockTime: 11,
    doorBlockSeconds: -2, // 门锁试错超过5次倒计时
    doorErrorTimes: 0, // 门锁当前已经错误次数
    doorErrorEndTime: 0, // 门锁错误计时器终止时间，当试错第一次时服务器开始计时,这里保存计算后的时间戳
  },
  mutations: {
    setPasswordForOpen(state, value) {
      state.passwordForOpen = value;
    },
    setNormalDoorKeyData(state, data) {
      state.addNormalDoorKeyData = data;
    },
    setCreateDoorKeyResult(state, value) {
      state.isAddKeySuccess = value;
    },
    setChangeLinkUser(state, value) {
      state.isChangeLinkUser = value;
    },
    setLockAdmin(state, value) {
      state.isLockAdmin = value;
    },
    setDoorAutoLockTime(state, value) {
      state.doorAutoLockTime = value;
    },
    setDoorBlockSeconds(state, value) {
      value = Number(value);
      if (typeof value !== "number" || isNaN(value)) {
        value = 0;
      }
      state.doorBlockSeconds = value;
    },
    setDoorErrorTimes(state, value) {
      state.doorErrorTimes = value
    },
    setDoorErrorEndTime(state, value) {
      state.doorErrorEndTime = value
    }
  },
  getters: {
    passwordForOpen: state => state.passwordForOpen,
    addNormalDoorKeyData: state => state.addNormalDoorKeyData,
    isAddDoorKeySuccess: state => state.isAddKeySuccess,
    getChangeLinkUser: state => state.isChangeLinkUser,
    getLockAdmin: state => state.isLockAdmin,
    getDoorAutoLockTime: state => state.doorAutoLockTime,
    getDoorBlockSeconds: state => state.doorBlockSeconds,
    getDoorErrorTimes: state => state.doorErrorTimes,
    getDoorErrorEndTime: state => state.doorErrorEndTime,
  }
};

export default store;
