;(function(mc) {
    //API 请求地址前缀
    //Mc.Config.AjaxUrl = "/";
    //Mc.Config.AjaxUrl = "/";
    location.href.indexOf('localhost') > -1 ?
        Mc.Config.AjaxUrl = "/" : //本地调试API接口地址
        Mc.Config.AjaxUrl = "/" //线上API接口地址

    //图片上传请求的地址
    //统一测试地址 http://upload.mammothcode.com
    mc.Config.imgUploadUrlPrefix = "/" //图片上传接口地址

    //配置McVerify的Error提示
    McVerify.Error = function (msg) {
        Mc.App.Pop.Tip({
            txtContent: msg
        })
    }

    //#region 配置项
    //开发模式
    mc.DevelopMode = true
    if (mc.DevelopMode === true) {
        console.warn("### DevelopMode On ###")
    }
    //跳过页面进入
    mc.JumpPageEnter = false
    if (mc.JumpPageEnter === true) {
        console.warn("### JumpPageEnter On ###")
    }
    //是否有登录判断
    mc.IsLoginJudge = false
    //是否有pageloading
    mc.IsPageLoading = true
    //#endregion
})(window.Mc || {});

//===== Loading START =====//
//#region 微信风格loading
; (function () {
    //微信loading
    var weLoading = new Mc.Pop.Loading();
    //显示loading
    window.showWeLoading = function () {
        weLoading.show();
    }
    //隐藏loading
    window.closeWeLoading = function () {
        weLoading.hide();
    }
    //延迟隐藏loading
    window.lazyCloseWeLoading = function () {
        setTimeout(function () {
            weLoading.hide();
        }, 300);
    }
})();
//#endregion

//#region 页面Loading
; (function () {
    var $pageLoading = $({})
    $(function () {
        $pageLoading = $("#mc_page_loading")
    })
    //显示loading
    window.showMcPageLoading = function () {
        $pageLoading.show()
    }
    //隐藏loading
    window.closeMcPageLoading = function () {
        $pageLoading.hide()
    }
    //延迟隐藏loading
    window.lazyCloseMcPageLoading = function (callback) {
        setTimeout(function () {
            $pageLoading.hide()
            typeof callback === "function" && callback()
        }, 300);
    }
})();
//#endregion
//===== Loading END =====//

//===== 工具函数 START =====//
//#region 工具函数
//#region localStorage 相关操作
//判断缓存是否可用
; gIsLocalStorageSupported = (window.isLocalStorageSupported = function () {
    var testKey = 'test', storage = window.sessionStorage;
    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        console.log(error);
        console.log("no support local storage");
        return false;
    }
})();

//设置缓存
function setStorage(key, val) {
    var storage = window.localStorage;
    storage && storage.removeItem(key);
    storage && storage.setItem(key, val);
}

//读取缓存
function getStorage(key) {
    var storage = window.localStorage;
    return storage && storage.getItem(key);
}

//删除缓存
function delStorage(key) {
    var storage = window.localStorage;
    storage && storage.removeItem(key);
}
//#endregion

//错误提示信息
window.showTip = function (tipContent, callbackFn) {
    Mc.App.Pop.Tip({
        txtContent: tipContent,
        callback: callbackFn
    });
}

//确认框
window.showConfirm = function (confirmTitle) {
    var def = $.Deferred()
    Mc.Pc.Pop.Dialog({
        wrapClass: "mc-confirm-pop-cotar",
        popHtml: '<div class="mc-pop-content">' + confirmTitle + '</div>',
        leftBtnClass: ' fp confirm-l',
        rightBtnClass: ' fp confirm-r',
        leftBtnCallback: function () {
            def.resolve()
        }
    });
    return def
}

//#region 跳转url处理
window.urlJump = function (url, isReplace) {
    url = url || "/"; //url不存在跳转首页
    if (isReplace === true) {
        window.location.replace(url)
    } else {
        window.location.href = url
    }
}
window.reloadUrl = function () {
    window.location.reload()
}
//#endregion

//#region 去除标签
function removeTag(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    str = str.replace(/ /ig, '');//去掉 
    return str;
}
//#endregion 

/**   
 * 对日期进行格式化，  
 * @param date 要格式化的日期  
 * @param format 进行格式化的模式字符串  
 *     支持的模式字母有：  
 *     y:年,  
 *     M:年中的月份(1-12),  
 *     d:月份中的天(1-31),  
 *     h:小时(0-23),  
 *     m:分(0-59),  
 *     s:秒(0-59),  
 *     S:毫秒(0-999),  
 *     q:季度(1-4)  
 * @return String  
 */
function dateFormat(date, format) {
    date = new Date(date * 1000);
    var map = {
        "M": date.getMonth() + 1, //月份   
        "d": date.getDate(), //日   
        "h": date.getHours(), //小时   
        "m": date.getMinutes(), //分   
        "s": date.getSeconds(), //秒   
        "q": Math.floor((date.getMonth() + 3) / 3), //季度   
        "S": date.getMilliseconds() //毫秒   
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}

//价格处理 - 价格统一处理成2位小数
function moneyHandle(data) {
    return parseFloat(data).toFixed(2);
}

//生成空字符串数组
function genStringArray(nbr, item) {
    var d = [], i = 0;
    for (; i < nbr; i++) d.push(item);
    return d;
}

//转换html
function convertHtmlString(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, "").replace(/\*\/[^\/]+$/, "");
}

//生成guid
function Guid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

//数组填充
function fillArry(arr, nbr) {
    if (arr.length % nbr !== 0) {
        var last = nbr - (arr.length % nbr)
        return arr.concat(genStringArray(last, null))
    }
    return arr
}
//#endregion
//===== 工具函数 END =====//

//======= template 处理函数 START =======//
//#region template 处理函数
//把手机号码处理成中间4位为*号
template.helper('encryptPhone', function (data) {
    data = data + ""; //保证data为字符串
    return data.substring(0, 3) + "****" + data.substring(7, 11);
});

template.helper('removeTag', function (str) {
    return removeTag(str);
});


//日期格式化
template.helper('dateformat', dateFormat);
//价格处理 - 价格统一处理成2位小数
template.helper('moneyHandle', moneyHandle);
//详情长度判断
template.helper('descriptionJudge', function (data) {
    data = data || "";
    if (data.length > 90) {
        return '<div class="expand-wrap"><div class="expand-btn ic-expand" onclick="expandDescription(this)"></div></div>';
    } else {
        return '';
    }
});
//数字小数截断
template.helper('subNumber', function (data, nbr) {
    data = data + "" || ""
    nbr = nbr || "1";
    var dotIndex = data.indexOf(".")
    if (dotIndex !== -1) {
        return data.substring(0, dotIndex + 1 + (nbr >> 0))
    } else {
        return data
    }
})
//多图显示第一张图
template.helper('multImgShowOne', function (data, defaultImg) {
    var configDefaultImg = "/Content/Include/img/text-activity.jpg"
    if (data) {
        typeof data === 'string' && (data = data.split(","))
        return data[0] || defaultImg || configDefaultImg
    } else {
        return defaultImg || configDefaultImg
    }
})
//图片显示缩略图
template.helper('thumb', function (data) {
    //跳过已是缩略图的和微信图片(比如微信头像)
    if (data.indexOf("thumb") > -1 || data.indexOf("wx.qlogo.cn") > -1) {
        return data
    } else {
        var arr = data.split('/');
        arr[arr.length - 1] = 'thumb' + arr[arr.length - 1];
        data = arr.join('/');
        return data
    }
})
//#endregion
//======= template 处理函数 END =======//




