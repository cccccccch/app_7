<template>
  <div>
    <canvas
      id="socketCanvas"
      ref="socketCvs"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend.prevent="onTouchEnd"
    ></canvas>
  </div>
</template>
<script>
export default {
  name: "Socket-Chart",
  props: {
    data: {
      total: [],
      device: [],
    },
    dateType: {
      type: String,
      default: 'year',
    },
    date: {
      type: Number,
      default: Date.now(),
    }, 
  },
  data() {
    return {
      canvas: "",
      ctx: "",
      canvasHeight: 2,
      canvasWidth: 2,
      dpr: 2,
      spaceWidth: 0,
      lineWidth: 0,
      offsetX: 0,
      rect: {},
      idx: 0
    };
  },
  watch: { 
    dateType() {
      this.draw()
    }
  },
  methods: {
    transformDPR(value) {
      const dpr = window.devicePixelRatio;
      return ((dpr * value) / 750) * window.screen.width;
    },
    isNumber(num){
      return typeof num === 'number'
    },
    getCanvasTotalDataList(){ 
      const spaceWidth = this.spaceWidth  
      const lineWidth = spaceWidth * 1.5; // 画笔宽度 
      const maxValue = Math.max(...this.data.total) || 1
      const ratio = this.canvasHeight / maxValue
      const ys = this.data.total.map((item, index) => {
        return {
          x: index * (spaceWidth + lineWidth) + lineWidth / 2,
          y: this.canvasHeight - item * ratio, 
          value: item
        };
      }); 
      return ys
    }, 
    getCanvasDeviceDataList(){ 
      const spaceWidth = this.spaceWidth  
      const lineWidth = spaceWidth * 1.5; // 画笔宽度 
      const maxValue = Math.max(...this.data.total) || 1
      const ratio = this.canvasHeight / maxValue
      const ys = this.data.device.map((item, index) => {
        return {
          x: index * (spaceWidth + lineWidth) + lineWidth / 2,
          y: this.canvasHeight - item * ratio, 
          value: item
        };
      }); 
      return ys
    },

    drawDotted(lineCount = 5) { 
      const max = Math.max(...this.data.total) 
      // lineCount = Math.ceil(max / 100) || 5
      lineCount = 5
      const ctx = this.ctx;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#979797";
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      for (let i = 0; i < lineCount; i++) {
        const height = Math.floor((this.canvasHeight / lineCount) * i);
        ctx.moveTo(0, height + 1);
        ctx.lineTo(this.canvasWidth, height + 1);
      }
      ctx.stroke();
      ctx.setLineDash([0]);
      ctx.closePath();
    },
    // 柱状图
    drawPillar(idx) { 
      const ctx = this.ctx;
      const ys = this.getCanvasTotalDataList()
      ctx.lineWidth = this.lineWidth;
      const grd = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      grd.addColorStop(0, "#7377C4");
      grd.addColorStop(1, "#EFF0FF");
      ctx.setLineDash([]); 
      // ctx.getLineDash
      ys.forEach((item, index) => {
        if(idx === index) {
          ctx.strokeStyle = '#7377C4';
        }else{
          ctx.strokeStyle = grd;
        }
        ctx.beginPath();
        ctx.moveTo(item.x, this.canvasHeight);
        ctx.lineTo(item.x, item.y);
        ctx.stroke();
        ctx.closePath();
      }) 
      
    },
    // 折线
    drawPolyline() { 
      const ctx = this.ctx; 
      const ys = this.getCanvasDeviceDataList()
      ctx.lineWidth = 5;
      ctx.setLineDash([0, 0]);
      ctx.beginPath();
      ctx.moveTo(0, ys[0].y);
      ctx.lineTo(ys[0].x, ys[0].y);
      ctx.strokeStyle = "#7377C4";
      const unitX = (this.lineWidth + this.spaceWidth) / 3 
      for (let i = 1; i < ys.length; i++) {
        const item = ys[i];
        const x_half = (ys[i - 1].x + item.x) / 2;
        const x1 = (ys[i - 1].x + x_half) / 2;
        const x2 = (item.x + x_half) / 2;
        ctx.bezierCurveTo(x1, ys[i - 1].y, x2, item.y, item.x, item.y);
      }
      ctx.lineTo(this.canvasWidth, ys[this.data.device.length - 1].y);
      ctx.stroke();
      ctx.closePath(); 
    },
    drawPoint(idx) {
       if(!this.isNumber(this.data.device[idx]))return 
      const ctx = this.ctx;  
      const ys = this.getCanvasDeviceDataList()
      const pointRadius = length > 12 ? this.lineWidth * 0.3 :  this.lineWidth * 0.2 
      ctx.lineWidth = 2 * this.dpr;
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#7377C4"; //设置填充颜色
      ctx.beginPath(); 
      ctx.arc(ys[idx].x, ys[idx].y, pointRadius - 1, 0, 2 * Math.PI); // 
      ctx.fill(); //开始填充
      ctx.stroke();
      ctx.closePath();
    },

    drawMask() { 
      const ctx = this.ctx; 
      const ys = this.getCanvasDeviceDataList()
      ys.unshift({
        x: 0,
        y: ys[0].y,
      });
      ys.unshift({
        x: 0,
        y: this.canvasHeight,
      });
      ys.push({
        x: this.canvasWidth + this.lineWidth / 2,
        y: ys[ys.length - 1].y,
      });
      ys.push({
        x: this.canvasWidth,
        y: this.canvasHeight,
      }); 
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ys[0].x, ys[0].y);
      ctx.lineTo(ys[1].x, ys[1].y);
      ctx.lineTo(ys[2].x, ys[2].y);
      const grd = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      grd.addColorStop(0, "#FFFFFF50");
      grd.addColorStop(1, "#7377C450");
      ctx.fillStyle = grd; //设置填充颜色
      for (let i = 3; i < ys.length - 2; i++) {
        const item = ys[i];
        const x_half = (ys[i - 1].x + item.x) / 2;
        const x1 = (ys[i - 1].x + x_half) / 2;
        const x2 = (item.x + x_half) / 2;
        ctx.bezierCurveTo(x1, ys[i - 1].y, x2, item.y, item.x, item.y);
      }
      ctx.lineTo(ys[ys.length - 2].x, ys[ys.length - 2].y);
      ctx.lineTo(ys[ys.length - 1].x, ys[ys.length - 1].y);
      ctx.lineTo(ys[0].x, ys[0].y);
      ctx.fill();
      ctx.closePath();
    },
    drawTextBox(idx) {
      if(!this.isNumber(this.data.device[idx]))return 
      const ctx = this.ctx; 
      ctx.beginPath();
      ctx.fillStyle = "#fff"; //设置填充颜色
      let titleTxtW = 0;
      let titleTxt = "2019年6月31日 04:00";
      const date = new Date(this.date)
      if(this.dateType === 'day') {
        titleTxt = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${idx.toString().padStart(2,'0')}:00`
      }else if(this.dateType === 'month'){
        titleTxt = `${date.getFullYear()}年${date.getMonth() + 1}月${idx + 1}日`
      }else if(this.dateType === 'year'){
        titleTxt = `${date.getFullYear()}年${idx + 1}月`
      } 
      let titleTxt1 = `本设备：${this.data.device[idx].toFixed(2)}kW·h`;
      let titleTxt2 = `全屋：${this.data.total[idx].toFixed(2)}kW·h`;
      let titleFontSize = 10 * this.dpr;
      let fontSize = 12 * this.dpr;
      let txtW1 = 0;
      let txtW2 = 0;
      {
        ctx.font = `normal bold ${Math.round(titleFontSize)}px sans-serif`;
        titleTxtW = ctx.measureText(titleTxt).width;
      }
      {
        ctx.font = `normal bold ${Math.round(fontSize)}px sans-serif`;
        txtW1 = ctx.measureText(titleTxt1).width;
      }
      {
        ctx.font = `normal bold ${Math.round(fontSize)}px sans-serif`;
        txtW2 = ctx.measureText(titleTxt2).width;
      }

      let x = this.data.device[idx];

      let maxW = Math.max(titleTxtW, txtW1, txtW2);
      let padding = 20 * this.dpr;
      let boxWidth = maxW + padding * 2;
      // let boxLeft = x - boxWidth / 2;
      const currentX = idx * (this.lineWidth+this.spaceWidth) + this.lineWidth / 2;
      let boxLeft = currentX - boxWidth / 2;
      boxLeft = boxLeft < 0 ? 0 : boxLeft;
      boxLeft = boxLeft + boxWidth > this.canvasWidth ? this.canvasWidth - boxWidth : boxLeft;
      // console.log('boxLeft',boxLeft,'idx:',idx,'currentX:',currentX)
      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(216, 2, 0, 0.06)";
      const boxHeight = fontSize + 10 * this.dpr + titleFontSize * 5
      const triangleWidth = 10 * this.dpr
      const ys = this.getCanvasDeviceDataList()
      let height = ys[idx].y - boxHeight - triangleWidth * 2
      height = height < 10 ? 10: height
      const firstTextTop = height + titleFontSize *2
      const secondTextTop = firstTextTop + fontSize + 10
      const thirdTextTop = secondTextTop + fontSize + 10
      ctx.rect(boxLeft, height, boxWidth, boxHeight); 
      ctx.moveTo(currentX - triangleWidth / 2, height + boxHeight);
      ctx.lineTo(currentX + triangleWidth / 2, height + boxHeight);
      ctx.lineTo(currentX, triangleWidth + height + boxHeight);
      ctx.fill();
      // ctx.fillStyle = "rgba(47, 47, 74, 0.8)";
      ctx.fillStyle = "#000"
      ctx.font = `normal bold ${Math.round(titleFontSize)}px sans-serif`;
      ctx.fillText(titleTxt, padding + boxLeft, firstTextTop);
      ctx.font = `normal bold ${Math.round(fontSize)}px sans-serif`;
      ctx.fillText(titleTxt1, padding + boxLeft, secondTextTop);
      ctx.fillText(titleTxt2, padding + boxLeft, thirdTextTop);
      ctx.closePath();
    },
    clearContext() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    getCanvasInstance() {
      const canvas = document.getElementById("socketCanvas");
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio;
      const width =
        (window.screen.width - ((2 * 40) / 750) * window.screen.width) * dpr; // 画布宽度
      const height = this.transformDPR(567); // 画布高度度
      return { canvas, ctx, dpr, width, height };
    },
    initCanvas() {
      const instance = this.getCanvasInstance(); 
      this.rect = this.$refs.socketCvs.getBoundingClientRect() 
      this.offsetX = (window.screen.width - instance.canvas.clientWidth) / 2
      this.canvas = instance.canvas;
      this.canvas.width = instance.width;
      this.canvas.height = instance.height;
      this.ctx = instance.ctx;
      this.dpr = instance.dpr;
      this.canvasWidth = instance.width;
      this.canvasHeight = instance.height;
    },
    onTouchStart(e) {
      // console.log(e);
      this.onTouchMove(e)
    },
    onTouchMove(e) {
      // console.log(e);

      let x = e.changedTouches[0].pageX;
      let y = e.changedTouches[0].pageY;
      // console.log(e.changedTouches[0])
      let idx = this._findIdxByX(x);
      if(y < this.rect.top || y > this.rect.top + this.rect.height || x < this.rect.left - 5 || x > this.rect.right + this.rect.width +5) {
        this.draw(null);
        return
      }
      this.draw(idx);
    },
    onTouchEnd(e) {
      // console.log(e);
    }, 
    _findIdxByX(x) {
      let w = this.spaceWidth + this.lineWidth;
      let idx = ((x * this.dpr - this.offsetX) / w) | 0;
      return idx;
    },
    draw(idx) {
      this.idx = idx
      this.spaceWidth = this.canvasWidth / (this.data.device.length * 1.5 + (this.data.device.length - 1) * 1); // 间距宽度
      this.lineWidth = this.spaceWidth * 1.5; // 画笔宽度
      this.clearContext()
      this.drawDotted();
      this.drawPillar(idx);
      this.drawPolyline();
      this.drawMask();
      this.drawPoint(idx);
      this.drawTextBox(idx)
    },
    onBlur() {
      if(this.idx) {
        console.log('draw')
        this.draw()
      }
    }
  },
  created() {
    this.currentIndex = this.initHour;
    this.currentMinuteIndex = this.initMinute;
  },
  mounted() {
    this.initCanvas();
    // this.draw();
  },
};
</script>
<style lang="less" scoped>
#socketCanvas {
  height: 567px;
  width: 100%;
  -webkit-user-select: none;
  user-select: none;
}
</style>
