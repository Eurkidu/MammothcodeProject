/**
 * Created by wind on 2016/3/24.
 *
 /**
 *  Author: Hu
 * Update: 2016-3-23
 * Version: 1
 * [McVerify.FormGetData表单提交检查,McVerify.FormSetData设置表单数据]
 * HTML:
 表单包裹父容器要有一个标识,将要作为参数传递
 表单子元素必须含有mc-name,,mc-name指定提交的属性名或要设置的属性名,自定义mc-type指定类型(如果指定了int还有两个可选属性,mc-max和mc-min指定整数的最大值和最小值):如果指定了mc-must,则代表该项是必填元素(请给mc-must赋用户没填时的错误关键信息,如邮箱/地址)
 *JS调用示例
 *  *1.
 *  McVerify.FormGetData( '#formSubmit',exopt,function(){})  //从前到后依次为表单父容器,拓展验证(可选),回调函数(可选,如果没有回调函数返回的是data或者null)
 *  var exopt=//数组形式
 [
 //第一个拓展
 {name:'address',
     cont:{
              verify: function (val) {
                  reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,5}$/;
 return reg.test(val)
 },
 msg: function () {
                         return "地址错误";
                     }
 }
 },
 //第二个拓展
 {name:'222',
     cont:{
              verify: function (val) {
                  reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,5}$/;
 return reg.test(val)
 },
 msg: function () {
                         return "地址错误";
                     }
 }
 }

 ]
 *
 * 2.
 *    McVerify.FormSetData( '#formSubmit', data, function () { console.log('设置成功') });//从前到后依次为表单父容器,data(要传入的数据对象),回调函数(可选)
 *

 */

