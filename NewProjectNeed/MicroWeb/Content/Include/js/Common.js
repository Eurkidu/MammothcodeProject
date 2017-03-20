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

//#region 用户登录相关操作
; (function () {
    //开发模式下，跳过用户登录
    window.gMemberInfo = null; //全局用户信息

    //#region 配置项
    //前缀
    var prefix = "ProjectName"
    //未登录跳转页面
    var notLoginRedictUrl = "/Home/OauthLoginRegister"
    //获取用户信息请求接口
    var getMemberInfoAjaxUrl = "/Api/Member/MemberGetInfo"
    //不需要登录可以进入的页面
    var allowPageList = [
    ]
    //不需要登录可以进入，但是需要判断登录状态的页面
    var allowEnterNeedJudgePageList = [
    ]
    //#endregion

    //#region 用户登录Token相关操作
    //保存用户登录Token
    window.setMemberToken = function (val) {
        if (gIsLocalStorageSupported) {
            setStorage(prefix + "_UserLoginToken", val)
            return true
        } else {
            return false
        }
    }

    //获取用户登录Token
    window.getMemberToken = function () {
        if (gIsLocalStorageSupported) {
            return getStorage(prefix + "_UserLoginToken")
        } else {
            return false
        }
    }

    //删除用户登录Token
    window.deleteMemberToken = function () {
        if (gIsLocalStorageSupported) {
            delete delStorage(prefix + "_UserLoginToken")
            return true
        } else {
            return false
        }
    }
    //#endregion

    //#region 跳转前url相关操作
    //保存跳转前url
    window.setLoginBackUrl = function (val) {
        if (gIsLocalStorageSupported) {
            setStorage(prefix + "_LoginBackUrl", val)
            return true
        } else {
            return false
        }
    }

    //获取跳转前url
    window.getLoginBackUrl = function () {
        if (gIsLocalStorageSupported) {
            return getStorage(prefix + "_LoginBackUrl")
        } else {
            return false
        }
    }

    //删除跳转前url
    window.deleteLoginBackUrl = function () {
        if (gIsLocalStorageSupported) {
            delete delStorage(prefix + "_LoginBackUrl")
            return true
        } else {
            return false
        }
    }
    //#endregion

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

    //#region 是否需要跳转登录判断逻辑
    //当前页面的url
    var curlocation = window.location
    var curPagePath = curlocation.pathname

    //废弃原来的逻辑
    ////自动关闭loading
    //function autoCloseLoading() {
    //    //如果页面未定义设置自动关闭为false 则自动关闭
    //    $(function () {
    //        if (!(window.autoCloseMcPageLoading === false)) {
    //            lazyCloseMcPageLoading()
    //        }
    //    })
    //}

    //用户已登录操作
    function loginAction(response) {
        window.gMemberInfo = response.data
        //autoCloseLoading()
    }

    //用户未登录操作
    function noLoginAction() {
        //设置登录返回url
        setLoginBackUrl(curlocation.pathname + curlocation.search)
        urlJump(notLoginRedictUrl, true)
    }

    //请求判断用户登录状态
    function judgeMemberLogin(def, doAction) {
        var token = getMemberToken()
        if (token) {
            //showMcPageLoading()
            //请求判断当前用户是否登录
            Mc.Ajax({
                url: getMemberInfoAjaxUrl,
                //async: false,
                success: function (response) {
                    //已经登录Action
                    loginAction(response)
                    def.resolve()
                },
                fail: function (response) {
                    if (doAction === true) {
                        //未登录Action
                        noLoginAction()
                        def.reject()
                    } else {
                        def.resolve()
                        //autoCloseLoading()
                    }
                }
            });
        } else {
            if (doAction === true) {
                //未登录Action
                noLoginAction()
                def.reject()
            } else {
                def.resolve()
                //autoCloseLoading()
            }
        }
    }

    //获取用户登录状态 - 未登录则跳转到登录页
    function getMemberLogin() {
        var def = $.Deferred()
        //无用户登录判断
        if (window.Mc.IsLoginJudge === false) {
            console.warn("### default user login ###")
            return (def.resolve(), def)
        }

        //当前页面是否需要登录
        var needLogin = true
        //当前页面是否需要判断登录状态
        var needJudge = false

        //判断当前页面是否需要登录
        $.each(allowPageList, function (i, val) {
            if (val.toLowerCase() === curPagePath.toLowerCase()) {
                needLogin = false
                return false
            }
        });

        if (needLogin) {
            //判断当前页面是否需要判断登录状态
            $.each(allowEnterNeedJudgePageList, function (i, val) {
                if (val.toLowerCase() === curPagePath.toLowerCase()) {
                    needJudge = true
                    return false
                }
            });
            if (needJudge) {
                judgeMemberLogin(def, false)
            } else {
                judgeMemberLogin(def, true)
            }
        } else {
            def.resolve()
        }
        return def
    }
    //#endregion

    //#region 用户登录相关 - 外部调用函数
    //判断用户是否登录
    window.isMemberLogin = function () {
        if (window.gMemberInfo === null) {
            return false
        } else {
            return true
        }
    }

    //未登录操作
    window.noLoginAction = function () {
        //设置登录返回url
        setLoginBackUrl(curlocation.pathname + curlocation.search)
        urlJump(notLoginRedictUrl)
    }

    ////退出登录
    //window.memberLoginOut = function () {
    //    Mc.Ajax({
    //        url: "/Api/Member/MemberLoginOut",
    //        async: false,
    //        success: function (response) {
    //            var curlocation = window.location
    //            deleteMemberToken()
    //            setLoginBackUrl(curlocation.pathname + curlocation.search)
    //            urlJump(notLoginRedictUrl, true)
    //        },
    //        fail: function (response) {
    //            console.log(response)
    //        }
    //    });
    //}
    //#endregion

    //#region 页面滚动相关
    var gPageScrollTop = 0
    //允许页面滚动（还原滚动位置）
    window.enablePageScroll = function () {
        var $html = $("html")
        var $body = $("body")
        $html.removeClass("no-scroll height-cotar")
        $body.removeClass("no-scroll height-cotar")
        $body.scrollTop(gPageScrollTop)
    }
    //禁止页面滚动
    window.disablePageScroll = function () {
        var $html = $("html")
        var $body = $("body")
        $html.addClass("no-scroll height-cotar")
        gPageScrollTop = $body.scrollTop()
        $body.addClass("no-scroll height-cotar")
    }
    //#endregion

    ; (function (mc, $) {
        //Mc.configPage({
        //    onEnter: function (pageDef, url) {
        //        pageDef.resolve()
        //        return pageDef
        //    }
        //})
        mc.pageConfig = {
            onEnter: function (pageDef, url) { },
            onAfterEnter: function () { }
        }
        mc.configPage = function (config) {
            mc.pageConfig = $.extend(mc.pageConfig, config)
        }
        var pageConfig = {
            onEnter: function (pageDef, url) {
                //[跳过页面进入] 直接进入页面
                if (window.Mc.JumpPageEnter === true) {
                    console.warn("### develop page enter ###")
                    return (pageDef.resolve(), pageDef)
                }
                console.log("### default page enter ###")
                return mc.pageConfig.onEnter(pageDef, url) || (pageDef.reject(), pageDef)
            },
            onAfterEnter: function () {
                console.log("### default page afterEnter ###")
                mc.pageConfig.onAfterEnter.apply(this, arguments)
            }
        }
        function mcPageController() {
            var pageDef = $.Deferred()
            //页面加载成功
            function successLoadPage() {
                if (window.Mc.IsPageLoading !== false) {
                    //关闭页面Loading
                    lazyCloseMcPageLoading(function () {
                        //解除页面禁止滚动
                        $("html").removeClass("no-scroll height-cotar")
                        $("body").removeClass("no-scroll height-cotar")
                    })
                } else {
                    //解除页面禁止滚动
                    $("html").removeClass("no-scroll height-cotar")
                    $("body").removeClass("no-scroll height-cotar")
                }
            }
            //页面加载失败函数
            function failLoadPage() {
                //todo 显示404|500的页面 - 提示页面找不到了返回首页
                console.log("页面加载失败")
                $(function () {
                    $("#mc_page_fail").show()
                })
            }
            //获取url参数
            //todo url 操作类返回对象,可以用该对象获取url所有信息(类似location)但是会把search解析成query对象,存储所有参数,然后会有对应的url操作方法,比如加减参数之类的
            var url = {}
            url.query = (function (query) {
                var reg = /([^=&\s]+)[=\s]*([^=&\s]*)/g;
                var obj = {};
                while (reg.exec(query)) {
                    obj[RegExp.$1] = decodeURI(RegExp.$2); //解码
                }
                return obj;
            })(window.location.search.substring(1))
            //获取用户登录状态(同步)
            //判断用户是否登录，登录时获取登录用户信息保存到全局 gMemberInfo 变量
            getMemberLogin().then(function () {
                try {
                    //调用pageEnter
                    pageConfig.onEnter(pageDef, url).then(function () {
                        //调用onAfterEnter
                        pageConfig.onAfterEnter.apply(this, arguments)
                        //页面加载成功
                        successLoadPage()
                    }, function () {
                        //页面加载失败
                        failLoadPage()
                    })
                } catch (e) {
                    console.log("%c%s", "color: green;", e)
                    //页面加载失败
                    failLoadPage()
                }
            })
        }
        //环境初始化(H5环境 - 直接JQ主函数)
        $(function () {
            mcPageController()
        })
    })(window.Mc || {}, jQuery);
})();
//#endregion

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

