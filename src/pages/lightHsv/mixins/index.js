import { execNativeFunc } from "../../../utils/bridge";
export default {
  created() {
    if (!window.WINGTO_H5) {
      window.WINGTO_H5 = {};
    }
    window.WINGTO_H5.onH5Back = this.__onNativeTriggeBack;
  },
  methods: {
    __onNativeTriggeBack() {
      if (this.$route.name !== "LightHsv") {
        this.$router.back();
      } else {
        execNativeFunc("onNavigateTo", { type: 0 });
      }
    },
  },
};
