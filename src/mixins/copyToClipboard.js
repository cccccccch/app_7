export default  {
    methods:{
        copyToClipboard_mixin(){
            //获取复制目标标签
            const txt = document.querySelector('#text')
            //由于目标标签可能非input 则创建一个input并加入当前body
            const input = document.createElement('input');
            //设置input框只读 防止ios输入框弹起
            input.setAttribute('readonly', 'readonly');
            document.body.appendChild(input);
            // 文本内容
            input.setAttribute('value', txt.innerText);
            // 解决ios选中区域缺失 若length依然未获取到全部内容 则setSelectionRange(0, 9999)
            input.setSelectionRange(0, input.value.length);
             // 选中区域
            input.select();
            // navigator.clipboard.writeText()此方法存在安全域问题
            // 某些浏览器禁用了非安全域的 navigator.clipboard 对象，这时候navigator.clipboard不可用，就需要我们使用已弃用的document.execCommand(‘copy’)
            // navigator.clipboard.writeText(val.target.innerText)
            document.execCommand('copy')?this.$Toast.show({ title: "复制成功" ,postion:'middle'}):this.$Toast.show({ title: "复制失败" ,postion:'middle'})
            // if(document.execCommand('copy')){
            //     // document.execCommand('copy')
            //     this.$Toast.show({ title: "复制成功" ,postion:'middle'});
            // }else{
            //     this.$Toast.show({ title: "复制失败" ,postion:'middle'});
            // }
            //清除当前选中区的选中状态
            document.execCommand("unselect", "false", null)
            // 清除创建的input
            document.body.removeChild(input)
        },
    },
}