/**
 * Created by liuxinxin on 2015/4/20.
 */
var PXJSFrame = PXJSFrame||{};
PXJSFrame.Utily = (function(){
    //����ģʽ(singleton)
    //Class inheritance
    function _extend(subClass,superClass){
        var f = function(){};
        f.prototype = superClass.prototype;
        subClass.prototype = new f();
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        if(superClass.prototype.constructor === Object.prototype.constructor){
            //��������Ĺ�����constructorΪ���౾��,��Ϊ���ǲ����ܱ�֤�����constructor����ȷ��
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