class Observer {
    // 观察数据
    constructor(data) {
        this.observe(data);
    }

    /**
     * 观察data,只针对对象做处理
     * @param data
     */
    observe(data) {
        /*
        {
            person: {
                name: '张三',
                fav: {
                    a: 'game',
                    b: 'book'
                }
            }
        }
         */
        if (data && typeof data === 'object') {
            // console.log(Object.keys(data));
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key]);
            })
        }
    }

    /**
     * 劫持监听属性
     * @param data
     * @param key
     * @param value
     */
    defineReactive(data, key, value) {
        // 递归遍历
        this.observe(value);
        const dep = new Dep();
        // 劫持data中的属性
        /**
         * object （必须有 操作的对象本身 这个很容易理解不传它操作谁？）
         * propertyname (必须有 属性名 添加修改属性得有属性名)
         * descriptor 必须有 大概是属性描述配置
         *  |- value 设置属性的值
         *  |- writable 是否可操作属性值 默认true
         *  |- configurable 是否可修改配置 默认 true
         *  |- enumerable 是否可枚举 默认 false
         */
        // 执行后可看到 data 下的每一个属性都有个set,get方法
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get () {
                // 如果Dep.target 存在(在watcher中创建了),就在dep.中插入观察者
                Dep.target && dep.addSub(Dep.target);
                // 订阅数据变化时,往Dep中添加观察者
                return value;
            },
            // set这里使用箭头函数,如果不使用箭头函数的话this指向就会被指向Object,改成箭头函数后,箭头函数没有this指向,就会找到Observer
            set: (newVal) => {
                this.observe(newVal);
                if (newVal !== value) {
                    value = newVal
                }
                // 告诉Dep,使Dep 通知watcher发生变化
                dep.notify();

            }
        })
    }
}