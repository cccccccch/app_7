<template>
  <div class="home-svg-loading">
    <!-- <div class="svg-wrap"> -->
    <!-- <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 60 60" xml:space="preserve">
        <g>
          <polyline class="st0" points="5.6,12.1 5.8,39.4 9.5,39.4 29.5,23.8 47.7,39.4 59.7,49.7" />
          <clipPath id="XMLID_3_">
            <rect x="0" y="12.1" :width="distance" height="33.2" :class="{ lineLoading: loading }" />
          </clipPath>
        </g>
        <rect x="48.4" y="12.1" width="11.6" height="11.6" :class="{ dotLoading: loading }" :fill="distance > 40 ? '#d80200' : 'transparent'" />
      </svg> -->
    <!-- <img src="@/assets/images/testing4.png" :class="{ lineLoading: loading }" alt="" class="img"> -->

    <!-- </div> -->
    <div class="container">
      <div class="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "home-svg-loading",
  props: {
    distance: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dotY: 0,
    };
  },
  mounted() {
    this.dotY = this.distance / 5;
  },
};
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  /* 居中 */
  position: absolute;
  display: flex;
  justify-content: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.container .loading {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 10px;
  box-sizing: border-box;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

/* 6个正方形 */
.loading span {
  height: 60px;
  width: 60px;
  position: absolute;
  top: 15px;
  left: 15px;
  animation: move 3.5s linear infinite;
}

@keyframes move {
  74% {
    transform: rotate(600deg);
  }

  79% {
    transform: rotate(720deg);
    opacity: 1;
  }

  80% {
    transform: rotate(720deg);
    opacity: 0;
  }

  100% {
    transform: rotate(810deg);
    opacity: 0;
  }
}

.loading span:nth-child(2) {
  animation-delay: 0.1s;
}

.loading span:nth-child(3) {
  animation-delay: 0.2s;
}

.loading span:nth-child(4) {
  animation-delay: 0.3s;
}

.loading span:nth-child(5) {
  animation-delay: 0.4s;
}

.loading span:nth-child(6) {
  animation-delay: 0.5s;
}

.loading span::before {
  content: "";
  position: absolute;
  height: 6px;
  width: 6px;
  background-color: #fff;
  border-radius: 50%;
  bottom: 0px;
  left: calc(50% - 3px);
}
.img {
  width: 90px;
  height: 90px;
}
.home-svg-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .svg-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    // padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    .lineLoading {
      animation: lineAni 1.2s infinite;
    }
    .dotLoading {
      animation: dotAni 1.2s infinite ease-in-out;
    }
  }
}
@keyframes lineAni {
  0% {
    width: 0;
  }
  10% {
    width: 0;
  }
  40% {
    width: 100;
  }
  100% {
    width: 100;
  }
}
@keyframes dotAni {
  0% {
    y: -12;
  }
  50% {
    y: -12;
  }
  60% {
    y: 12.1;
  }
  70% {
    y: 8;
  }
  80% {
    y: 12.1;
  }
  99% {
    y: 12.1;
  }
  100% {
    y: -12;
  }
}
.st0 {
  clip-path: url(#XMLID_3_);
  fill: none;
  stroke: #fff;
  stroke-width: 12;
  stroke-miterlimit: 10;
}
</style>
