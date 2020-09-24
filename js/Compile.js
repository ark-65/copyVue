// 创建一个指令解析器
class Compile {
    /**
     * @param el dom渲染的根节点
     * @param vm 实例，也就是zdmvm
     */
    constructor(el, vm) {
        // 绑定el，如果是一个元素节点，直接赋值，如果不是，获取元素节点
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        // console.log(this.el);
        // 绑定vm
        this.vm = vm;
        // 1. 获取文档随便对象，放入内存中，在渲染时调用，会减少页面的回流和重绘。文档碎片的对象就是整个的根节点，在文档碎片中替换所有的表达式后return dom
        /**
         * **真实DOM：**
         * 大家都知道DOM API，例如调用documnt.createElement创建一个真实div节点插入到DOM文档流中，
         * 这个原生API实际上是通过使用C++编写的浏览器引擎实现的，我们不需要了解C++是如何实现的，
         * 只需要调用javascript api就可以创建真实DOM。你可以通过在浏览器打印DOM节点，会发现它包含很多属性。
         *
         * **虚拟DOM：**
         * 在Vue中的虚拟DOM会在每个实例通过this.$createElement返回一个虚拟节点，
         * 这个虚拟节点也表示一个div但他是一个纯javascript对象，他和真实DOM差异是非常大的。
         * 看到上图虚拟DOM它除了包含当前节点名字和属性，还有children表示节点的子元素，这就构成了一个虚拟DOM树。
         *
         * 普及一下虚拟DOM和真实的DOM的差异：
         * 1、 资源消耗问题
         * 使用javascript操作真实DOM是非常消耗资源的，虽然很多浏览器做了优化但是效果不大。你看到虚拟DOM是一个纯javascript对象。
         * 假设你有1000个节点，那会相应创建1000个节点，那也是非常节省资源的，但是如果创建1000个DOM节点就不同了。
         * 2、执行效率问题
         * 如果你要修改一个真实DOM，一般调用innerHTML方法，那浏览器会把旧的节点移除再添加新的节点，但是在虚拟DOM中，只需要修改一个对象的属性，
         * 再把虚拟DOM渲染到真实DOM上。很多人会误解虚拟DOM比真实DOM速度快，其实虚拟DOM只是把DOM变更的逻辑提取出来，使用javascript计算差异，
         * 减少了操作真实DOM的次数，只在最后一次才操作真实DOM，所以如果你的应用有复杂的DOM变更操作，虚拟DOM会比较快。
         * 3、虚拟DOM还有其他好处
         * 其实虚拟DOM还可以应用在其他地方，因为他们只是抽象节点，可以把它编译成其他平台，例如android、ios。
         * 市面上利用形同架构模式的应用有React Native，Weeks，Native script，就是利用虚拟DOM的特点实现的。
         *
         */
        const fragment = this.node2Fragment(this.el);
        console.log(fragment)
        // 2. 编译模板
        // this.compile(fragment);
        // 3. 追加子元素到根元素
        // this.el.appendChild(fragment);
    }

    /**
     * 判断node是不是一个节点对象
     * @param node 根节点
     * @returns {boolean}
     */
    isElementNode (node) {
        /**
         * nodeType 属性返回节点类型。
         * 如果节点是一个元素节点，nodeType 属性返回 1。
         * 如果节点是属性节点, nodeType 属性返回 2。
         * 如果节点是一个文本节点，nodeType 属性返回 3。
         * 如果节点是一个注释节点，nodeType 属性返回 8。
         */
        return node.nodeType === 1;
    }

    /**
     * @param el 根节点
     */
    node2Fragment(el) {
        // 创建文档碎片
        const df = document.createDocumentFragment();
        let firstChild;
        /**
         * 1. 从el中拿出第一个子节点进行赋值
         * 2. 如果赋值结果为真，就追加进去，直到不能赋值
         */
        while (firstChild = el.firstChild) {
            /**
             * 如果文档树中已经存在了 newchild，它将从文档树中删除，
             * 然后重新插入它的新位置。如果 newchild 是 DocumentFragment 节点，则不会直接插入它，
             * 而是把它的子节点按序插入当前节点的 childNodes[] 数组的末尾
             */
            // appendChild 之后  等于是从el节点中取出了第一个节点追加到文档碎片中，el中的节点也会消失,最后dom中的节点会全部追加到df（文档碎片）对象当中
            // 这里的过程可以理解为栈的pop过程
            // 此时页面为空
            df.appendChild(firstChild);
        }
        return df;
    }

