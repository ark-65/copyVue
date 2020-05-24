class Updater {
    constructor() {
    }
    /**
     * 渲染node节点text属性对应的内容
     * @param node 当前节点
     * @param value 赋值的结果
     */
    textUpdater (node, value) {
        node.textContent = value;
    }
    /**
     * 渲染node节点 html 类型的内容
     */
    htmlUpdater (node, value) {
        node.innerHTML = value;
    }
    /**
     * 渲染input 对应的 value
     */
    modelUpdater(node, value) {
        node.value = value;
    }
    /**
     * 渲染node节点 attr其他属性
     * @param node 当前节点
     * @param attrName 目标attr 属性名称
     * @param value 目标值
     */
    attrUpdater(node, attrName, value) {
        node.setAttribute(attrName, value);
    }
}