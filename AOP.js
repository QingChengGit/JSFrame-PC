/**
 * Created by Administrator on 2015/8/17.
 */
/**
 * @desc
 *
 * AOP面向切面编程(该思想的本质就是为了将软件领域中的业务逻辑和一些通用化功能分离，
 * 从而使开发人员只用专心关注业务逻辑的实现，而不用分心在那些跟业务逻辑无关的代码
 * 上，且降低了业务逻辑模块跟通用功能模块之间的耦合度，提高了程序的健壮性和可维护
 * 性。)
 *
 * @param beforeFn
 * @returns {Function}
 */
define('AOP',function(){
    Function.prototype.before = function(beforeFn){
        var self = this;
        /*
         进行AOP织入(即在原函数也就是业务逻辑处理函数之前织入前置通用功能处理函数
         beforeFn)，并返回包含了原函数和进行通用功能处理的前置处理函数的新"代理函数"
         */
        return function(){
            beforeFn.apply(this,arguments);//前置切入点
            return self.apply(this,arguments);//业务逻辑处理函数
        };
    };
    Function.prototype.after = function(afterFn){
        var self = this;
        return function(){
            var ret = self.apply(this,arguments);
            afterFn.apply(this,arguments);//后置切入点
            return ret;
        };
    };
});
//调用示例
require(['AOP'],function(){
    var test = function(){
        //业务逻辑处理函数只需专心处理业务逻辑，不需要关系通用功能处理
        console.log('进行业务逻辑处理');
    };
    test = test.before(function(){
        console.log('进行前置通用逻辑处理');
    }).after(function(){
        console.log('进行后置通用逻辑处理');
    });
    test();
    //执行后将会输出如下:
    进行前置通用逻辑处理
    进行业务逻辑处理
    进行后置通用逻辑处理
});