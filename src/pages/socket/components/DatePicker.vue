<template>
  <div class="countdown-box" :class="{ 'options-box-show': value }">
    <div class="countdown">
      <div class="btn-option">
        <div
          class="option-text cancel-countdown"
          @click="handleCountdown('cancel')"
        >
          取消
        </div>
        <div
          class="option-text confirm-countdown"
          @click="handleCountdown('ok')"
        >
          确认
        </div>
      </div>
      <div class="component">
        <div class="" ref="timerPickerWrap">
          <div class="scroller-box" :class="{day: type == 'day', month: type == 'month', year: type == 'year'}">
            <div class="current-time">
              <div class="desc" > 
                <span class="year-desc">{{ yearDesc }}</span>  
                <span class="month-desc" v-show="type=='month' || type=='day'">{{ monthDesc }}</span>  
                <span class="day-desc" v-show="type=='day'">{{ dayDesc }}</span> 
              </div>
            </div>
            <!-- 年 -->
            <div
              ref="years"
              class="years-wrap"
              :style="{ 
                transform: `translate3d(0,${year.top}px,0)`, 
                transition: year.isTouching
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(.25, .46, .45, .94)',
              }"
              @transitionend="ontransitionend"
              @touchstart="onYearTouchStart"
              @touchmove="onYearTouchMove"
              @touchend="onYearTouchEnd"
            >
              <div
                v-for="item in years"
                :key="item.key"
                class="text normal middle"
                :style="{ height: lineheight.normal + 'px' }"
                :data-index="item.key"
                :class="{
                  'selected-item': index.year == item.key,
                  'front-first-wrap': first(index.year, item.key),
                  'front-second-wrap': second(index.year, item.key),
                }"
              >
                <span class="front">{{ formatt(item.value) }}</span>
              </div>
            </div>
            <!-- 月 -->
            <div
              ref="months"
              class="month-wrap"
              v-show="type == 'month' || type == 'day'"
              :style="{ 
                transform: `translate3d(0,${month.top}px,0)`,
                marginTop: `${month.marginTop}px`,
                transition: month.isTouching
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(.25, .46, .45, .94)',
              }"
              @transitionend="ontransitionend"
              @touchstart="onMonthTouchStart"
              @touchmove="onMonthTouchMove"
              @touchend="onMonthTouchEnd"
            >
              <div
                v-for="item in months "
                :key="item.key"
                class="text normal middle"
                :style="{ height: lineheight.normal + 'px' }"
                :data-index="item.key"
                :class="{
                  'selected-item': index.month == item.key,
                  'front-first-wrap': first(index.month, item.key),
                  'front-second-wrap': second(index.month, item.key),
                }"
              >
                <span class="front">{{ formatt(item.value) }}</span>
              </div>
            </div>

            <!-- 日 -->
            <div
              ref="days"
              class="day-wrap"
              v-show="type == 'day'"
              :style="{ 
              
                transform: `translate3d(0,${day.top}px,0)`,
                marginTop: `${day.marginTop}px`,
                transition: day.isTouching || day.isTouchingAnother
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(.25, .46, .45, .94)',
              }"
              @transitionend="ontransitionend"
              @touchstart="onDayTouchStart"
              @touchmove="onDayTouchMove"
              @touchend="onDayTouchEnd"
            >
              <div
                v-for="item in days "
                :key="item.key"
                class="text normal middle"
                :style="{ height: lineheight.normal + 'px',   }"
                :data-index="item.key"
                :class="{
                  'selected-item': index.day == item.key,
                  
                  'front-first-wrap': first(index.day, item.key),
                  'front-second-wrap': second(index.day, item.key),
                }"
              >
                <span class="front" >{{ formatt(item.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "date-picker-socket",
  props: {
    type: {
      type: String,
      default: 'year',
    },
    maxDegree: {
      type: Number,
      default: 23,
    },
    minDegree: {
      type: Number,
      default: 0,
    },
    yearDesc: {
      type: String,
      default: "年",
    },
    monthDesc: {
      type: String,
      default: "月",
    },
    dayDesc: {
      type: String,
      default: "日",
    },
    currentDate: {
      type: Date,
      default: () => new Date()
    }, 
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      years: Array.from({ length: 41 }, (v, k) => {
        return { value: 2010 + k, key: 2010 + k }
      }),
      months: Array.from({ length: 41 }, (v, k) => {
        return { value: k % 12 + 1, key: k + 1 }
      }),
      days: Array.from({ length: 30 }, (v, k) => {
        return { value: 2000 + k, key: k };
      }), 
      initYear: 2020,
      initMonth: 10,
      initDay: 15,
      index: {
        year: new Date().getFullYear() - 2010,
        month: 1,
        day: 1
      },  
      lineheight: {
        main: 0,
        primary: 0,
        normal: 0,
      },
      year: {
        top: 0,
        isTouching: false,
        x: 0,
        y: 0,
        initTop: 0, 
        unit: 0,
        currentIndex: 0,
        startTime: 0,
        maxTop: 0,
        minTop: 0,
        value: 0
      },
      month: {
        isTouching: false,
        x: 0,
        y: 0,
        top: 0,
        initTop: 0,
        initMarginTop: 0,
        marginTop: 0,
        unit: 0,
        currentIndex: 0,
        startTime: 0,
        value: 0
      },
      day: {
        isTouching: false,
        isTouchingAnother: false,
        x: 0,
        y: 0,
        top: 0,
        initTop: 0,
        initMarginTop: 0,
        marginTop: 0,
        unit: 0,
        currentIndex: 0,
        startTime: 0,
        value: 0
      },
    };
  },
  watch: {
    value() {
      this._getRect();
    },
  },
  methods: {
    ontransitionend(){
      this.day.isTouching = true
    },
    first(curentIdx, index) {
      return curentIdx == index - 1 || curentIdx == index + 1;
    },
    second(curentIdx, index) {
      return curentIdx == index - 2 || curentIdx == index + 2;
    },
    formatt(s) {
      if (!s) return "00";
      return (s + "").padStart(2, "0");
    },
    setDayCount(initDay){
      const dayLength = this._getMonthDays(this.year.value, this.month.value)
      this.day.top = 0
      this.day.marginTop = 0 
      this.index.day = initDay + dayLength 
      this.days = Array.from({ length: 80 }, (v, k) => {
        return { value: k % dayLength + 1, key: k + 1 }
      })
    },
    setInitData() {
      this._setDate()
      this.index.year = this.initYear;
      this.index.month = this.initMonth + 12;
      this.day.value = this.initDay
      this.month.value = this.initMonth
      this.year.value = this.initYear
      this.setDayCount(this.initDay)
      this._getRect();
    },
    onMonthTouchStart(e) {
      this.day.isTouchingAnother = true
      this.month.y = e.changedTouches[0].clientY;
      this.month.initTop = this.month.top;
      this.month.currentIndex = this.index.month;
      this.month.unit = 0;
      this.month.isTouching = true;
      this.month.initMarginTop = this.month.marginTop; 
      this.month.startTime = Date.now();
    },

    onMonthTouchMove(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.y - this.month.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.index.month = this.month.currentIndex - unit;
      this.month.unit = unit;
      this.month.top = this.month.initTop + distance;
    },
    onMonthTouchEnd(e) {
      const touchMiles = Date.now() - this.month.startTime;
      if (touchMiles < 90) {
        this.index.month -= this.month.unit * 2;
        this.month.unit *= 3;
      } else if (touchMiles < 180) {
        this.index.month -= this.month.unit;
        this.month.unit *= 2;
      }
      this.month.currentIndex = this.index.month;
      this.month.value = this.months.find((s) => s.key == this.index.month).value
      this.changeYearMonth()
      const g = this.month.unit;
      if (g < 0) {
        this.months.splice(0, Math.abs(g));
        const item = this.months[this.months.length - 1];
        for (let i = 0; i < Math.abs(g); i++) {
          const value = item.value + i + 1 
          this.months.push({
            key: item.key + i + 1,
            value: value > 12 ? value % 12 : value,
          });
        }
      } else if (g > 0) {
        this.months.splice(-g);
        const item = this.months[0];
        for (let i = 0; i < Math.abs(g); i++) {
          const value = item.value - i - 1 
          this.months.unshift({
            key: item.key - i - 1,
            value: value <= 0 ? value + 12 : value
          });
        }
      }
      this.month.marginTop = this.month.initMarginTop - g * this.lineheight.normal;
      this.$nextTick(() => {
        setTimeout(() => {
          this.month.top = this.month.initTop + this.lineheight.normal * g;
          this.month.initTop = this.month.top;
          this.month.isTouching = false;
        }, 20);
      }); 
    },
    
    onDayTouchStart(e) {
      this.day.isTouchingAnother = false
      this.day.y = e.changedTouches[0].clientY;
      this.day.initTop = this.day.top;
      this.day.currentIndex = this.index.day;
      this.day.unit = 0;
      this.day.isTouching = true;
      this.day.initMarginTop = this.day.marginTop; 
      this.day.startTime = Date.now();
    },

    onDayTouchMove(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.y - this.day.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.index.day = this.day.currentIndex - unit;
      this.day.unit = unit;
      this.day.top = this.day.initTop + distance;
    },
    onDayTouchEnd(e) {
      const touchMiles = Date.now() - this.day.startTime;
      if (touchMiles < 90) {
        this.index.day -= this.day.unit * 2;
        this.day.unit *= 3;
      } else if (touchMiles < 180) {
        this.index.day -= this.day.unit;
        this.day.unit *= 2;
      }
      this.day.currentIndex = this.index.day;
      const length = this.getDays()
      const g = this.day.unit;
      
      if (g < 0) {
        this.days.splice(0, Math.abs(g));
        const item = this.days[this.days.length - 1];
        for (let i = 0; i < Math.abs(g); i++) {
          const value = item.value + i + 1 
          this.days.push({
            key: item.key + i + 1,
            value: value > length ? value % length : value,
          });
        }
      } else if (g > 0) {
        this.days.splice(-g);
        const item = this.days[0];
        for (let i = 0; i < Math.abs(g); i++) {
          const value = item.value - i - 1 
          this.days.unshift({
            key: item.key - i - 1,
            value: value <= 0 ? value + length : value
          });
        }
      }
      this.day.marginTop = this.day.initMarginTop - g * this.lineheight.normal;
      this.day.value = this.days.find((s) => s.key == this.index.day).value
      this.$nextTick(() => {
        setTimeout(() => {
          this.day.top = this.day.initTop + this.lineheight.normal * g;
          this.day.initTop = this.day.top;
          this.day.isTouching = false;
        }, 20);
      }); 
    },
    onYearTouchStart(e) {
      this.day.isTouchingAnother = true
      this.year.y = e.changedTouches[0].clientY;
      this.year.initTop = this.year.top;
      this.year.currentIndex = this.index.year;
      this.year.unit = 0;
      this.year.isTouching = true; 
      this.year.startTime = Date.now();
    },
    onYearTouchMove(e, isTouchEnd = false) {
      let curPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      const distance = curPosition.y - this.year.y;
      const isUpward = distance < 0;
      let unit = 0;
      let calLineHeight = this.lineheight.normal;

      const f = isUpward ? Math.floor : Math.round;
      unit = f.call(this, distance / calLineHeight);
      this.index.year = this.limmitedYear(this.year.currentIndex - unit)
      this.year.unit = unit;
      // this.year.currentIndex - unit
      if(this.year.maxTop <= this.year.initTop + distance) {
        this.year.top = this.year.maxTop
      } else if(this.year.minTop >= this.year.initTop + distance){
        this.year.top = this.year.minTop
      } else {
        this.year.top = this.year.initTop + distance;
      } 
    },
    onYearTouchEnd(e) {
      const touchMiles = Date.now() - this.year.startTime;
      if (touchMiles < 90) {
        this.index.year = this.limmitedYear(this.index.year - this.year.unit * 2)
        this.year.unit *= 3;
      } else if (touchMiles < 180) {
        this.index.year = this.limmitedYear(this.index.year - this.year.unit)
        this.year.unit *= 2;
      }
      
      this.year.currentIndex = this.index.year; 
      this.year.value = this.years.find((s) => s.key == this.index.year).value
      const g = this.year.unit;  
      this.changeYearMonth()
      this.$nextTick(() => {
        setTimeout(() => {
          if(this.year.maxTop <= this.year.initTop + this.lineheight.normal * g) {
            this.year.top = this.year.maxTop
          } else if(this.year.minTop >= this.year.initTop + this.lineheight.normal * g){
            this.year.top = this.year.minTop
          } else {
            this.year.top = this.year.initTop + this.lineheight.normal * g;
          }  
          this.year.initTop = this.month.top;
          this.year.isTouching = false;
        }, 20);
      }); 
    },
    limmitedYear(value){
      if(value <= 2010) {
        return 2010; 
      } else if(value >= 2050){
        return 2050; 
      } else {
        return value 
      }  
    },
    _getRect() {
      this.$nextTick(() => {
        this.lineheight.normal = Math.round((74 / 750) * window.screen.width);
        this.lineheight.main = Math.round((112 / 750) * window.screen.width);
        this.lineheight.primary = Math.round((78 / 750) * window.screen.width);
        this.year.top =  (2010 + 2 - this.index.year) * this.lineheight.normal; 
        this.month.top =  (3 - this.index.month) * this.lineheight.normal; 
        this.day.top =  (3 - this.index.day) * this.lineheight.normal; 
        this.year.maxTop = 2 * this.lineheight.normal
        this.year.minTop = -38 * this.lineheight.normal
      });
    },
    handleCountdown(name) {
      if ("cancel" == name) {
        this.$emit("input", false);
        this.$emit("on-cancel");
      } else if ("ok" == name) {
        this.$emit("input", false); 
        this.$emit("on-confirm", {
          year: this.year.value,
          month: this.month.value,
          day: this.day.value
        });
      }
    },
    changeYearMonth(){
      this.setDayCount(this.day.value )
      this.day.top =  (3 - this.index.day) * this.lineheight.normal;  
    },
    getDays(){
      const year = this.years.find((s) => s.key == this.index.year).value 
      const month = this.months.find((s) => s.key == this.index.month).value
      const length = this._getMonthDays(year, month) 
      return length
    },
    _getMonthDays(year, month) {
      year = ~~year
      month = ~~month
      if(month == 2) {
          const isLeapYear = (year % 400 === 0) || (year % 100 !== 0 && year % 4 ===0);
          return isLeapYear ? 29 : 28
      } 
      if([1,3,5,7,8,10,12].includes(month)) {
          return 31
      } else {
          return 30
      }
    } ,
    _setDate() {
      this.initYear = this.currentDate.getFullYear()
      this.initMonth = this.currentDate.getMonth() + 1
      this.initDay = this.currentDate.getDate()
    }
  },

  created() { 
    this._setDate()
    this.index.year = this.initYear;
    this.index.month = this.initMonth;
    this.index.day = this.initDay;
  },
  mounted() {
    this.setInitData();
  },
};
</script>
<style lang="less" scoped>
@level1: 112px;
@level2: 78px;
@level3: 74px;
.countdown-box {
  position: absolute;
  z-index: 99;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
  transition: all 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
  .auto-shutdown,
  .countdown {
    height: 528px;
    background: #ffffff;
    width: 100%;
    flex-direction: column;
    align-items: center;
    display: flex;
    justify-content: space-evenly;
    .component {
      height: 416px;
      width: 100%;
    }
    .btn-option {
      width: 100%;
      height: 32px;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      .option-text {
        width: 64px;
        height: 32px;
        font-size: 32px;
        white-space: nowrap;
        font-weight: 400;
        color: #959495;
        line-height: 32px;
      }
      .cancel-countdown {
        margin-left: 40px;
        color: #959495;
      }
      .confirm-countdown {
        margin-right: 40px;
        color: #4289ff;
      }
    }
    .option-text {
      height: 45px;
      font-size: 32px;
      
      font-weight: 400;
      color: #4289ff;
      line-height: 45px;
    }
  }
}
.text {
  height: 40px;
  font-size: 40px;
  
  font-weight: 400;
  color: #121212;
  line-height: 40px; 
}
.day {
      .years-wrap {
        left: 0;
        width : 33%;
      } 
      .month-wrap {
        width : 33%;
        left: 33%;
      }
      .day-wrap {
        left: 66%;
        width : 33%;
      }
      .year-desc {
        margin-left: 27vw;
      }
       .month-desc {
        margin-left: 16vw;
      }
       .day-desc {
        margin-left: 20vw;
      }
  }

  .month {
      .years-wrap{
        width : 50%;
        left: 0;
      }
      .month-wrap {
        width : 50%;
        left: 50%;
      }
      .year-desc {
        margin-left: 36vw;
      } 
      .month-desc {
        margin-left: 28vw;
      }
  } 
  .year {
      .years-wrap,
      .day-wrap,
      .month-wrap {
        width : 100%
      }
      .year-desc {
        margin-left: 62vw;
      }
  }
.scroller-box {
  position: relative;
  display: flex;
  justify-content: space-around;
  overflow: hidden;
  height: 416px;
  .current-time {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 750px;
    height: @level1;
    border: 1px solid #e1e1e4;
    .desc {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 48px;
      display: flex;
      width: 100%;
      align-items: flex-end;
      
      font-weight: 400;
      color: #121212;
      justify-content: space-between;
      font-size: 24px;
      line-height: 32px;
      line-height: 48px;
      .space {
        width: 412px;
      }
      .day-desc,
      .month-desc,
      .year-desc {
        font-size: 24px;
        line-height: 32px;
        flex: 1;
      } 
 
    }
  }
  .scroll {
    display: flex;
    flex-direction: column;
  } 
  

  .years-wrap,
  .day-wrap,
  .month-wrap {
    position: absolute; 
    // padding: 0 48px;
    top: 0;
    overflow: hidden; 
    user-select: none;
    .normal {
      height: @level3;
    }
    .middle {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .front {
      opacity: 0.35;
      color: #121212; 
    }
    .selected-item {
      width: 100%;
      height: @level1 !important;
      display: flex;
      align-items: center;
      .front {
        height: 48px;
        font-size: 48px;
        font-weight: 500;
        line-height: 48px;
        opacity: 1;
      }
    }
    .bold-font{
      .front { 
        opacity: 0.35;
      }
    }
    .front-first-wrap {
      height: @level2 !important;
      .front {
        height: 44px;
        font-size: 44px;
        font-weight: 400;
        line-height: 44px; 
      }
    }

    .front-second-wrap {
      height: @level3;
      .front {
        height: 40px;
        font-size: 40px;
        font-weight: 400;
        line-height: 40px; 
      }
    }
  } 
}
</style>
