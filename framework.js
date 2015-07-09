/**
 * Created by liuxinxin on 2015/5/4.
 */
/*************** Event ******************/
var PXJSFrame = PXJSFrame||{};
/*
 @desc:创建指定的命名空间下的类
 @param:nameSpace,命名空间的名称,格式为XXX.XXX.XX
 @return:返回创建的指定命名空间下的类
 */
PXJSFrame.createNamespace = PXJSFrame.createNamespace||function(nameSpace){
    if(!nameSpace)return;
    var names = nameSpace.split('.'),curSpace = this;
    for(var i = 0,len = names.length;i<len;i+=1){
        if(!(names[i] in curSpace)){//如果Utily下不存在名称为names[i]的命名空间则创建
            curSpace[names[i]]={};
        }
        curSpace = curSpace[names[i]];
    }
}
/*
 @desc:创建XHR对象
 */
PXJSFrame.createNamespace("XHR");
PXJSFrame.XHR = (function(){
    var xhr = null;
    if("XMLHttpRequest" in window){
        xhr  = new XMLHttpRequest();
    }else{
        if("ActiveXObject" in window){
            var arr = ["MSXML3.XMLHTTP","MSXML2.XMLHTTP","Microsoft.XMLHTTP"];
            for(var i= 0,len=arr.length;i<len;i+=1){
                try {
                    xhr = new ActiveXObject(arr[i]);
                    break;
                }
                catch(ex){
                }
            }
        }
    }
    return xhr;
})();
/*
 @desc:与后台服务交互的接口类
 */
PXJSFrame.createNamespace("Server");
PXJSFrame.Server.sendRequest = function(url,dc,asyncFlag,fn){
    var isAsync = asyncFlag||true;//请求默认方式为异步
    var XHR = PXJSFrame.XHR;
    XHR.open("post",url,isAsync);
    if(isAsync) {
        XHR.onreadystatechange = function () {
            if (XHR.readySate == 4) {
                if (XHR.status == 200) {
                    //获取请求的业务逻辑的处理结果
                    this.isSuccess = null;
                    //获取请求响应之后服务器端传递过来的参数对象
                    this.Response = null;
                    //获取请求的返回数据并处理成json对象，如果存在回调函数则将该json对象作为参数传递给回调函数,此处理逻辑待处理
                    if (fn && (typeof fn == "function")) {
                        fn();
                    }
                }else{
                    alert('errorCode:'+XHR.status+',erroMsg:'+XHR.statusText);
                }
            }
        }
    }
    XHR.send(dc);
    if(!isAsync){
        if (fn && (typeof fn == "function")) {
            fn();
        }
    }
};
/*
    @desc:处理事件的兼容性，用此方法可以保持给dom添加事件处理事件在各个浏览器的表现一致
 */
PXJSFrame.createNamespace("Event");
PXJSFrame.Event = (function(dc){
    var evt = {};
    if("addEventListener" in dc){
        evt.getEvent = function(event){return event;};
        evt.getTarget = function(event){return event.target;};
        evt.addEvent = function(ele,type,fn,isCapture) {
            if (ele && (typeof ele == "object")) {
                if (typeof fn != "function") {
                    console.error('第三个参数不是合法的事件处理函数!');
                    return;
                }
                ele.addEventListener(type, fn, isCapture);
            }
        };
        evt.removeEvent = function(ele,type,fn,isCapture) {
            if (ele && (typeof ele == "object")) {
                if (typeof fn != "function") {
                    console.error('第三个参数不是合法的事件处理函数!');
                    return;
                }
                ele.removeEventListener(type, fn, isCapture);
            }
        };
        evt.preventDefault = function(event){event.preventDefault();};
        evt.stopBubble = function(event){event.stopPropagation();};
        evt.isIE = false;
    }else if("attachEvent" in dc){
        evt.getEvent = function(event){return window.event;};
        evt.getTarget = function(event){return window.event.srcElement;};
        evt.addEvent = function(ele,type,fn,isCapture) {
            if (ele && (typeof ele == "object")) {
                if (typeof fn != "function") {
                    console.error('第三个参数不是合法的事件处理函数!');
                    return;
                }
                ele.attachEvent("on" + type, (function () {
                    return function () {
                        fn.call(ele);//处理Ie中dom元素的事件监听函数内this指向window的问题
                    };
                })());
            }
        };
        evt.removeEvent = function(ele,type,fn,isCapture) {
            if (ele && (typeof ele == "object")) {
                if (typeof fn != "function") {
                    console.error('第三个参数不是合法的事件处理函数!');
                    return;
                }
                ele.detachEvent("on" + type, (function () {
                    return function () {
                        fn.call(ele);//处理Ie中dom元素的事件监听函数内this指向window的问题
                    };
                })());
            }
        };
        evt.preventDefault = function(event){window.event.returnValue = false;};
        evt.stopBubble = function(event){window.event.cancelBubble = true;};
        evt.isIE = true;
    }
    return evt;
})(window.document);
/*
  类似jQuery里面的$(fn)/$(document).ready(fn)函数，即在dom结构加载完成的时候执行用户定义的操作
 */