    /**
     *
     * @param fragment 文档碎片对象
     */
    compile(fragment) {
        /** 拿到的这一坨
         * <div id="app">
         <h2>{{person.name}} -- {{person.age}}</h2>
         <h3>{{person.fav}}</h3>
         <ul>
         <li>1</li>
         <li>2</li>
         <li>3</li>
         </ul>
         <h3>{{msg}}</h3>
         <div v-text="msg"></div>
         <div v-html="htmlStr"></div>
         <input type="text" v-model="msg">
         </div>
         */
            // 获取每一个子节点
        const childNodes = fragment.childNodes;
        // 强制转换成数组,因为目前childNodes是个伪数组（元素集合）
        // console.log(childNodes);
        // NodeList(15)[text, h2, text, h3, text, ul, text, h3, text, div, text, div, text, input, text], length:0
        [...childNodes].forEach(child => {
            // 其中  text是文本节点（空格之类的）
            if (this.isElementNode(child)) {
                // 元素节点 ,并编译
                console.log('元素节点', child);
                this.compileElement(child);
            } else {
                // 文本节点，并编译
                console.log('文本节点', child);
                this.compileText(child);
            }
            // 如果当前节点还存在子节点，并且有length属性，递归遍历
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        })
    }

    /**
     * 编译元素节点
     * @param node 元素节点
     */
    compileElement(node) {
        // console.log(node);
        // <div v-text="msg"></div>
        const attributes = node.attributes;
        // console.log(attributes);
        // 不管是对象，还是伪数组，都强制转换成数组
        [...attributes].forEach(attr => {
            // console.log(attr);
            // z-text z-html type z-model ,只需要自定义的属性,原本属性(type)不需要
            // 解构赋值
            const {name, value} = attr;
            if (this.isDirective(name)) {
                // 解构赋值,第一个z不需要,只需要第二个属性名称 z-text => text v-on:click => on:click  z-bind:src
                const [, dirctive] = name.split('-');
                const [dirName, eventName] = dirctive.split(':'); //text => text on:click => on,click
                // 从dirName中取值后,使用compileUtil来支撑对应的方法
                // 仅在解析on指令的时候,传入eventName,用于绑定事件
                // 更新数据  数据驱动视图
                compileUtil[dirName](node, value, this.vm, eventName);
                console.log(dirName);
                // 删除有指令的标签上的属性 <span v-text="msg"></span> => <span></span>
                node.removeAttribute('z-' + dirctive);
            } else if (this.isEventName(name)){ // @click='handlerClick'
                // 以@符号进行分割
                const [, eventName] = name.split('@');
                // 由于这里都是处理 @ 事件,所以直接走 对应的 on 函数
                compileUtil['on'](node, value, this.vm, eventName);
            }
        })
    }

    /**
     * 编译文本节点
     * @param node 文本节点
     * 编译{{}}这种表达式
     */
    compileText(node) {
        // console.log(node);
        // console.log(node.textContent);
        const content = node.textContent;
        // 只要有双大括号的({{}})
        if (/\{\{(.+?)\}\}/.test(content)) {
            // console.log(content);
            compileUtil['text'](node, content, this.vm);
        }
    }

    /**
     * 判断是不是自定义属性
     * @param attrname 标签attr属性名称
     * @returns {boolean}
     */
    isDirective(attrname) {
        // 判断是否以 z- 开头的
        return attrname.startsWith('z-');
    }

    isEventName (attrName) {
        return attrName.startsWith('@');
    }
}
/**
 * 用于解析解析器解析属性,赋值,绑定事件
 */