//===== 下拉加载的Loading START =====//
; (function () {
    function downloadLoadingTemplate() {
        var htmlStr = '\
            <div class="inline-loading-wrap hf" ontouchstart="return false;" style="display:none">\
                <div class="spinner-wrap fp">\
                    <div class="preloader-wrapper inline active">\
                        <div class="spinner-layer spinner-blue">\
                            <div class="circle-clipper left">\
                                <div class="circle"></div>\
                            </div><div class="gap-patch">\
                                <div class="circle"></div>\
                            </div><div class="circle-clipper right">\
                                <div class="circle"></div>\
                            </div>\
                        </div>\
                        <div class="spinner-layer spinner-red">\
                            <div class="circle-clipper left">\
                                <div class="circle"></div>\
                            </div><div class="gap-patch">\
                                <div class="circle"></div>\
                            </div><div class="circle-clipper right">\
                                <div class="circle"></div>\
                            </div>\
                        </div>\
                        <div class="spinner-layer spinner-yellow">\
                            <div class="circle-clipper left">\
                                <div class="circle"></div>\
                            </div><div class="gap-patch">\
                                <div class="circle"></div>\
                            </div><div class="circle-clipper right">\
                                <div class="circle"></div>\
                            </div>\
                        </div>\
                        <div class="spinner-layer spinner-green">\
                            <div class="circle-clipper left">\
                                <div class="circle"></div>\
                            </div><div class="gap-patch">\
                                <div class="circle"></div>\
                            </div><div class="circle-clipper right">\
                                <div class="circle"></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="txt-wrap fp">{{text}}</div>\
            </div>';
        return htmlStr;
    }
    //获取编译函数
    var templateCompileFun = template.compile(downloadLoadingTemplate());
    var $downloadLoadingObj = {};
    var indexCount = 1;
    //获取下拉加载loading的html
    window.getDownloadLoadingHtml = function (options) {
        options || (options = {});
        var data = $.extend({
            name: "pageloading" + indexCount,
            text: "载入中.."
        }, options);
        indexCount++;
        $downloadLoadingObj[data.name] = $(templateCompileFun(data));
        return $downloadLoadingObj[data.name];
    }
    //通过载入中添加列表html
    //因为下拉加载还是老版本没有McHook
    window.addListHtml = function (html, name) {
        name = name || "pageloading1"; //默认取第一个
        $downloadLoadingObj[name].before(html);
    }
    //通过载入中清空列表html
    //因为下拉加载还是老版本没有McHook
    window.cleanListHtml = function (name) {
        name = name || "pageloading1"; //默认取第一个
        $downloadLoadingObj[name].siblings().remove();
    }
    //显示下拉加载loading
    window.showDownloadLoading = function (name) {
        name = name || "pageloading1"; //默认取第一个
        $downloadLoadingObj[name] && $downloadLoadingObj[name].show();
    }
    //隐藏下拉加载loading
    window.hideDownloadLoading = function (name) {
        name = name || "pageloading1"; //默认取第一个
        $downloadLoadingObj[name] && $downloadLoadingObj[name].hide();
    }
})();
//===== 下拉加载的Loading END =====//


