import { execNativeFunc } from '../../../utils/bridge'
import { mapGetters, mapMutations } from "vuex";
export default {
    data() {
        return {
            isOnLine: false, // 设备在线/离线
            isLightOn: false, // 设备开启/关闭
        }
    },
    created() {
        if (!window.WINGTO_H5) {
            window.WINGTO_H5 = {}
        }
        window.WINGTO_H5.onH5Back = this.__onNativeTriggeBack
    },
    methods: {
        __onNativeTriggeBack() {
            if (this.$route.name !== 'shadowKtv') {
                this.$router.back()
            } else {
                execNativeFunc("onNavigateTo", { type: 0 });
            }
        }
    },
    computed: {
        ...mapGetters([
            "globalDeviceType",
            "globalData",
            "globalDataId",
            "globalDeviceStatus",
            "deviceDetail"
        ]),
    },
    watch: {
        deviceDetail() {
            if (this.deviceDetail.deviceStateEnum !== "online") {
                this.isLightOn = false;
                this.isOnLine = false;
            } else {
                this.isLightOn = true;
                this.isOnLine = true;
            }
        }
    }
}