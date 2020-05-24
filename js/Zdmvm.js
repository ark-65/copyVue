// 创建入口
class Zdmvm {
    // 构造函数，注入参数
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if (this.$el) {
            // 1. 实现一个数据观察者,需要观察数据中的所有属性
            new Observer(this.$data);
            // 2. 实现一个指令解析器
            new Compile(this.$el, this);
            this.proxyData(this.$data);
        }
    }
    proxyData(data) {
        for (const key in data) {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newVal) {
                    data[key] = newVal;
                }
            })
        }
    }
}