PXJSFrame.readyEvent = (function(global,dc){
    var readyCallBack = [],isBind = false,readyReg = /^complete|loaded|interactive/;
    function privateReady(fn) {
        if (!(Object.prototype.toString.call(fn) == "[object Function]"))return;
        readyCallBack.push(fn);
        if (readyReg.test(dc.readyState) && !!(PXJSFrame.Event.isIE ? dc.documentElement.body : true)) {
            for (var s = 0, lens = readyCallBack.length; s < lens; s += 1) {
                readyCallBack[s]();
                readyCallBack.splice(s, 1);
            }
            return;
        }
        if (isBind)return;
        bindReady(global, dc);
    }
    function bindReady(w, dc) {
        //如果已经绑定了检测DOM完成的监听事件并且为IE低版本浏览器则通过轮询doScroll来检测DOM是否已就绪
        if (dc.documentElement.doScroll && w.frameElement === null)
            (function () {
                try {
                    dc.documentElement.doScroll("left");
                } catch (ex) {
                    setTimeout(arguments.callee, 1);
                    return;
                }
                fireReadyEvent();
            })();
        var _event = PXJSFrame.Event;
        var evtType = _event.isIE ? "readystatechange" : "DOMContentLoaded";
        _event.addEvent(dc, evtType, function () {
            if (_event.isIE && !(dc.readyState == "complete"))return;
            _event.removeEvent(dc, evtType, arguments.callee, false);
            fireReadyEvent();
        }, false);
        //确保会执行队列里面的事件回调函数
        //_event.addEvent(w, 'load', fireReadyEvent, false);
        isBind = true;
    }
    //触发domReady事件
    function fireReadyEvent() {
        var i = 0, fn;
        while (fn = readyCallBack[i]) {
            fn();
            readyCallBack.splice(i,1);
            i++;
        }
    }
    return privateReady;
})(window,document);