//===== 下拉加载的NoData START =====//
; (function () {
    function downloadNodataTemplate() {
        var htmlStr = '\
        <div class="nodata-cotar">\
            <div class="pic-cotar"><img src="/Content/Include/img/pic-nodata.png"></div>\
            <div class="txt-cotar">{{text}}</div>\
        </div>';
        return htmlStr;
    }
    //获取编译函数
    var templateCompileFun = template.compile(downloadNodataTemplate());
    //获取下拉加载loading的html
    window.getDownloadNodataHtml = function (data) {
        if (!data) {
            data = {
                text: "暂无数据，请看看别的吧~"
            }
        }
        return templateCompileFun(data);
    }
    //已无更多
    function downloadNoMoreTemplate() {
        var htmlStr = '\
        <div class="no-more-cotar fbox">\
            <i class="hr-line bf1"></i><span class="txt">{{text}}</span><i class="hr-line bf1"></i>\
        </div>';
        return htmlStr;
    }
    //获取编译函数
    var templateCompileFun2 = template.compile(downloadNoMoreTemplate());
    //获取下拉加载loading的html
    window.getDownloadNoMoreHtml = function (data) {
        if (!data) {
            data = {
                text: "已无更多"
            }
        }
        return templateCompileFun2(data);
    }
})();
//===== 下拉加载的NoData END =====//


