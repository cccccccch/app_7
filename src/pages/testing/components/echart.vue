<template>
  <div style="width: 100%; height: 350px" id="main"></div>
</template>

<script>
export default {
  name: "page",
  mounted() {
    console.log("join-------------------------");
    // 在通过mounted调用即可
    this.echartsInit();
  },
  methods: {
    //初始化echarts
    echartsInit() {
      //柱形图
      //因为初始化echarts 的时候，需要指定的容器 id='main'
      this.$echarts.init(document.getElementById("main")).setOption({
          grid:{
              y:10,
              x:30,
              right:10,
              bpttom:0,
          },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: "line",
            areaStyle: {},
          },
        ],
      });
    },
  },
};
</script>

<style>
</style>