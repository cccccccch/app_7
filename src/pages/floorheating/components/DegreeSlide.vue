<template>
  <div class="degree" ref="lineWrap" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" >
    <div class="line-wrap" ref="lineBox" :style="{ 'transform': `translateX(${moveX}px)` }" :class="{ 'animate': !touchStart.isTouching }">
      <div class="line"
      @click.prevent="clickOnLine($event,item.key)"
      :style="{ 'flex-basis': `${unitWidth}px`}" 
      :class="{ selected: currentIndex == item.key }"
      v-for="item of this.units" :key="item.key">{{item.value}}</div>
    </div>
  </div>
</template>
<script> 
export default {
  name: "DegreeSlideHeating",
  props: {
    // disabled
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // 开始刻度，默认5
    startDegree: {
      type: Number,
      default() {
        return 5;
      },
    },
    // 结束刻度，默认37
    endDegree: {
      type: Number,
      default() {
        return 37;
      },
    },
    // 开关是否打开
    isTurnOn: {
      type: Boolean,
      default() {
        return false;
      },
    }, 
    // 初始值
    initDegree: {
      type: Number,
      default() {
        return 0;
      },
    },
  },
  data() {
    return {
      moveX: 0, 
      units: [],
      limitLeft: 0,
      limitRight: 0,  
      touchStart: {
        x: 0,
        initX: 0,
        isTouching: false,
        unit: 0,
        currentIndex: 0,
        startTime: 0,
        isMove: false
      },
      unitWidth: 0,
      currentIndex: 0, 
    };
  },
  methods: { 
    clickOnLine(e,value) {
      // e.preventDefault() 
      // e.stopPropagation()
      // console.log(e);
      if(this.disabled || !this.isTurnOn)return  
      this.$emit("clickOnLine", value + this.startDegree);
    },
    onTouchStart(e) {
      if(this.disabled || !this.isTurnOn)return  
      this.$emit("onFingerTouch", true);
      this.touchStart.isMove = false
      this.touchStart.isTouching = true
      this.touchStart.unit = 0;
      this.touchStart.x = e.touches[0].clientX;
      this.touchStart.initX = this.moveX
      this.touchStart.currentIndex = this.currentIndex
      this.touchStart.startTime = Date.now();
    },
    onTouchMove(e) {
      if(this.disabled || !this.isTurnOn)return  
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.x - this.touchStart.x; 
      if(Math.abs(distance) > 3) {
        this.touchStart.isMove = true
      }
      let unit = 0;  
      unit = this._parseInt(distance) 
      // console.log(distance, unit) 
      this.currentIndex = this.limitedCurrentIndex(this.touchStart.currentIndex - unit) 
      this.touchStart.unit = unit;
      let moveX = this.touchStart.initX + distance; 
      this.moveX = this.limitedMoveX(moveX);
      this._emitSlide();
    },
    onTouchEnd(e) {
      if(this.disabled || !this.isTurnOn)return 
      this.$emit("onFingerTouch", false); 
      const touchMiles = Date.now() - this.touchStart.startTime;
      // console.log('touchMiles', touchMiles)
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.x - this.touchStart.x; 
      this.touchStart.isTouching = false
      if(!this.touchStart.isMove) {
        return
      }
      // if(touchMiles < 150 && Math.abs(distance < 5) ) {
        
      //   let offset = curPosition.x - window.screen.width / 2 
      //   let offsetUnit = 0
      //   if(Math.abs(offset) > this.unitWidth / 2) { 
      //     if(offset > 0) {
      //       offset -= (this.unitWidth / 2) 
      //       offsetUnit = Math.ceil(offset / this.unitWidth)
      //     } else {
      //       offset += (this.unitWidth / 2)
      //       offsetUnit = Math.floor(offset / this.unitWidth)
      //     } 
      //     this.$emit("clickOnLine", offsetUnit);
      //     // console.log('click', distance, this.touchStart.initX, curPosition.x, offset, offsetUnit)
      //   } 
      //   return
      // }
      let curIndex = this.currentIndex
      if (touchMiles < 120) {
        curIndex -= this.touchStart.unit * 2;
        this.touchStart.unit *= 3;
      } else if (touchMiles < 180) {
        curIndex -= this.touchStart.unit;
        this.touchStart.unit *= 2;
      }
      this.currentIndex = this.limitedCurrentIndex(curIndex)  
      let moveX = this.touchStart.initX + this.touchStart.unit * this.unitWidth
      // console.log('end', moveX) 
      // console.log('this.touchStart.unit', this.touchStart.unit) 
      this.moveX = this.limitedMoveX(moveX); 
      this._emitSlide(true);
    }, 
    _emitSlide(touchEnd = false) { 
      this.$emit("onSlide",  { degree: this.units.find(s => s.key == this.currentIndex).value , touchEnd});
    },
    _initDegree(degree = this.initDegree) { 
      const unit = this.endDegree - this.startDegree + 1
      this.units =  Array.from({ length : unit},  (v, k) => {
          return {
              key: k,
              value: this.startDegree + k
          }
      }) 
      const unitWidth = Math.round((75 / 750) * window.screen.width);;
      this.unitWidth = unitWidth
      // console.log('this.unitWidth',this.unitWidth)
      this.$nextTick(() => {
        this.moveX = -((degree - this.startDegree) * unitWidth - window.screen.width / 2 + unitWidth / 2)
        // console.log('this.moveX',this.moveX)
        this.limitRight = window.screen.width / 2 - unitWidth / 2
        this.limitLeft = -((this.endDegree - this.startDegree) * unitWidth - window.screen.width / 2 + unitWidth / 2)
        this.currentIndex = this.units.find(s => s.value == degree).key 
        this.$forceUpdate()
      })
      
    },
    _parseInt(distance) {
      const isUpward = distance < 0; 
      const f = isUpward && Math.abs(distance / this.unitWidth) >= 0.5 ? Math.floor : Math.round; 
      return f.call(this, distance / this.unitWidth); 
    },
    /**
     * 限制左右滑动距离
     */
    limitedMoveX(moveX) {
      if(moveX > this.limitRight) {
        return this.limitRight
      } else if(moveX < this.limitLeft){
        return this.limitLeft
      } else {
        return moveX
      }
    },
    /**
     * 防止Index溢出
     */
    limitedCurrentIndex(index) {
      if(index < 0) {
        return 0
      } else if(index > this.endDegree - this.startDegree){
        return this.endDegree - this.startDegree
      } else {
        return index
      }
    }
  },
  created() {
    this._initDegree();
  },
  mounted(){ 
    // window.onresize = () => {
    //   this._initDegree();
    // }
  },
  beforeDestroy(){
    // this.$refs.lineWrap.onresize = null
  },
  watch: {
    // 监听初始值，变更则重新渲染
    initDegree() {
      // this._initDegree();
    }
  }
};
</script>
<style lang="less" scoped>
.degree {
  width: 100%; 
  user-select: none; 
  overflow: hidden;
  height: 150px;
  position: relative; 
  .selected{ 
    opacity: 0;
  } 
  .animate {
    transition: all 0.3s ease-out;
  }
  .line-wrap {   
    display: flex;
    flex-direction: row;
    user-select: none;
    margin-top: 30px;
    .line {  
      transition: all 0.15s ease-out;
      flex: 0 0 75px;
      height: 40px;
      background: transparent;
      border-radius: 2px;
      font-size: 28px;
      text-align: center;
      user-select: none;
    }
  } 
}
</style>
