/**
 * 为了收集所有的watcher
 * 依赖跟踪类
 * dep是可以有多个指令订阅的可观察对象
 */
class Dep {
    constructor() {
        // 订阅任务队列，方式有相同的任务，用Set数据结构简单处理
        this.subscribers = [];
    }
    // 收集观察者,用于收集依赖项,在vue源码中使用depend来收集依赖项,由于这是简化的,所以我们直接用addSub
    addSub(watcher) {
        this.subscribers.push(watcher);
    }
    // 用于发布消息，触发依赖项重新执行,通知观察者去更新
    notify() {
        console.log('通知了观察者', this.subscribers);
        this.subscribers.forEach(w => w.update());
    }
}
