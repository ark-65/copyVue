class Watcher {
    /**
     *
     * @param vm vm实例
     * @param expr 表达式
     * @param cb 回调函数
     */
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 先把旧值保存起来
        this.oldVal = this.getOldVal();
    }

    update() {
        // 判断新值与旧值得变化,如果有变化更新视图
        const newVle = compileUtil.getVal(this.expr, this.vm);
        if (newVle !== this.oldVal) {
            this.cb(newVle);
        }
    }

    getOldVal() {
        // 挂载进来,直接创建一个target新属性
        Dep.target = this;
        const oldVle = compileUtil.getVal(this.expr, this.vm);
        // 销毁target属性,如果不重置,将会不停的绑定watcher,使watcher不能被回收
        Dep.target = null;
        return oldVle;
    }
}