//===== Step Box START =====//
//#region Step Box
//初始化
(function () {
    $("head").append("<style id='step_box_style'></style>");
    var $stepBoxStyle = $("#step_box_style");
    (window.calBoxSize = function () {
        var ww = $(window).width();
        var styleStr = ".step-box{width:" + ww + "px}";
        $stepBoxStyle.html(styleStr);
    })();
    $(window).on("resize", function () {
        calBoxSize();
    });
})();
//上一步下一步页面
function goStep(step) {
    var $stepBoxWrap = $(".step-box-wrap");
    if (step === 1) {
        $stepBoxWrap.removeClass("step2 step3").addClass("step1");
    } else if (step === 2) {
        $stepBoxWrap.removeClass("step1 step3").addClass("step2");
    } else if (step === 3) {
        $stepBoxWrap.removeClass("step1 step2").addClass("step3");
    }
}
//下一步
function goStepNext() {
    if (getStep() === 1) {
        goStep(2);
    } else if (getStep() === 2) {
        goStep(3);
    }
}
//上一步
function goStepPrev() {
    if (getStep() === 2) {
        goStep(1);
    } else if (getStep() === 3) {
        goStep(2);
    }
}
//获取当前在第几步
function getStep() {
    var $stepBoxWrap = $(".step-box-wrap");
    if ($stepBoxWrap.hasClass("step1")) return 1;
    if ($stepBoxWrap.hasClass("step2")) return 2;
    if ($stepBoxWrap.hasClass("step3")) return 3;
}
//#endregion
//===== Step Box END =====//


