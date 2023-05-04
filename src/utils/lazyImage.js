class LazyImage {
    constructor(selector, wrapSelector) {
        // 懒记载图片列表，将伪数组转为数组，以便可以使用数组的api
        this.lazyImages = Array.prototype.slice.call(document.querySelectorAll(selector))
        this.wrapSelector = document.querySelector(wrapSelector)
        this.init()
    }

    inViewShow() {
        let len = this.lazyImages.length
        for (let i = 0; i < len; i++) {
            let lazyImage = this.lazyImages[i]
            const rect = lazyImage.getBoundingClientRect()
            if (rect.top - 100 < document.documentElement.clientHeight) {
                lazyImage.src = lazyImage.dataset.src
                this.lazyImages.splice(i, 1)
                len--
                i--
                if (this.lazyImages.length === 0) {
                    this.wrapSelector.removeEventListener('scroll', this._throttleFn)
                }
            }
        }
    }

    throttle(fn, delay = 15, mustRun = 30) {
        let start = null
        let timer = null
        let context = this
        return function () {
            let now = +(new Date())
            let args = Array.prototype.slice.call(arguments)
            clearTimeout(timer)
            if (!start) {
                start = now
            }
            if (now - start > mustRun) {
                fn.apply(context, args)
                start = now
            } else {
                timer = setTimeout(() => {
                    fn.apply(context, args)
                }, delay)
            }
        }
    }

    init() {
        if ("IntersectionObserverss" in window) {
            let lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target
                        lazyImage.src = lazyImage.dataset.src
                        lazyImageObserver.unobserve(lazyImage)
                    }
                })
            })
            this.lazyImages.forEach(function (lazyImage) {
                lazyImageObserver.observe(lazyImage);
            })
        } else {
            this.inViewShow()
            this._throttleFn = this.throttle(this.inViewShow)
            this.wrapSelector.addEventListener('scroll', this._throttleFn)
        }

    }
}

export default LazyImage