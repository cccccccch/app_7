const store = {
    state: {
        deviceDetail: {},
        curEndpointId: '',
        execTips: {
            isInit: false,
            text: ["点击即可配置智能"]
        }
    },
    mutations: {
        setcurEndpointId(state, id) {
            state.curEndpointId = id
        },
        setExecTips(state, payload) {// text字段是一个数组， text的内容是直接覆盖
            if (state.execTips.isInit && payload.isInit) return; // 已经初始化过了就不再初始化
            if (payload.isInit) {
                state.execTips.isInit = payload.isInit
                if (payload.text && payload.text.length) {
                    state.execTips.text = payload.text
                }
            } else {
                if (payload.text && payload.text.length) {
                    state.execTips.text = payload.text
                }
            }
        }
    },
    actions: {},
    getters: {
        curEndpointId: state => state.curEndpointId,
        execTips: state => state.execTips.text
    }
}

export default store