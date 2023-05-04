<template>
  <div class="scenes-list stopTouchEvent stopMoveArea" @touchmove.stop v-show="list && list.length">
    <div class="list-wrap">
      <div class="item home-scene-item-canvas-wrap" :style="{ 'background-image': `url(${item.sceneIconAbs || bg})` }" v-for="(item, idx) of list" :key="idx" @click="clickScene(idx, item)">
        <p class="name">{{ item.sceneName || item.name }}</p>
        <canvas class="loading-cavas home-scene-item-canvas" :width="canvas.width" :height="canvas.height"></canvas>
      </div>
    </div>
  </div>
</template>
<script>
import bg from "../../../assets/images/scene_bg.png";
import { mostUseScenesRep, execSceneRep } from "../../../api/request";
export default {
  name: "scenes-list",
  data() {
    return {
      bg: bg,
      list: [],
      dpr: 2,
      canvas: {
        width: 0,
        height: 0,
      },
      canvasInstance: null,
      angle: 0,
      duration: 2000,
      drawGapTime: 16.7,
      renderId: null,
      canvasTarget: {},
    };
  },
  methods: {
    clickScene(idx, item) {
      if (this.canvasTarget[idx] && this.canvasTarget[idx].angle < 360) {
        return;
      }
      this.handleExecScene(item);
      const canvas = document.querySelectorAll(".home-scene-item-canvas")[idx];
      let canvasInstance = canvas.getContext("2d");
      this.canvasTarget[idx] = {
        canvasInstance: canvasInstance,
        angle: 0,
        renderId: null,
      };
      this.canvasTarget[idx].canvasInstance.width = this.canvas.width;
      this.canvasTarget[idx].canvasInstance.height = this.canvas.height;
      this.onRoll(idx);
    },
    initRect() {
      const nodes = document.querySelectorAll(".home-scene-item-canvas-wrap");
      if (!nodes || !nodes.length) return;
      const rect = nodes[0].getBoundingClientRect();
      this.canvas.width = rect.width * this.dpr;
      this.canvas.height = rect.height * this.dpr;
    },
    drawCicle(idx) {
      let ctx = this.canvasTarget[idx].canvasInstance;
      ctx.clearRect(0, 0, ctx.width, ctx.height);
      ctx.beginPath();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3 * this.dpr;
      ctx.lineCap = "round";
      const radius = 20 * this.dpr;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, ctx.width, ctx.height);
      ctx.arc(ctx.width / 2, ctx.height / 2, radius, -Math.PI / 2, ((Math.PI * 2) / 360) * (this.canvasTarget[idx].angle - 90));
      ctx.stroke();
      ctx.closePath();
    },
    onRoll(idx) {
      let duration = !this.duration || this.duration <= 0 ? 2000 : this.duration;
      this.canvasTarget[idx].drawRad = 360 / (duration / this.drawGapTime);
      this.canvasTarget[idx].canvasInstance && this.drawCicle(idx);
      const renderLoop = () => {
        this.canvasTarget[idx].angle = this.canvasTarget[idx].angle + this.canvasTarget[idx].drawRad;
        if (this.canvasTarget[idx].angle > 360) {
          this.canvasTarget[idx].canvasInstance.clearRect(0, 0, this.canvasTarget[idx].canvasInstance.width, this.canvasTarget[idx].canvasInstance.height);
          this.canvasTarget[idx].angle = 0;
          this.canvasTarget[idx].renderId && window.cancelAnimationFrame(this.canvasTarget[idx].renderId);
          this.canvasTarget[idx] = null;
          return;
        }
        this.drawCicle(idx);
        this.canvasTarget[idx].renderId = window.requestAnimationFrame(renderLoop);
      };
      renderLoop();
    },
    async getData(isReload = false) {
      let { data, error } = await mostUseScenesRep();
      if (data && !error) {
        this.list = data.data;
        this.$nextTick(() => {
          this.initRect();
        });
      }
      this.$emit("loadDataDone", (data && data.data && data.data.length) || 0, isReload);
    },
    async handleExecScene(item) {
      let result = await execSceneRep({ sceneId: item.sceneId || item.id });
    },
  },
  created() {
    this.dpr = window.devicePixelRatio;
    this.getData();
  },
};
</script>
<style lang="less" scoped>
.scenes-list {
  width: 100%;
  height: 180px;
  overflow-y: hidden;
  .list-wrap {
    height: 240px;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    .item {
      display: inline-block;
      height: 180px;
      width: 280px;
      background: #fff;
      margin-left: 36px;
      border-radius: 20px;
      background-size: cover;
      position: relative;
      overflow: hidden;
      &::after {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.1);
        z-index: 1;
        content: "";
      }
      &:last-child {
        margin-right: 36px;
      }
      .loading-cavas {
        position: relative;
        border-radius: 20px;
        z-index: 2;
      }
      .home-scene-item-canvas {
        height: 180px;
        width: 280px;
      }
      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 52px;
        line-height: 52px;
        font-size: 28px;
        font-weight: 400;
        color: #ffffff;
        box-sizing: border-box;
        padding: 0 24px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-x: hidden;
        text-align: center;
        z-index: 1;
        &::after {
          position: absolute;
          left: 0;
          bottom: 0;
          right: 0;
          height: 64px;
          content: "";
          z-index: -1;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
        }
      }
    }
  }
}
</style>