/* 获取Dom元素 */
PXJSFrame.createNamespace("Dom");
PXJSFrame.DOM = (function (dc){
    var reg = /^\[object HTML[A-Za-z]+\]$/;
    var _toString = Object.prototype.toString,arr = "[object Array]";
    function privateDomTypeCheck(ele){
        var checkFlag = false;
        if(typeof ele == 'object' && ele) {
            if (_toString.call(ele) == arr || reg.test(_toString.call(ele))) {
                var i = 0, len = ele.length, rs = [];
                if (len) {
                    for (i; i < len; i += 1) {
                        if (!reg.test(_toString.call(ele[i]))) {
                            console.log('系統日志:第' + i + '个元素不是Dom元素!');
                            break;
                        }
                    }
                    if(i==len){
                        checkFlag = true;
                    }
                }else if(len===undefined){
                    checkFlag = true;
                }
            }
        }
        return checkFlag;
    }
    function privateGetDom(ele,fn){
        var rs = [];
        if(privateDomTypeCheck(ele)){
            var len = ele.length,result = null;
            if(!len){
                result  = fn(ele);
                if(privateDomTypeCheck(result)){
                    rs = rs.concat(result);
                }
            }
            for(var i=0;i<len;i++){
                result = fn(ele[i]);
                if(privateDomTypeCheck(result)){
                    rs = rs.concat(result);
                }
                ele[i] = null;
            }
        }
        return rs;
    }
    //获取ele元素同级的下一个元素
    function getNext(ele) {
        return privateGetDom(ele,function(data){
            var nextNode = data.nextSibling;
            while(nextNode&&nextNode.nodeType!==1){
                nextNode = nextNode.nextSibling;
            }
            return nextNode;
        });
    }
    //获取ele元素同级的上一个元素
    function getPrev(ele){
        return privateGetDom(ele,function(data){
            var prevNode = data.previousSibling;
            while(prevNode&&prevNode.nodeType!==1){
                prevNode = prevNode.previousSibling;
            }
            return prevNode;
        });
    }
    //获取ele元素后面与ele元素同级的所有元素
    function getNextAll(ele){
        return privateGetDom(ele,function(data){
            var nextNode = data.nextSibling,rs=[];
            while(nextNode&&nextNode.nodeType===1){
                rs.push(nextNode);
                nextNode = nextNode.nextSibling;
            }
            return rs;
        });
    }
    //获取ele元素前面与ele元素同级的所有元素
    function getPrevAll(ele){
        return privateGetDom(ele,function(data){
            var nextNode = data.previousSibling,rs=[];
            while(nextNode&&nextNode.nodeType===1){
                rs.push(nextNode);
                nextNode = nextNode.previousSibling;
            }
            return rs;
        });
    }
    //在tar元素后面添加newObj节点
    function after(tar,newObj){
        privateGetDom(tar,function(data){
            var parent = data.parentNode;
            if(parent.lastChild==data){
                parent.appendChild(newObj);
            }else{
                parent.insertBefore(newObj,data.nextSibling);
            }
        });
    }
    //在tar元素前面添加newNode节点
    function before(tar,newObj){
        privateGetDom(tar,function(data){
            var parent = data.parentNode;
            parent.insertBefore(newObj,data);
        });
    }
    //通过class类名获取dom元素
    function getElesByClass(context,className){
        if(!className)return [];
        var dc = (context&&typeof context == 'object')?context:dc;
        var list = dc.getElementsByTagName('*'),rs = [];
        var regStr = className.split(',').join('|');
        var reg  = new RegExp(regStr);
        for(var i= 0,len=list.length;i<len;i+=1){
            if(list[i].nodeType===1&&reg.test(list[i].className)){
                rs.push(list[i]);
            }
        }
        return rs;
    }
    //获取ele的css属性名为name对应的属性值
    function getStyle(ele,name){
        if(privateDomTypeCheck(ele)){
            if(ele.style){
                return "getComputedStyle" in window?window.getComputedStyle(ele,false)[name]:ele.currentStyle[name];
            }
        }
        return "";
    }
    //获取元素节点的文本
    function getText(ele){
        if(privateDomTypeCheck(ele)){
            return (typeof ele.textContent=='string')?ele.textContent:ele.innerText;
        }else{
            return "";
        }
    }
    //设置ele元素显示
    function show(ele){
        privateGetDom(ele,function(tdata){
            tdata.style.display = "block";
        });
    }
    //设置ele元素隐藏
    function hide(ele){
        privateGetDom(ele,function(tdata){
            tdata.style.display = "none";
        });
    }
    //根据id获取元素
    function getById(id){
        return dc.getElementById(id);
    }
    //根据标签名获取元素
    function getByTagName(context,tagName){
        if(arguments.length==1){
            tagName = arguments[0];
            context = null;
        }
        if(context&&!privateDomTypeCheck(context)){
            throw new Error(context+" is not a legal element!");
        }
        dc = context||dc;
        return dc.getElementsByTagName(tagName);
    }
    return {
        nextEle:getNext,
        prevEle:getPrev,
        nextAllEle:getNextAll,
        prevAllEle:getPrevAll,
        after:after,
        before:before,
        getElesByClass:getElesByClass,
        getStyle:getStyle,
        show:show,
        hide:hide,
        getById:getById,
        getByTagName:getByTagName,
        getText:getText
    };
})(window.document||window.document.documentElement);