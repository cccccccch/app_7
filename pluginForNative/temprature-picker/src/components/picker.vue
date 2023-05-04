<script  lang="ts">
import { reactive, toRefs, onMounted, ref, watch, nextTick } from 'vue';
import { templatureColor, templatureColor_BW } from '../../utils/index'

interface Props {
    colorType: 0 | 1;
    templature: number;
    [k: string]: any;
}
export default {
    props: {
        colorType: {
            validator(value: number) {
                return [0, 1].includes(value)
            }
        },
        templature: {
            type: Number,
            default: 4500
        }
    },
    setup(props: any, context: any) {
        const Props = props as Props
        const circleWrapRef = ref<HTMLElement>()
        const indicatorRef = ref<HTMLElement>()
        const state = reactive({
            indicator: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            colorNum: 0,
            templatureColor: templatureColor,
            wrapRect: {
                width: 0,
                height: 0,
                left: 0,
                top: 0
            },
            colorHeight: 0,
        })
        onMounted(() => {
            _initPanel();
            setIndicatorByTemprature(Props.templature);
        })
        const onTouchStart = (e: TouchEvent) => {
            _initPanel();
            onTouchMove(e, false);
        }
        const onTouchMove = (e: TouchEvent, isTouchEnd?: boolean) => {
            const cur = e.changedTouches[0];
            let x = cur.clientX - (state.wrapRect.left + state.wrapRect.width / 2);
            let y = cur.clientY - (state.wrapRect.top + state.wrapRect.height / 2);
            let radius = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
            let wrapRadius = state.wrapRect.width / 2;
            let wrapX = state.wrapRect.left;
            let wrapY = state.wrapRect.top;
            if (radius > wrapRadius) {
                // 当手滑出圆盘外的时候
                let len = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
                // 利用相似三角形原理得出指示器中心坐标值
                let _x = (x * wrapRadius) / len + wrapRadius;
                let _y = (y * wrapRadius) / len + wrapRadius;
                state.indicator.x = _x - state.indicator.width / 2;
                state.indicator.y = _y - state.indicator.height / 2;
                let colorNum = Math.round(_y / state.colorHeight);
                state.colorNum = colorNum < 0 ? 0 : colorNum > state.templatureColor.length - 1 ? state.templatureColor.length - 1 : colorNum;
            } else {
                let position = { x: cur.clientX - wrapX, y: cur.clientY - wrapY };
                let colorNum = Math.round(position.y / state.colorHeight);
                state.colorNum = colorNum < 0 ? 0 : colorNum > state.templatureColor.length - 1 ? state.templatureColor.length - 1 : colorNum;
                state.indicator.x = position.x - state.indicator.width / 2;
                state.indicator.y = position.y - state.indicator.height / 2;
            }
            let params = { color: state.templatureColor[state.colorNum], templature: 6500 - state.colorNum * 100, isTouchEnd: !!isTouchEnd }
            context.emit("onTempratureChange", params);
        }
        const onTouchEnd = (e: TouchEvent) => {
            onTouchMove(e, true);
        }
        const _initPanel = () => {
            const wrapRect = circleWrapRef.value!.getBoundingClientRect();
            const indicator = indicatorRef.value!.getBoundingClientRect();
            state.wrapRect = wrapRect;
            state.indicator.width = indicator.width;
            state.indicator.height = indicator.height;
            state.colorHeight = wrapRect.height / state.templatureColor.length;
        }
        const setIndicatorByColor = (color: string) => {
            if (color) {
                for (let i = 0, len = state.templatureColor.length; i < len; i++) {
                    if (state.templatureColor[i] === color) {
                        state.indicator.y = i * state.colorHeight - state.indicator.height / 2;
                        state.indicator.x = state.wrapRect.width / 2 - state.indicator.height / 2;
                        state.colorNum = i;
                        break;
                    }
                }
            }
        }
        const setIndicatorByTemprature = (templature: number) => {
            let idx = (6500 - templature) / 100;
            state.indicator.y = idx * state.colorHeight - state.indicator.height / 2;
            state.indicator.x = state.wrapRect.width / 2 - state.indicator.height / 2;
            state.colorNum = idx;
        }
        watch([() => props.colorType, () => props.templature], (newV: any, oldV: any) => {
            if (newV[0] !== oldV[0] || newV[1] !== oldV[1]) {
                if (newV[0] === 1) {
                    state.templatureColor = templatureColor_BW
                } else if (newV[0] === 0) {
                    state.templatureColor = templatureColor
                }
                nextTick(() => {
                    _initPanel()
                    setIndicatorByTemprature(Props.templature)
                })
            }
        })
        return {
            ...toRefs(state),
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            circleWrapRef,
            indicatorRef,
            setIndicatorByColor,
            setIndicatorByTemprature
        }
    },
}

</script>

<template>
    <div class="temprature-select">
        <div
            class="temprature-circle"
            ref="tempratureCircle"
            @touchstart.stop="onTouchStart"
            @touchmove.stop="onTouchMove"
            @touchend.stop="onTouchEnd"
        >
            <div class="circle-wrap" ref="circleWrapRef">
                <div
                    class="temprature-color"
                    v-for="(item, idx) of templatureColor"
                    :key="idx"
                    :style="{ 'background-color': item, 'background-image': `linear-gradient(${item}, ${idx < templatureColor.length - 1 ? templatureColor[idx + 1] : item})` }"
                ></div>
            </div>
            <div
                class="temprature-indicator"
                ref="indicatorRef"
                :style="{ left: indicator.x + 'px', top: indicator.y + 'px', background: templatureColor[colorNum] }"
            ></div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.temprature-circle {
    position: relative;
    width: 480px;
    height: 480px;
    position: relative;
    border-radius: 50%;
    .circle-wrap {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .temprature-color {
        width: 100%;
        flex: 1;
    }
    .temprature-indicator {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 4px solid #ffffff;
        box-sizing: border-box;
    }
}
</style>
