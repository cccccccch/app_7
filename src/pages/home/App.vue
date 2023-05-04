<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import globalMixins from "../../mixins/index";
export default {
  name: "App",
  mixins: [globalMixins],
};
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
</style>
