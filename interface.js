/**
 * Created by liuxinxin on 2015/5/28.
 */
/** js 接口 **/
(function(g){
    var toString = Object.prototype.toString;
    var isObject = function(o){return toString.call(o)==='[object Object]';};
    var isFunction = function(o){return toString.call(o)==='[object Function]';};
    var myInterface ={},_interface = function(name,methods){this.name=name;this.methods=methods;};
    myInterface.createInterface=function(name,methods){
        return new _interface(name,methods);
    };
    myInterface.isImpledInterface=function(obj,interfaceObj){
        if(isObject(obj)||isFunction(obj)){
            if(interfaceObj instanceof _interface){
                var methods = interfaceObj.methods;
                if(!methods.length)return false;
                for(var i = 0,len  = methods.length;i<len;i+=1){
                    var m = null;
                    if(isObject(obj)){
                        //obj为对象常量
                        m = obj[methods[i]];
                    }else{
                        //如果obj为function
                        m = obj[methods]||new obj()[methods]||obj.prototype[methods[i]];
                    }
                    if(!(m&&isFunction(m))){
                        new Error('interface method:'+methods[i]+' has not be implement!');
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    };
    g.PXInterface = myInterface;
})(this);
