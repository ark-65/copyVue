/**
 * 为了收集所有的watcher
 */
class Dep {
    constructor() {
        this.subs = [];
    }
    // 收集观察者
    addSub(watcher) {
        this.subs.push(watcher);
    }
    // 通知观察者去更新
    notify() {
        console.log('通知了观察者', this.subs);
        this.subs.forEach(w => w.update());
    }
}