const compileUtil = {
    /**
     * @param expr 对应的表达式 object.obj.key
     * @param vm vm实例
     * @return 根据不同的表达式(expr)得到相应的val
     */
    getVal(expr, vm) {
        /**
         * 使用reduce,新建并返回一个obj对象中存在的keys的object对象,使用场景很多,比如计算一个字符串中每个字母出现的次数,求和
         * arr.reduce(function(prev,cur,index,arr){
         *  ...
         * }, init);
         * arr 表示原数组；
         * prev 表示上一次调用回调时的返回值，或者初始值 init;
         * cur 表示当前正在处理的数组元素；
         * index 表示当前正在处理的数组元素的索引，若提供 init 值，则索引为0，否则索引为1；
         * init 表示初始值
         */
        // 分割后[person, name]
        // 1. data.person 作为返回值
        // 2. data.person.name 作为返回值
        return expr.split('.').reduce((data, currentVal) => {
            // console.log(currentVal);
            return data[currentVal];
        }, vm.$data);
    },
    setVal(expr, vm, inputVal) {
        return expr.split('.').reduce((data, currentVal) => {
            // console.log(currentVal);
            data[currentVal] = inputVal;
        }, vm.$data);
    },
    /**
     * 处理v-text属性
     * @param node 当前节点
     * @param expr 表达式,v-text="msg" 中的 msg 与 {{person.name}} 中的 person.name
     * @param vm vm实例,用于取值$data绑定的变量
     */
    text(node, expr, vm) {
        let value;
        // 编译文本 对 expr 判断,
        if (expr.indexOf('{{') !== -1) {
            // 这里处理{{双大括号}} 绑定的数据
            // {{person.name}} -- {{person.age}}
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                // console.log(args);
                // 绑定观察者,将来数据发生变化 触发这里的回调
                // 调用this.getVal 时,触发了Observer 中的  getter方法 => 然后通知了观察者
                new Watcher(vm, args[1], (newVal) => {
                    this.updater.textUpdater(node, this.getContentVal(expr, vm));
                })
                return this.getVal(args[1], vm);
            });
        } else {
            // 这里处理的是 v-text 绑定的数据
            // value = vm.$data[expr]; // 不能对v-text="person.name" 中的person.name进行解析
            new Watcher(vm, expr, (newVal) => {
                this.updater.textUpdater(node, newVal);
            })
            value = this.getVal(expr, vm);
        }
        // console.log(value);
        this.updater.textUpdater(node, value);
    },
    /**
     * 同上
     * @param node
     * @param expr
     * @param vm
     */
    html(node, expr, vm) {
        const value = this.getVal(expr, vm);
        // 调用this.getVal 时,触发了Observer 中的  getter方法 => 然后通知了观察者
        new Watcher(vm, expr, (newVal) => {
            this.updater.htmlUpdater(node, newVal);
        })
        this.updater.htmlUpdater(node, value);
    },
    /**
     * 同上
     * @param node
     * @param expr
     * @param vm
     */
    model(node, expr, vm) {
        const value = this.getVal(expr, vm);
        // 调用this.getVal 时,触发了Observer 中的  getter方法 => 然后通知了观察者
        // 绑定更新函数 数据 => 视图
        new Watcher(vm, expr, (newVal) => {
            this.updater.modelUpdater(node, newVal);
        })
        // 视图 => 数据 => 视图
        node.addEventListener('input', (e) => {
            // 设置值
            this.setVal(expr, vm, e.target.value);
        })
        this.updater.modelUpdater(node, value);
    },
    /**
     * 处理v-on:click属性
     * @param node 当前节点
     * @param expr 表达式,v-on:click" 中的 click
     * @param vm vm实例,用于取值方法
     * @param eventName 事件名称 v-on:click => click
     */
    on(node, expr, vm, eventName) {
        const fn = vm.$options.methods && vm.$options.methods[expr];
        // 在Vue中  所有的this都指向 Vue实例,所以这里要绑定 this指向 => vm
        node.addEventListener(eventName, fn.bind(vm), false);
    },
    /**
     * 处理动态绑定原属性
     * @param node
     * @param expr v-bind:src="imgSrc" 中的  imgSrc
     * @param vm
     * @param attrName attr名称
     */
    bind(node, expr, vm, attrName) {
        const value = this.getVal(expr, vm);
        console.log(expr, value, attrName);
        this.updater.attrUpdater(node, attrName, value);
    },
    getContentVal(expr, vm) {
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(args[1], vm)
        });
    },
    // 更新的函数
    updater: new Updater()
}