//===== 滚动选择框 START =====//
//#region 滚动选择框
$(function () {
    //如果存在mui则注入选择对象
    if (window.mui) {
        //#region 地区选择
        //省市区选择(3级联动)
        window.cityPicker3 = new mui.PopPicker({
            layer: 3
        });
        cityPicker3.setData(cityData3);

        //省市区选择(3级联动)
        window.cityPicker32 = new mui.PopPicker({
            layer: 3
        });
        var cityData32 = jQuery.extend(true, [], cityData3);
        cityData32.unshift({ text: "不限", value: "-1", children: [] });
        cityPicker32.setData(cityData32);

        //省市区选择(2级联动)
        window.cityPicker2 = new mui.PopPicker({
            layer: 2
        });
        var cityData2 = jQuery.extend(true, [], cityData3);
        //cityData2.unshift({ text: "不限", value: "-1", children: [] });
        cityPicker2.setData(cityData2);

        //省市区选择(2级联动)-首页城市选择
        window.cityPicker22 = new mui.PopPicker({
            layer: 2
        });
        var cityData22 = jQuery.extend(true, [], cityData3);
        //cityData22.unshift({ text: "全国", value: "-1", children: [] });
        cityPicker22.setData(cityData22);
        //#endregion

        //性别选择
        window.genderPicker = new mui.PopPicker({
            layer: 1
        });
        genderPicker.setData([
            { value: '1', text: '男' },
            { value: '0', text: '女' }
        ]);


        //#region 日期时间选择
        //日期选择
        window.datePicker = new mui.DtPicker({
            type: "date"
        });

        //日期选择
        window.dateTimePicker = new mui.DtPicker({
            type: "datetime"
        });

        //时间选择
        window.timePicker = new mui.DtPicker({
            type: "time",
            value: "00:00"
        });

        //天时分选择
        window.dayTimePicker = new mui.DtPicker({
            type: "date",
            labels: ["天", "时", "分"],
            customData: {
                y: _.range(0, 8).map(function (v) {
                    return {
                        text: v < 10 ? "0" + v : "" + v,
                        value: v
                    }
                }),
                m: _.range(0, 24).map(function (v) {
                    return {
                        text: v < 10 ? "0" + v : "" + v,
                        value: v
                    }
                }),
                d: _.range(0, 60).map(function (v) {
                    return {
                        text: v < 10 ? "0" + v : "" + v,
                        value: v
                    }
                })
            }
        });
        //#endregion

        //#region 数量选择
        var nbrArr = [
            { value: '0', text: '0' },
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: '3', text: '3' },
            { value: '4', text: '4' },
            { value: '5', text: '5' },
            { value: '6', text: '6' },
            { value: '7', text: '7' },
            { value: '8', text: '8' },
            { value: '9', text: '9' }
        ];
        var nbrArr2 = [
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: '3', text: '3' },
            { value: '4', text: '4' },
            { value: '5', text: '5' },
            { value: '6', text: '6' },
            { value: '7', text: '7' },
            { value: '8', text: '8' },
            { value: '9', text: '9' }
        ];
        window.numberPicker2 = new mui.PopPicker({
            layer: 2
        });
        numberPicker2.setData([
            {
                value: '0', text: '0',
                children: nbrArr2
            },
            {
                value: '1', text: '1',
                children: nbrArr
            },
            {
                value: '2', text: '2',
                children: nbrArr
            },
            {
                value: '3', text: '3',
                children: nbrArr
            },
            {
                value: '4', text: '4',
                children: nbrArr
            },
            {
                value: '5', text: '5',
                children: nbrArr
            },
            {
                value: '6', text: '6',
                children: nbrArr
            },
            {
                value: '7', text: '7',
                children: nbrArr
            },
            {
                value: '8', text: '8',
                children: nbrArr
            },
            {
                value: '9', text: '9',
                children: nbrArr
            }
        ]);
        //#endregion
    }
});
//#endregion
//===== 滚动选择框 END =====//