var McVerify = {};
McVerify.FormGetData = function (wrap, exopt, fn) {
    var callBackFn = fn;//回调函数
    var $wrap = $(wrap);
    var $formItem = $wrap.find('[mc-name]');
    var itemVal = '';
    var data = {};
    var err = '';
    //正则对象obj
    var valiReg = {
        "int": /^\+?[1-9][0-9]*$/,
        "+int": /^\+?[1-9][0-9]*$/,
        '-int': /^\-[1-9][0-9]*$/,
        'float': /^(-?\d+)(\.\d+)?/,
        '+float': /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/,
        '-float': /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/,
        'ip': /^(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])$/,
        'email': /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,5}$/,
        'phone': /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/,
        'mobile': /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
    }
    //验证消息obj
    var valiType = {
        "int": "请输入正确的整数",
        "+int": "请输入正确的正整数",
        '-int': '请输入正确的负整数',
        'float': '请输入正确的正浮点数',
        '+float': '请输入正确的正浮点数',
        '-float': '请输入正确的负浮点数',
        'ip': 'IP地址有误',
        'email': '电子邮件地址有误',
        'phone': '电话号码有误',
        'mobile': '手机号码有误'
    }
    //验证底层函数
    var validata = {
        base: {
            verify: function (reg, val) {
                return reg.test(val);
            },
            msg: function (type) {
                return valiType[type];
            }
        },
        extend: {}
    }
    //验证函数
    function varify(type, val) {
        if (val === null || val === "") return true; //应该调用是否必填函数判断
        var result = true;
        reg = valiReg[type];
        if (reg) {
            //基础
            var baseType = validata.base;
            result = baseType.verify(reg, val);
            if (!result) {
                McVerify.Error(baseType.msg(type));
            }
        }
        else {
            //扩展
            var extendType = validata.extend[type];
            if (extendType) {
                var verifyfun = extendType.verify;
                typeof verifyfun === "function" && (result = verifyfun(val));
                if (!result) {
                    McVerify.Error(typeof extendType.msg === "function" && extendType.msg());
                }
            }
        }
        return result;
    }
    validata.extend.email = {
        verify: function (val) {
            reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,5}$/;
            return reg.test(val)
        },
        msg: function () {
            return "电子邮件地址有误";
        }
    }
    if (exopt) {
        for (var i = 0; i < exopt.length; i++) {
            validata.extend[exopt[i].name] = exopt[i].cont;
        }
    }
    //检测值
    var valCheck = function (must, type, str) {//分别代表可选,种类,值
        if (!varify(type, str)) {
            return false;
        }
        if (!str) {
            if (must) {
                if (must == "0") {
                    console.info("你好像忘记对mc-must赋值了?");
                    return false;
                }
                else {
                    McVerify.Error(must + "必填");
                    return false;
                }
            }
            else {
                itemVal = null;
                return true;
            }
        }
        else {
            return err;
        }
    };
    //在这里对所有值进行拼接和检错
    var ret = function () {
        var result = true;
        var must;
        $formItem.each(function () {
            //首先判断值的存储容器是什么类型,赋值给itemVal
            var type;
            var max, min;//整数最大值最小值
            var $this = $(this);
            if ($this.attr('mc-must')) {
                must = $this.attr('mc-must');//存储必填错误信息
            }
            else {
                if (typeof ($this.attr('mc-must')) == 'string') {
                    must = "0";
                }
                else {
                    must = false;
                }
            }
            if ($this.attr('mc-max')) {
                max = parseInt($this.attr('mc-max'));
            }
            if ($this.attr('mc-min')) {
                min = parseInt($this.attr('mc-min'));
            }
            type = $this.attr('mc-type');
            var name = $this.attr('mc-name');//存储值的种类
            if ($this.is('input') || $this.is('textarea')) {
                itemVal = $this.val();
            }
            else {
                if ($this.is('img')) {
                    itemVal = $this.attr('src');
                }
                else {
                    itemVal = $this.text();
                }
            }
            var checkRes = valCheck(must, type, itemVal);
            if (checkRes !== false) {//检查值,如果通过验证,进行下一步
                if (type == 'int') {//是整数进行最大最小判断
                    itemVal = parseInt(itemVal);
                    if (max || min) {
                        if (max && min) {
                            if (itemVal <= max & itemVal >= min) {
                                if (data[name]) {
                                    data[name] = data[name] + itemVal;
                                } else {
                                    data[name] = itemVal;
                                }
                            }
                            else {
                                McVerify.Error('输入整数大小错误');
                            }
                        }
                        else {
                            if (max) {
                                if (itemVal <= max) {
                                    if (data[name]) {
                                        data[name] = data[name] + itemVal;
                                    } else {
                                        data[name] = itemVal;
                                    }
                                }
                                else {
                                    McVerify.Error('输入整数大小错误');
                                }
                            }
                            else {
                                if (itemVal >= min) {
                                    if (data[name]) {
                                        data[name] = data[name] + itemVal;
                                    } else {
                                        data[name] = itemVal;
                                    }
                                }
                                else {
                                    McVerify.Error('输入整数大小错误');
                                }
                            }
                        }
                        if (data[name]) {
                            data[name] = data[name] + itemVal;
                        } else {
                            data[name] = itemVal;
                        }
                    }
                    else {
                        if (data[name]) {
                            data[name] = data[name] + itemVal;
                        } else {
                            data[name] = itemVal;
                        }
                    }
                }
                else {
                    if (data[name]) {
                        data[name] = data[name] + itemVal;
                    } else {
                        data[name] = itemVal;
                    }
                }
            }
            else {
                result = false;
                return false;
            }
        });
        return result;
    }
    if (ret()) {
        if (typeof callBackFn == 'function') {
            callBackFn(data);
            return data;
        }
        else {
            McVerify.Error('回调函数类型不是函数,是一个' + typeof callBackFn);
            return data;
        }
        //这里写ajax
    }
    else {
        return null;
        //这里写错误处理
    }
}

McVerify.Error = function (err) {
    console.log(err);
}

McVerify.FormSetData = function (wrap, data, fn) {

    var $wrap = $(wrap);//父容器
    var $formItem = $wrap.find('[mc-name]');//得到子元素
    var $data = data;//传进来的data
    var callBackFn = fn;//回调函数
    var name;
    //然后循环判断item中的mc-name属性是否等于data的name
    var set = function () {
        $formItem.each(function () {
            var $this = $(this);
            name = $this.attr('mc-name');

            if ($data[name]) {
                if ($this.is('input')) {
                    $this.val($data[name]);
                }
                else {
                    if ($this.is('div') || $this.is('textarea')) {
                        $this.html($data[name]);
                    }
                    else {
                        if ($this.is('img')) {
                            $this.attr('src', $data[name]);
                        }
                    }
                }
            }

        });
        if (typeof callBackFn == 'function') {
            callBackFn();
        }
        else {
            return true;
            McVerify.Error('回调函数类型不是函数,是一个' + typeof callBackFn);
        }
    }
    return set();
};

