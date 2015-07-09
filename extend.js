/**
 * Created by liuxinxin on 2015/4/20.
 */
var PXJSFrame = PXJSFrame||{};
PXJSFrame.Utily = (function(){
    //单体模式(singleton)
    //Class inheritance
    function _extend(subClass,superClass){
        var f = function(){};
        f.prototype = superClass.prototype;
        subClass.prototype = new f();
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        if(superClass.prototype.constructor === Object.prototype.constructor){
            //修正父类的构造器constructor为父类本身,因为我们并不能保证超类的constructor的正确性
            superClass.prototype.constructor = superClas;
        }
    }
    // Prototype inheritance
    function _clone(superClass){
        var f = function(){};
        f.prototype = superClass;
        return new f;
    }
    return {
        extend:_extend,
        clone:_clone
    };
}());