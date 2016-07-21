//MammothcodeCoreJsLib
//Version 0.2.7.5
//Date 2016年6月13日17:33:09
//Edit Zero

//======= namespacep START=======//
var Mc = {}; //曼码JsLib
Mc.App = {}; //移动端类
Mc.App.Pop = {}; //弹出层(移动端)
Mc.Pc = {}; //Pc端类
Mc.Pc.Calendar = {} //日历类
Mc.Pc.Pop = {}; //弹出层(PC端)
Mc.Util = {}; //工具类(公共类)
Mc.Util.Check = {}; //表单验证类
Mc.Util.Date = {}; //日期时间类
Mc.Util.String = {}; //字符串类
Mc.Util.Uri = {}; //uri类
Mc.Global = {}; //全局对象
Mc.Pop = {}; //弹出层
//======= namespace END =======//

/**
 * ajax 数据请求
 * version 1.3
 * Update 2016年4月5日01:06:43
 * Author Zero
 */
Mc.Global.mc_isAjax = [];
Mc.Config = {};
Mc.Config.AjaxUrl = "";
Mc.Ajax = function (options) {
    var settings = $.extend({
        id: new Date().getTime(), //ajax的id
        hasLoading: false, //是否有loading
        confirmTitle: false, //是否有确认框
        url: "",
        data: {},
        type: "post",
        async: true,
        success: function () { }, //请求成功回调 [resultData, msg, textStatus]
        fail: function () { }, //请求失败回调 [errorMsg, msg, textStatus]
        beforeSend: function () { }
    }, options);
    function ajax() {
        $.ajax({
            url: Mc.Config.AjaxUrl + settings.url,
            data: settings.data,
            type: settings.type,
            async: settings.async,
            success: function (response, textStatus) {
                settings.hasLoading && closeWeLoading();
                Mc.Global.mc_isAjax[settings.id] = false;
                if (response.issuccess) { //返回数据
                    settings.success.call(this, response, textStatus);
                } else { //请求失败
                    settings.fail.call(this, response, textStatus);
                }
            },
            beforeSend: function () {
                settings.hasLoading && showWeLoading();
                Mc.Global.mc_isAjax[settings.id] = true;
                settings.beforeSend.call(this);
            }
        });
    }
    Mc.Global.mc_isAjax[settings.id] || (Mc.Global.mc_isAjax[settings.id] = false);
    if (!Mc.Global.mc_isAjax[settings.id]) {
        if (settings.confirmTitle) {
            Mc.Pc.Pop.Dialog({
                wrapClass: "confirm-pop-cotar",
                popHtml: '<div class="pop-confirm">' + settings.confirmTitle + '</div>',
                leftBtnClass: 'fp confirm-l',
                rightBtnClass: 'fp confirm-r',
                leftBtnCallback: function() {
                    ajax();
                }
            });
        } else {
            ajax();
        }
    }
}

//=== Js 原生扩展 START ===//

//=== Js 原生扩展 END ===//

//=== JQuery 扩展 START ===//
/**
 * jQuery ajax 重写
 * version 1.1
 * Update 2015年11月19日09:47:28
 * Author Zero
 */
/*(function ($) {
    // 备份jquery的ajax方法
    var _ajax = $.ajax;
    // 重写ajax方法
    $.ajax = function (opt) {
        var _success = opt && opt.success || function (a, b) { };
        var _fail = opt && opt.fail || function (a, b) { };
        var _opt = $.extend(opt, {
            success: function (json, textStatus) {
                var data = JSON.parse(json);
                var resultData = JSON.parse(data.response.result);
                if (data.response.state == "success") { //返回数据
                    _success(resultData, textStatus);
                } else if (data.response.state == "jump") { //重定向
                    window.location.href = resultData.uri;
                    return;
                } else if (data.response.state == "fail") { //请求失败
                    _fail(data.response.msg, resultData);
                }
            }
        });
        _ajax(_opt);
    };
})(jQuery);*/
/**
 * 倒计时
 * version 1.0
 * Author Zero
 */
; (function ($) {
    var td = {
        index: 0, //定时器index
        isStart: [], //倒计时是否开始
        interValObj: [], //倒计时的定时器对象
        //初始化
        init: function (obj, args) {
            return (function () {
                td.start(obj, args);
            })();
        },
        //开始倒计时
        start: function (obj, args) {
            var index = td.index;
            if (!td.isStart[index]) {
                td.isStart[index] = true;
                if (typeof (args.startCallback) == "function") args.startCallback(); //开始节点回调函数
                td.interValObj[index] = window.setInterval(function () {
                    if (args.fixTime <= 0) {
                        window.clearInterval(td.interValObj[index]);
                        obj.html(args.defaultTxt);
                        if (typeof (args.endCallback) == "function") args.endCallback(); //结束节点回调函数
                        td.isStart[index] = false;
                    } else {
                        args.fixTime--;
                        obj.html(td.format(args));
                    }
                }, 1000);
                td.index++;
            }
        },
        //格式化
        format: function (args) {
            var sec = new Date(parseInt(args.fixTime) * 1000).getTime();
            var d = parseInt(sec / 1000 / 60 / 60 / 24);
            var H = parseInt(sec / 1000 / 60 / 60 % 24);
            var m = parseInt(sec / 1000 / 60 % 60);
            var s = parseInt(sec / 1000 % 60);
            var format = args.timeFormat;
            if (/(d+天).*?(H+时).*?(m+分).*?(s+秒)/.test(format)) {
                format = format.replace(RegExp.$1, d == 0 ? "" : d + "天");
                format = format.replace(RegExp.$2, H == 0 ? "" : H + "时");
                format = format.replace(RegExp.$3, m == 0 ? "" : m + "分");
                format = format.replace(RegExp.$4, s == 0 ? "" : s + "秒");
            }
            return format;
        }
    }
    $.fn.timeCountDown = function (options) {
        var args = $.extend({
            fixTime: 60, //时间
            timeFormat: "dd天HH时mm分ss秒", //计时格式化字符串
            //timeFormat: "yyyy年MM月dd天HH时mm分ss秒", //计时格式化字符串
            startCallback: function () { }, //开始倒计时回调函数
            endCallback: function () { }, //结束倒计时回调函数
            defaultTxt: "倒计时已结束" //默认显示文字
        }, options);
        td.init(this, args);
    };
})(jQuery);
/**
 * 下拉分页
 * version 1.4
 * Update 2015年11月14日16:01:53
 * Author Zero
 */
; (function ($) {
    //dl 为 dropLoad缩写
    var dl = {
        dlData: null,
        //获取参数
        getArgs: function (obj) {
            dl.dlData = $(obj).prop("dl"); //获取参数
        },
        //初始化
        init: function (obj, args) {
            return (function () {
                $(obj).prop("dl", { //初始化参数
                    isAjax: false, //是否正在ajax
                    pageIndex: 0, //当前页码
                    loadedItem: null, //所有加载项
                    lastItem: null //已加载项的最后一项
                });
                dl.getArgs(obj); //获取参数
                if (args.isLoadFirst) { //如果要自动加载第一页
                    dl.ajaxNewData(obj, args, 0); //加载第一页数据
                } else {
                    dl.dlData.pageIndex = 1; //默认已加载完成第一页
                }
                if (args.touchOptimize) { //如果启用触屏优化则添加touchmove事件
                    //移动端,touchmove事件
                    $(args.scrollItem).off('touchmove').on('touchmove', function () {
                        dl.pageDown(obj, args);
                    });
                }
                //PC端,scroll事件
                $(args.scrollItem).off('scroll').on('scroll', function () {
                    dl.pageDown(obj, args);
                });
                dl.dlData.loadedItem = obj.find(args.loadItem); //选中所有已加载项
                dl.dlData.lastItem = dl.dlData.loadedItem.eq(dl.dlData.loadedItem.length - 1); //选中初始的已经加载项的最后一项
            })();
        },
        //滚动下拉触发事件
        pageDown: function (obj, args) {
            //如果没有进行中的请求并且符合[触发条件]则请求
            if (!dl.dlData.isAjax) {
                //[触发条件]如果最后一项存在并且最后一项显示在页面中则请求
                if (dl.dlData.lastItem && dl.dlData.lastItem.offset().top + dl.dlData.lastItem.height() - $(window).scrollTop() < $(window).height()) {
                    dl.dlData.isAjax = true; //改变标记变量值(防止多重请求)
                    var loadNumber = dl.dlData.loadedItem.length; //已加载项总数
                    dl.dlData.pageIndex = Math.ceil(loadNumber / args.pageSize) + 1; //计算当前页码
                    dl.ajaxNewData(obj, args, loadNumber);
                }
            }
        },
        //请求新的数据
        //loadNumber 已加载项总数
        ajaxNewData: function (obj, args, loadNumber) {
            $.ajax({
                type: args.type,
                url: args.url,
                data: $.extend({
                    "pageSize": args.pageSize, //分页数
                    "pageIndex": dl.dlData.pageIndex //当前页页码
                }, args.data),
                async: args.async,
                success: function (result) {
                    result = JSON.parse(result);
                    args.success.call(obj, result.data); //success回调
                    dl.dlData.loadedItem = obj.find(args.loadItem); //选中所有已加载项
                    dl.dlData.lastItem = dl.dlData.loadedItem.eq(dl.dlData.loadedItem.length - 1); //更新最后一项
                    if (result.allCount <= loadNumber) {
                        //如果没有更多
                        dl.dlData.isAjax = true;
                        args.noMore.call(obj, result); //noMore回调
                    } else {
                        //还有更多
                        dl.dlData.isAjax = false;
                    }
                },
                beforeSend: function () {
                    dl.dlData.isAjax = true;
                    args.beforeSend.call(obj); //beforeSend回调
                }
            });
        }
    }
    $.fn.dropDownLoad = function (options) {
        var args = $.extend({
            scrollItem: document,
            loadItem: "li", //加载项选择器
            pageSize: 15, //分页数
            isLoadFirst: false, //是否自动加载第一页
            touchOptimize: false, //触屏优化
            //ajax参数封装
            type: "post",
            async: true,
            url: "", //请求的url
            data: {}, //控制器参数
            success: function () { },
            beforeSend: function () { },
            noMore: function () { }
        }, options);
        dl.init(this, args);
        dl.obj = this;
    }
})(jQuery);

/**
 * 下拉分页V2
 * version 1.0
 * Update 2016年3月12日14:07:32
 * Author Zero
 */
Mc.DropDownLoad = function (options) {
    var args = $.extend({
        scrollItem: document,
        loadItem: "li", //加载项选择器
        pageSize: 15, //分页数
        isLoadFirst: false, //是否自动加载第一页
        touchOptimize: false, //触屏优化
        //ajax参数封装
        type: "post",
        async: true,
        url: "", //请求的url
        data: {}, //控制器参数
        noMoreJudge: function (result, loadNumber) { return result.total <= loadNumber }, //没有更多的判断函数 [result:返回值, loadNumber:已加载的个数] [true: 没有更多, false: 还有更多]
        success: function () { },
        beforeSend: function () { },
        noMore: function () { }
    }, options);

    var _this = this;

    //dl 为 dropLoad缩写
    var dl = {
        dlData: null,
        //获取参数
        getArgs: function () {
            dl.dlData = _this.dlData; //获取参数
        },
        //更新数据
        updateData: function (obj, args) {
            var $loadedItem = obj.find(args.loadItem); //选中所有已加载项
            dl.dlData.loadedItemLength = $loadedItem.length;
            $loadedItem.length && (dl.dlData.lastItem = $loadedItem.eq(dl.dlData.loadedItemLength - 1)); //更新最后一项
        },
        //初始化
        init: function (obj, args) {
            return (function () {
                dl.initData(); //初始化内部属性
                dl.loadFirst(obj, args); //加载第一页数据
                dl.bindEvent(obj, args); //绑定触发事件
                //dl.updateData(obj, args); //初始化参数
            })();
        },
        //初始化内部属性
        initData: function () {
            if (!_this.dlData) {
                _this.dlData = {
                    //初始化参数
                    isAjax: false, //是否正在ajax
                    pageIndex: 1, //当前页码
                    loadedItemLength: null, //所有已载项的个数
                    lastItem: null //已加载项的最后一项
                }
                dl.getArgs(); //获取参数
            }
        },
        //加载第一页数据
        loadFirst: function (obj, args) {
            if (args.isLoadFirst) { //如果要自动加载第一页
                dl.ajaxNewData(obj, args, 0); //加载第一页数据
            } else {
                dl.dlData.pageIndex = 2; //默认已加载完成第一页
            }
            dl.updateData(obj, args); //初始化参数
        },
        //绑定触发事件
        bindEvent: function (obj, args) {
            if (args.touchOptimize) { //如果启用触屏优化则添加touchmove事件
                //移动端,touchmove事件
                $(args.scrollItem).off('touchmove').on('touchmove', function () {
                    dl.pageDown(obj, args); //下拉事件
                });
            }
            //PC端,scroll事件
            $(args.scrollItem).off('scroll').on('scroll', function () {
                dl.pageDown(obj, args); //下拉事件
            });
        },
        //滚动下拉触发事件
        pageDown: function (obj, args) {
            //如果没有进行中的请求并且符合[触发条件]则请求
            if (!dl.dlData.isAjax) {
                //[触发条件]如果最后一项存在并且最后一项显示在页面中则请求
                if (dl.dlData.lastItem && dl.dlData.lastItem.offset().top + dl.dlData.lastItem.height() - $(window).scrollTop() < $(window).height()) {
                    dl.dlData.isAjax = true; //改变标记变量值(防止多重请求)
                    var loadNumber = dl.dlData.loadedItemLength; //已加载项总数
                    dl.dlData.pageIndex = Math.ceil(loadNumber / args.pageSize) + 1; //计算当前页码
                    dl.ajaxNewData(obj, args);
                }
            }
        },
        //请求新的数据
        ajaxNewData: function (obj, args, returnData) {
            var ajaxDef = $.Deferred();
            Mc.Ajax({
                type: args.type,
                url: args.url,
                data: $.extend({
                    "pageSize": args.pageSize, //分页数
                    "pageIndex": dl.dlData.pageIndex //当前页页码
                }, args.data),
                async: args.async,
                success: function (result) {
                    //result = JSON.parse(result);
                    //判断是否为返回数据
                    if (returnData) {
                        dl.dlData.isAjax = false;
                        ajaxDef.resolve(result);
                    } else {
                        if (args.noMoreJudge(result, dl.dlData.loadedItemLength)) {
                            //如果没有更多
                            dl.dlData.isAjax = true;
                            args.noMore.call(obj, result); //noMore回调
                        } else {
                            //还有更多
                            dl.dlData.isAjax = false;
                        }
                        args.success.call(obj, result); //success回调
                        dl.updateData(obj, args); //更新参数
                    }
                },
                beforeSend: function () {
                    dl.dlData.isAjax = true;
                    args.beforeSend.call(obj); //beforeSend回调
                }
            });
            return ajaxDef;
        }
    }
    /**
     * 初始化函数
     * @param {} obj 列表的jQuery选择器
     * @param {} options 可重设options
     * @returns {}
     */
    _this.init = function (target, options) {
        options && options.data && (options.data = $.extend(args.data, options.data)); //如果options有data对象先混合data对象
        args = $.extend(args, options);
        dl.init($(target), args);
    }
    /**
     * 使用Mc.dropDownLoad之前对象定义的参数请求数据并通过Deferred对象返回数据
     * @param {} options 可重设options
     * @returns {}
     */
    _this.ajaxData = function (options) {
        var def = $.Deferred();
        options && options.data && (options.data = $.extend(args.data, options.data)); //如果options有data对象先混合data对象
        args = $.extend(args, options);
        dl.initData(); //初始化内部属性
        dl.ajaxNewData(this, args, true).then(function (result) {
            def.resolve(result);
        });
        return def;
    };
}

/**
 * @name 下拉分页Hook
 * @description 下拉分页钩子函数,绑定下拉事件,触发回调
 * @version 1.0
 * @author Zero
 * Create Date 2016年4月1日13:29:47
 * Modified By Zero
 * Modified Date 2016年6月13日17:32:38
 * @returns {} 
 */
Mc.DropDownHook = function (options) {
    var args = $.extend({
        $scrollItem: $(document), //绑定滚动事件的jQ对象
        $targetList: $({}), //列表的jQ对象
        touchOptimize: false //触屏优化
    }, options);

    //#region 内部变量
    var $this = $(this);
    //触发元素
    var $hook = $({});
    //是否禁用
    var isDisable = false;
    //数据转储对象
    var transferData = {};
    //#endregion

    //#region get/set
    function getData() {
        return transferData;
    }
    function setData(newData) {
        transferData = newData;
    }
    //#endregion

    //#region 内部函数
    //构造钩子
    function genHook() {
        var hookId = "mc_hook" + new Date().getTime();
        var hookHtml = '<div id="' + hookId + '" class="mc-hook"></div>';
        args.$targetList.append(hookHtml);
        $hook = $("#" + hookId); //获取钩子
    }
    //下拉事件
    function pageDown() {
        //如果没有禁用并且符合[触发条件]则触发回调
        if (!isDisable) {
            //[触发条件]如果钩子存在并且钩子显示在页面中则请求,触发区域大小10,离底部10px位置
            if ($hook.length && $hook.offset().top - $(window).scrollTop() < $(window).height() + 10) {
                $this.trigger("hook", getData());
            }
        }
    }
    //绑定事件
    function bindEvent() {
        if (args.touchOptimize) { //如果启用触屏优化则添加touchmove事件
            //移动端,touchmove事件
            args.$scrollItem.off('touchmove').on('touchmove', function () {
                pageDown(); //下拉事件
            });
        }
        //PC端,scroll事件
        args.$scrollItem.off('scroll').on('scroll', function () {
            pageDown(); //下拉事件
        });
    }
    //初始化钩子
    function iniHook() {
        genHook(); //构造钩子
        bindEvent(); //绑定事件
    }
    //#endregion

    //#region API
    //初始化钩子
    this.iniHook = function () {
        iniHook();
    }
    //禁用
    this.disable = function () {
        isDisable = true;
    }
    //启用
    this.enable = function () {
        isDisable = false;
    }
    //设置数据
    this.setData = function (newData) {
        setData(newData);
    }
    //添加列表内容
    this.add = function (html) {
        $hook.before(html);
    }
    //清空列表内容
    this.clean = function() {
        $hook.prevAll().remove();
    }
    //赋值jQ对象
    this.$ = $this;
    //#endregion
}

/**
 * 点击分页
 * version 1.3
 * Update 2015年11月24日00:05:50
 * Author Zero
 */
; (function ($) {
    var ms = {
        msData: null,
        //获取参数
        getArgs: function (obj) {
            ms.msData = $(obj).prop("ms"); //获取参数
        },
        //初始化
        init: function (obj, args) {
            return (function () {
                $(obj).prop("ms", { //初始化参数
                    isAjax: false, //是否正在ajax
                    pageCount: 0, //总页码数
                    pageIndex: 1 //当前页码
                });
                ms.getArgs(obj); //获取参数
                if (args.isLoadFirst) { //如果要自动加载第一页
                    ms.ajaxNewData(obj, $.extend(args, {
                        async: false
                    })); //加载第一页数据
                } else {
                    ms.msData.pageCount = Math.ceil(args.allCount / args.pageSize); //默认已加载完成第一页,总页数使用参数值
                }
                if (ms.msData.pageCount > 0) { //判断是否有分页
                    ms.fillHtml(obj, { "current": ms.msData.pageIndex, "pageCount": ms.msData.pageCount });
                    ms.bindEvent(obj, args);
                }
            })();
        },
        //填充html
        fillHtml: function (obj, args) {
            return (function () {
                //obj.html('<div class="item fp btn firstPage"><span>首页</span></div>');
                obj.empty();
                //上一页
                if (args.current > 1) {
                    obj.append('<div class="item fp btn prevPage"><span><</span></div>');
                } else {
                    obj.remove('.prevPage');
                    obj.append('<div class="item fp btn disable"><span><</span></div>');
                }
                //中间页码
                if (args.current != 1 && args.current >= 4 && args.pageCount != 4) {
                    obj.append('<div class="item fp tcdNumber"><span>' + 1 + '</span></div>');
                }
                if (args.current - 2 > 2 && args.current <= args.pageCount && args.pageCount > 5) {
                    obj.append('<div class="item fp ellipsis"><span>...</span></div>');
                }
                var start = args.current - 2, end = args.current + 2;
                if ((start > 1 && args.current < 4) || args.current == 1) {
                    end++;
                }
                if (args.current > args.pageCount - 4 && args.current >= args.pageCount) {
                    start--;
                }
                for (; start <= end; start++) {
                    if (start <= args.pageCount && start >= 1) {
                        if (start != args.current) {
                            obj.append('<div class="item fp tcdNumber"><span>' + start + '</span></div>');
                        } else {
                            obj.append('<div class="item fp active"><span>' + start + '</span></div>');
                        }
                    }
                }
                if (args.current + 2 < args.pageCount - 1 && args.current >= 1 && args.pageCount > 5) {
                    obj.append('<div class="item fp ellipsis"><span>...</span></div>');
                }
                if (args.current != args.pageCount && args.current < args.pageCount - 2 && args.pageCount != 4) {
                    obj.append('<div class="item fp tcdNumber"><span>' + args.pageCount + '</span></div>');
                }
                //下一页
                if (args.current < args.pageCount) {
                    obj.append('<div class="item fp btn nextPage"><span>></span></div>');
                } else {
                    obj.remove('.nextPage');
                    obj.append('<div class="item fp btn disable"><span>></span></div>');
                }
                //obj.append('<div class="item fp btn lastPage"><span>尾页</span></div>');
            })();
        },
        //绑定事件
        bindEvent: function (obj, args) {
            obj.off("click");
            return (function () {
                obj.on("click", "div.tcdNumber", function () {
                    var current = parseInt($(this).text());
                    ms.fillHtml(obj, { "current": current, "pageCount": ms.msData.pageCount });
                    if (typeof (args.backFn) == "function") {
                        //args.backFn(current);
                    }
                    ms.msData.pageIndex = current;
                    ms.ajaxNewData(obj, args);
                });
                //上一页
                obj.on("click", "div.prevPage", function () {
                    var current = parseInt(obj.find(".item.active").text());
                    ms.fillHtml(obj, { "current": current - 1, "pageCount": ms.msData.pageCount });
                    if (typeof (args.backFn) == "function") {
                        //args.backFn(current - 1);
                    }
                    ms.msData.pageIndex = current - 1;
                    ms.ajaxNewData(obj, args);
                });
                //下一页
                obj.on("click", "div.nextPage", function () {
                    var current = parseInt(obj.find(".item.active").text());
                    ms.fillHtml(obj, { "current": current + 1, "pageCount": ms.msData.pageCount });
                    if (typeof (args.backFn) == "function") {
                        //args.backFn(current + 1);
                    }
                    ms.msData.pageIndex = current + 1;
                    ms.ajaxNewData(obj, args);
                });
                //首页
                obj.on("click", "div.firstPage", function () {
                    var current = 0;
                    ms.fillHtml(obj, { "current": current + 1, "pageCount": ms.msData.pageCount });
                    if (typeof (args.backFn) == "function") {
                        //args.backFn(current + 1);
                    }
                    ms.msData.pageIndex = current + 1;
                    ms.ajaxNewData(obj, args);
                });
                //尾页
                obj.on("click", "div.lastPage", function () {
                    var current = args.pageCount - 1;
                    ms.fillHtml(obj, { "current": current + 1, "pageCount": ms.msData.pageCount });
                    if (typeof (args.backFn) == "function") {
                        //args.backFn(current + 1);
                    }
                    ms.msData.pageIndex = current + 1;
                    ms.ajaxNewData(obj, args);
                });
            })();
        },
        //请求新的数据
        ajaxNewData: function (obj, args) {
            $.ajax({
                type: args.type,
                url: args.url,
                data: $.extend({
                    "pageSize": args.pageSize, //分页数
                    "pageIndex": ms.msData.pageIndex //当前页页码
                }, args.data),
                async: args.async,
                success: function (result) {
                    ms.msData.pageCount = Math.ceil(result.allCount / args.pageSize);; //获得总页数
                    args.success.call(obj, result); //success回调
                },
                beforeSend: function () {
                    ms.msData.isAjax = true;
                    args.beforeSend.call(obj); //beforeSend回调
                }
            });
        }
    }
    $.fn.createPage = function (options) {
        var args = $.extend({
            allCount: 10, //总数量
            //current: 1, //当前页码
            pageSize: 12, //每页个数
            isLoadFirst: true, //是否自动加载第一页
            //backFn: function () { }, //回调函数
            //ajax参数封装
            type: "post",
            async: true,
            url: "", //请求的url
            data: {}, //控制器参数
            success: function () { },
            beforeSend: function () { }
        }, options);
        ms.init(this, args);
    }
})(jQuery);
//=== JQuery 扩展 END ===//

/**
 * 微信风格loading
 * @version 1.0
 * @author Zero
 * Create Date 2016年4月5日01:39:31
 * @param {} _text 
 * @returns {} 
 */
Mc.Pop.Loading = function (_text) {
    var text = _text || '数据加载中';
    function defaultLoadingTemplate() {
        /*
        <div id="loadingToast" class="weui_loading_toast" style="display:none">
            <div class="weui_mask_transparent"></div>
            <div class="weui_toast">
                <div class="weui_loading">
                    <div class="weui_loading_leaf weui_loading_leaf_0"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_1"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_2"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_3"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_4"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_5"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_6"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_7"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_8"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_9"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_10"></div>
                    <div class="weui_loading_leaf weui_loading_leaf_11"></div>
                </div>
                <p class="weui_toast_content">数据加载中</p>
            </div>
        </div>
        */
    }
    //转换html
    function convertHtmlString(fn) {
        return fn.toString().replace(/^[^\/]+\/\*!?\s?/, "").replace(/\*\/[^\/]+$/, "");
    };
    var popHtml = convertHtmlString(defaultLoadingTemplate);
    $("body").append(popHtml);
    var $popObj = $("#loadingToast");
    //显示载入弹出层 - 对外接口函数
    this.show = function () {
        $popObj.fadeIn(200);
    }
    //移除载入弹出层 - 对外接口函数
    this.remove = function () {
        $popObj.fadeOut(200);
    }
}

/**
 * [Tip - 提示框:弹出一个操作提示,在tip_live时间(单位毫秒)内存在,然后消失,无回调函数]
 * Auther Zero
 * Update 2015.8.4
 * Version 1.4.0
 * [txtContent - 提示文本内容 | 默认 ""]
 * [fadeSpeed - 淡入淡出时间(毫秒) | 默认 200]
 * [tipLive - 提示层生存时间(毫秒) | 默认 2000]
 * @param {} options
 * @returns {}
 */
Mc.App.Pop.Tip = function (options) {
    var settings = $.extend({
        txtContent: "", //提示文本内容 | 默认 ""
        fadeSpeed: 200, //淡入淡出时间(毫秒) | 默认 200
        tipLive: 2000 //提示层生存时间(毫秒) | 默认 2000
    }, options);
    //把当前时间(从1970.1.1开始的毫秒数)给弹出层作为ID标识
    var popId = new Date().getTime();
    var popHtml = function typeTipHtmlCreate() {
        var html = "";
        html += "<div id='tip" + popId + "' class='pop-position-wrap' style='display:none;'>";
        html += "<div class='tip-wrap'>";
        html += "<div class='tip-content'>";
        html += settings.txtContent;
        html += "</div>";
        return html;
    };
    $("body").append(popHtml);
    var $popObj = $("#tip" + popId);
    //操作提示显示
    $popObj.fadeIn(settings.fadeSpeed, function () {
        //操作提示延时自动消失
        setTimeout(function () {
            $popObj.fadeOut(settings.fadeSpeed, function () {
                $popObj.remove();
            });
        }, settings.tipLive);
    });
}

/**
 * [Dialog 对话框]
 * Author: Zero
 * Update: 2015年12月3日15:51:04
 * Version: 0.9
 * [wrapClass - Pop 层外部包裹class | 默认 ""]
 * [popHtml - Pop html | 默认""]
 * [iniCallback - Pop初始化回调函数 | 默认""]
 * [leftBtn - 是否有左侧按钮 | 默认 true]
 * [leftBtnClass - 左侧按钮class | 默认 ""]
 * [leftBtnContent - 左侧按钮文字 | 默认 确定]
 * [leftBtnCallback - 左侧按钮回调函数 | 默认 null]
 * [rightBtn - 是否有右侧按钮 | 默认 true]
 * [rightBtnClass - 右侧按钮class | 默认 ""]
 * [rightBtnContent - 右侧按钮文字 | 默认 取消]
 * [rightBtnCallback - 右侧按钮回调函数 | 默认 null]
 * [closeBtn - 是否有关闭按钮 | 默认 true]
 * [closeBtnClass - 关闭按钮class | 默认""]
 * [closeBtnHtml - 关闭按钮HTML | 默认""]
 * [hasBg - 是否有bg | 默认 true]
 * [bgClose - 点击bg关闭弹出层 | 默认false]
 * [bgCloseCallback - bg点击关闭回调函数 | 默认 null]
 * [otherClose - 其他关闭jQ选择器 | 默认""]
 * [otherCloseCallback - 其他关闭回调函数 | 默认null]
 * [fadeOutCallback - Pop消失回调函数 | 默认null]
 * [fadeSpeed - 淡入淡出时间(毫秒) | 默认 200]
 * @param {} options
 * @returns {}
 */
Mc.Pc.Pop.Dialog = function (options) {
    var settings = $.extend({
        wrapClass: "", //Pop 层外部包裹class | 默认 ""
        popHtml: "", //Pop html | 默认""
        iniCallback: null, //Pop初始化回调函数 | 默认""
        leftBtn: true, //是否有左侧按钮 | 默认 true
        leftBtnClass: "", //左侧按钮class | 默认 ""
        leftBtnContent: "确认", //左侧按钮文字 | 默认 确定
        leftBtnCallback: null, //左侧按钮回调函数 | 默认 null
        rightBtn: true, //是否有右侧按钮 | 默认 true
        rightBtnClass: "", //右侧按钮class | 默认 ""
        rightBtnContent: "取消", //右侧按钮文字 | 默认 取消
        rightBtnCallback: null, //右侧按钮回调函数 | 默认 null
        closeBtn: true, //是否有关闭按钮 | 默认 true
        closeBtnClass: "", //关闭按钮class | 默认""
        //closeBtnHtml: "", //关闭按钮HTML | 默认""
        hasBg: true, //是否有bg | 默认 true
        bgClose: false, //点击bg关闭弹出层 | 默认false
        bgCloseCallback: null, //bg点击关闭回调函数 | 默认 null
        otherClose: "", //其他关闭jQ选择器 | 默认""
        otherCloseCallback: null, //其他关闭回调函数 | 默认null
        fadeOutCallback: null, //Pop消失回调函数 | 默认null
        fadeSpeed: 200 //淡入淡出时间(毫秒) | 默认 200
    }, options);
    //把当前时间(从1970.1.1开始的毫秒数)给弹出层作为ID标识
    var popId = new Date().getTime();
    //弹出层html构造
    var popHtml = function typeTipHtmlCreate() {
        var html = "";
        html += "<div id='Dialog" + popId + "' class='pop-position-wrap' style='display:none;'>";
        html += "<div class='pop-wrap " + settings.wrapClass + "'>";
        //关闭按钮
        if (settings.closeBtn) html += "<div id='close_" + popId + "' class='pop-close " + settings.closeBtnClass + "' onclick='(function(){})'></div>"; //Beta 修复关闭按钮在iphone下无法点击
        //Pop html
        html += settings.popHtml;
        //弹出层btn构造
        if (settings.leftBtn) html += "<div id='dialog_L_" + popId + "' class='btn " + settings.leftBtnClass + "'>" + settings.leftBtnContent + "</div>";
        if (settings.rightBtn) html += "<div id='dialog_R_" + popId + "' class='btn " + settings.rightBtnClass + "'>" + settings.rightBtnContent + "</div>";
        //弹出层bg构造
        if (settings.hasBg) html += "</div><div id='bg_" + popId + "' class='pop-bg'></div>";
        html += "</div>";
        return html;
    };
    //清除之前错误未显示的弹窗
    var $abandonPop = $("[id^=Dialog]:hidden"); //废弃的弹窗
    if ($abandonPop.length !== 0) {
        $abandonPop.remove();
    }
    //添加弹出层html到页面上
    $("body").append(popHtml);
    //选中弹出层->jQuery对象
    var $popObj = $("#Dialog" + popId);
    //初始化回调函数
    //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不显示弹出层,否则关闭弹出层
    if (settings.iniCallback == null || typeof (settings.iniCallback) === "function" && settings.iniCallback() !== false) {
        //弹窗显示
        $popObj.fadeIn(settings.fadeSpeed);
    }
    //弹窗关闭
    function popClose() {
        //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
        if (settings.fadeOutCallback == null || typeof (settings.fadeOutCallback) === "function" && settings.fadeOutCallback() !== false) {
            $popObj.fadeOut(settings.fadeSpeed, function () {
                $popObj.remove();
            });
        }
    }
    if (settings.leftBtn) {
        //左侧按钮点击事件
        $popObj.on("click", "#dialog_L_" + popId, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.leftBtnCallback == null || typeof (settings.leftBtnCallback) === "function" && settings.leftBtnCallback() !== false) {
                popClose();
            }
        });
    }
    if (settings.rightBtn) {
        //右侧按钮点击事件
        $popObj.on("click", "#dialog_R_" + popId, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.rightBtnCallback == null || typeof (settings.rightBtnCallback) === "function" && settings.rightBtnCallback() !== false) {
                popClose();
            }
        });
    }
    if (settings.closeBtn) {
        //关闭按钮点击事件
        $popObj.on("click", "#close_" + popId, function () {
            popClose();
        });
    }
    //背景关闭事件
    if (settings.bgClose) {
        $popObj.on("click", "#bg_" + popId, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.bgCloseCallback == null || typeof (settings.bgCloseCallback) === "function" && settings.bgCloseCallback() !== false) {
                popClose();
            }
        });
    }
    //其他关闭事件
    if (settings.otherClose !== "") {
        $popObj.on("click", settings.otherClose, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.otherCloseCallback == null || typeof (settings.otherCloseCallback) === "function" && settings.otherCloseCallback() !== false) {
                popClose();
            }
        });
    }
}

/**
 * [DialogForm 对话框带表单]
 * Author: Zero
 * Update: 2015.8.16
 * Version: 0.7
 * [formAction - form表单action属性值 | 默认 ""]
 * [formMethod - form表单method属性值 | 默认 ""]
 * [wrapClass - Pop 层外部包裹class | 默认 ""]
 * [popHtml - Pop html | 默认""]
 * [iniCallback - Pop初始化回调函数 | 默认""]
 * [leftBtn - 是否有左侧按钮 | 默认 true]
 * [leftBtnClass - 左侧按钮class | 默认 ""]
 * [leftBtnContent - 左侧按钮文字 | 默认 确定]
 * [leftBtnCallback - 左侧按钮回调函数 | 默认 null]
 * [rightBtn - 是否有右侧按钮 | 默认 true]
 * [rightBtnClass - 右侧按钮class | 默认 ""]
 * [rightBtnContent - 右侧按钮文字 | 默认 取消]
 * [rightBtnCallback - 右侧按钮回调函数 | 默认 null]
 * [hasBg - 是否有bg | 默认 true]
 * [bgClose - 点击bg关闭弹出层 | 默认false]
 * [bgCloseCallback - bg点击关闭回调函数 | 默认 null]
 * [otherClose - 其他关闭jQ选择器 | 默认""]
 * [otherCloseCallback - 其他关闭回调函数 | 默认null]
 * [fadeOutCallback - Pop消失回调函数 | 默认null]
 * [fadeSpeed - 淡入淡出时间(毫秒) | 默认 200]
 * @param {} options
 * @returns {}
 */
Mc.Pc.Pop.DialogForm = function (options) {
    var settings = $.extend({
        formAction: "", //form表单action属性值 | 默认 ""
        formMethod: "", //form表单method属性值 | 默认 ""
        wrapClass: "", //Pop 层外部包裹class | 默认 ""
        popHtml: "", //Pop html | 默认""
        iniCallback: null, //Pop初始化回调函数 | 默认""
        leftBtn: true, //是否有左侧按钮 | 默认 true
        leftBtnClass: "", //左侧按钮class | 默认 ""
        leftBtnContent: "确认", //左侧按钮文字 | 默认 确定
        leftBtnCallback: null, //左侧按钮回调函数 | 默认 null
        rightBtn: true, //是否有右侧按钮 | 默认 true
        rightBtnClass: "", //右侧按钮class | 默认 ""
        rightBtnContent: "取消", //右侧按钮文字 | 默认 取消
        rightBtnCallback: null, //右侧按钮回调函数 | 默认 null
        hasBg: true, //是否有bg | 默认 true
        bgClose: false, //点击bg关闭弹出层 | 默认false
        bgCloseCallback: null, //bg点击关闭回调函数 | 默认 null
        otherClose: "", //其他关闭jQ选择器 | 默认""
        otherCloseCallback: null, //其他关闭回调函数 | 默认null
        fadeOutCallback: null, //Pop消失回调函数 | 默认null
        fadeSpeed: 200 //淡入淡出时间(毫秒) | 默认 200
    }, options);
    //把当前时间(从1970.1.1开始的毫秒数)给弹出层作为ID标识
    var popId = new Date().getTime();
    //弹出层html构造
    var popHtml = function typeTipHtmlCreate() {
        var html = "";
        html += "<div id='Dialog" + popId + "' class='pop-position-wrap' style='display:none;'>";
        html += "<div class='pop-wrap " + settings.wrapClass + "'>";
        html += "<form action='" + settings.formAction + "' method='" + settings.formMethod + "' target=\"_blank\">";
        //Pop html
        html += settings.popHtml;
        //弹出层btn构造
        if (settings.leftBtn) html += "<input type='submit' id='dialog_L_" + popId + "' class='btn " + settings.leftBtnClass + "' value='" + settings.leftBtnContent + "'>";
        if (settings.rightBtn) html += "<input type='submit' id='dialog_R_" + popId + "' class='btn " + settings.rightBtnClass + "' value='" + settings.rightBtnContent + "'>";
        //弹出层bg构造
        if (settings.hasBg) html += "</form></div><div id='bg_" + popId + "' class='pop-bg'></div>";
        html += "</div>";
        return html;
    };
    //清除之前错误未显示的弹窗
    var $abandonPop = $("[id^=Dialog]:hidden"); //废弃的弹窗
    if ($abandonPop.length !== 0) {
        $abandonPop.remove();
    }
    //添加弹出层html到页面上
    $("body").append(popHtml);
    //选中弹出层->jQuery对象
    var $popObj = $("#Dialog" + popId);
    //初始化回调函数
    //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不显示弹出层,否则关闭弹出层
    if (settings.iniCallback == null || typeof (settings.iniCallback) === "function" && settings.iniCallback() !== false) {
        //弹窗显示
        $popObj.fadeIn(settings.fadeSpeed);
    }
    //弹窗关闭
    function popClose() {
        //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
        if (settings.fadeOutCallback == null || typeof (settings.fadeOutCallback) === "function" && settings.fadeOutCallback() !== false) {
            $popObj.fadeOut(settings.fadeSpeed, function () {
                $popObj.remove();
            });
        }
    }
    //左侧按钮点击事件
    $popObj.on("click", "#dialog_L_" + popId, function () {
        //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
        if (settings.leftBtnCallback == null || typeof (settings.leftBtnCallback) === "function" && settings.leftBtnCallback() !== false) {
            popClose();
        }
    });
    //右侧按钮点击事件
    $popObj.on("click", "#dialog_R_" + popId, function () {
        //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
        if (settings.rightBtnCallback == null || typeof (settings.rightBtnCallback) === "function" && settings.rightBtnCallback() !== false) {
            popClose();
        }
    });
    //背景关闭事件
    if (settings.bgClose) {
        $popObj.on("click", "#bg_" + popId, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.bgCloseCallback == null || typeof (settings.bgCloseCallback) === "function" && settings.bgCloseCallback() !== false) {
                popClose();
            }
        });
    }
    //其他关闭事件
    if (settings.otherClose !== "") {
        $popObj.on("click", settings.otherClose, function () {
            //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
            if (settings.otherCloseCallback == null || typeof (settings.otherCloseCallback) === "function" && settings.otherCloseCallback() !== false) {
                popClose();
            }
        });
    }
}

/**
 * [Loading 载入中弹出层]
 * Author: Zero
 * Update: 2015.9.1
 * Version: 1.0
 * [wrapClass - Pop 层外部包裹class | 默认 ""]
 * [loadingClass - Loading 层class样式名 | 默认"loading-cotar"]
 * [loadingTxt - 载入层提示文字 | 默认"载入中..."]
 * [hasBg - 是否有bg | 默认 true]
 * [fadeOutCallback - Pop消失回调函数 | 默认null]
 * [fadeSpeed - 淡入淡出时间(毫秒) | 默认 200]
 * @param {} options
 * @returns {}
 */
Mc.Pc.Pop.Loading = function (options) {
    var settings = $.extend({
        wrapClass: "", //Pop 层外部包裹class | 默认 ""
        loadingClass: "loading-cotar", //Loading 层class样式名 | 默认"loading-cotar"
        loadingTxt: "载入中...", //载入层提示文字 | 默认"载入中..."
        hasBg: true, //是否有bg | 默认 true
        fadeOutCallback: null, //Pop消失回调函数 | 默认null
        fadeSpeed: 200 //淡入淡出时间(毫秒) | 默认 200
    }, options);
    //把当前时间(从1970.1.1开始的毫秒数)给弹出层作为ID标识
    var popId = new Date().getTime();
    //弹出层html构造
    var popHtml = function typeTipHtmlCreate() {
        var html = "";
        html += "<div id='Loading" + popId + "' class='pop-position-wrap' style='display:none;'>";
        html += "<div class='pop-wrap " + settings.wrapClass + "'>";
        html += "<div class='" + settings.loadingClass + "'>";
        //loading txt
        html += settings.loadingTxt;
        //弹出层bg构造
        if (settings.hasBg) html += "</div></div><div id='bg_" + popId + "' class='pop-bg'></div>";
        html += "</div>";
        return html;
    };
    //添加弹出层html到页面上
    $("body").append(popHtml);
    //选中弹出层->jQuery对象
    var $popObj = $("#Loading" + popId);
    //弹窗显示
    $popObj.fadeIn(settings.fadeSpeed);
    //保存loading层对象
    var _this = this;
    //弹窗关闭
    function popClose() {
        //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不关闭弹出层,否则关闭弹出层
        if (settings.fadeOutCallback == null || typeof (settings.fadeOutCallback) === "function" && settings.fadeOutCallback() !== false) {
            $popObj.fadeOut(settings.fadeSpeed, function () {
                $popObj.remove();
            });
        }
    }
    //移除载入弹出层 - 对外接口函数
    _this.removeLoading = function () {
        popClose();
    }
}

/**
 * [签到日历]
 * Author: Zero
 * Update: 2015.8.25
 * Version: 1.2
 */
Mc.Pc.Calendar.SignCal = {
    /**
     * 初始化一个签到日历
     * @param {} options
     * @returns {}
     */
    iniCal: function (options) {
        var current = new Date(); //当前时间
        var settings = $.extend({
            target: "", //显示签到日历的目标jQ选择器 | 默认 ""
            iYear: current.getFullYear(), //年 | 默认 当前年份
            iMonth: current.getMonth() + 1, //月 | 默认 当前月份
            iDay: current.getDate(),
            signList: "", //已签到列表 | 默认 ""
            iniCallBack: null, //初始化回调函数 | 默认 null
            yearSelectCallBack: null, //年份选择回调函数 | 默认 null
            monthSelectCallBack: null, //月份选择回调函数 | 默认 null
            otherSignInBtn: "", //其他签到按钮的jQ选择器 | 默认 ""
            signInBtnCallBack: null, //签到按钮回调函数 | 默认 null
            signInSuccessCallBack: null, //签到成功回调函数 | 默认 null
            signInFailCallBack: null //签到失败回调函数 | 默认 null
        }, options);
        //签到日历HTML构造
        var signHtml = Mc.Pc.Calendar.SignCal.drawCal({
            iYear: settings.iYear,
            iMonth: settings.iMonth,
            iDay: settings.iDay,
            signList: settings.signList
        });
        //添加HTML到页面
        $(settings.target).html(signHtml);
        var $signInObj = $("#sign_layer"); //日历jQ对象

        //签到日历初始化
        //回调函数为空->显示日历||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不显示日历,否则显示日历
        if (settings.iniCallback == null || typeof (settings.iniCallback) === "function" && settings.iniCallback() !== false) {
            //下拉选择框初始化
            Mc.Util.selectMenu("#sign_year_select", function (_this, val) {
                var dateTime = {
                    year: $("#sign_year_select>input").val(),
                    month: $("#sign_month_select>input").val()
                };
                var dif = parseInt(parseInt((dateTime.year - settings.iYear) * 12) + parseInt((dateTime.month - settings.iMonth)));
                if (dif > 0) {
                    $(".top-tip").html("(M+" + dif + ")月");
                } else if (dif < 0) {
                    $(".top-tip").html("(M" + dif + ")月");
                } else {
                    $(".top-tip").html("（M）月");
                }
                //年份下拉选择框回调函数
                settings.yearSelectCallBack(dateTime);
            });
            Mc.Util.selectMenu("#sign_month_select", function (_this, val) {
                var dateTime = {
                    year: $("#sign_year_select>input").val(),
                    month: $("#sign_month_select>input").val()
                };
                var dif = parseInt(parseInt((dateTime.year - settings.iYear) * 12) + parseInt((dateTime.month - settings.iMonth)));
                if (dif > 0) {
                    $(".top-tip").html("(M+" + dif + ")月");
                } else if (dif < 0) {
                    $(".top-tip").html("(M" + dif + ")月");
                } else {
                    $(".top-tip").html("（M）月");
                }
                //月份下拉选择框回调函数
                settings.monthSelectCallBack(dateTime);
            });
            //日历显示
            $signInObj.show();
        }

        //签到函数
        function signIn() {
            var errorMsg = "签到回调函数必须返回如下格式数据: {\r\n year:签到年份,\r\n month:签到月份,\r\n signList:对应月份签到列表(包括签到当天),\r\n state:签到成功与否(true/false)\r\n }\r\n"; //错误信息
            //回调函数为空->签到||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不执行签到,否则签到
            if (settings.signInBtnCallBack == null || typeof (settings.signInBtnCallBack) !== "function") {
                //签到失败
                console.error(errorMsg); //输出错误信息
                //回调函数为空||回调函数不为空判断是否为函数->true->执行函数
                if (settings.signInFailCallBack == null || typeof (settings.signInFailCallBack) === "function" && settings.signInFailCallBack());
            } else {
                var data = settings.signInBtnCallBack(); //获得回调函数返回值
                if (Mc.Util.isNull(data.year) || Mc.Util.isNull(data.month) || Mc.Util.isNull(data.signList)) {
                    console.error(errorMsg);
                    return;
                } //输出错误信息
                if (data.state == true) {
                    //签到成功
                    //回调函数为空||回调函数不为空判断是否为函数->true->执行函数
                    if (settings.signInSuccessCallBack == null || typeof (settings.signInSuccessCallBack) === "function" && settings.signInSuccessCallBack());
                } else {
                    //签到失败
                    //回调函数为空||回调函数不为空判断是否为函数->true->执行函数
                    if (settings.signInFailCallBack == null || typeof (settings.signInFailCallBack) === "function" && settings.signInFailCallBack());
                }
                //更新日历到当前月(回调函数返回参数)
                Mc.Pc.Calendar.SignCal.updateCal({
                    iYear: data.year,
                    iMonth: data.month,
                    signList: data.signList
                });
                //更新标题上的选择框
                $("#sign_year_select>input").val(data.year);
                $("#sign_year_select>div").html(data.year);
                $("#sign_month_select>input").val(data.month);
                $("#sign_month_select>div").html(data.month);
            }
        }

        //签到按钮事件绑定
        $signInObj.on("click", "#sign_in_btn,.now-day", function () {
            signIn();
        });
        //其他签到按钮事件绑定
        if (!Mc.Util.isNull(settings.otherSignInBtn)) {
            $(document).on("click", settings.otherSignInBtn, function () {
                signIn();
            });
        }
    },

    /**
     * [构造一个签到日历HTML]
     * @param {} options 配置参数
     * @returns {String} 构造出的签到日历HTML
     */
    drawCal: function (options) {
        var current = new Date(); //当前时间
        var settings = $.extend({
            iYear: current.getFullYear(), //年 | 默认 当前年份
            iMonth: current.getMonth() + 1, //月 | 默认 当前月份
            iDay: current.getDate(),
            signList: "" //已签到列表 | 默认 ""
        }, options);
        //构造签到日历HTML
        var htmls = new Array();
        htmls.push("<div class='sign_main' id='sign_layer' style='display:none;'>");
        htmls.push("<div class='sign_succ_calendar_title'>");
        //年份选择
        htmls.push("<div class='select-box' id='sign_year_select'><input type='hidden' value='" + settings.iYear + "'><div>" + settings.iYear + "年</div><ul style='display:none;'>");
        for (var i = 2015; i < 2050; i++)
            htmls.push("<li mc-select-value='" + i + "'>" + i + "年</li>");
        htmls.push("</ul></div>");
        //月份选择
        htmls.push("<div class='select-box' id='sign_month_select'><input type='hidden' value='" + settings.iMonth + "'><div>" + settings.iMonth + "月</div><ul style='display:none;'>");
        for (var j = 1; j < 13; j++)
            htmls.push("<li mc-select-value='" + j + "'>" + j + "月</li>");
        htmls.push("</ul></div>");
        //标题
        //htmls.push("<div class='calendar_month_span'>" + settings.iYear + "年" + settings.iMonth + "月</div>");
        //htmls.push("<div class='sign-in' id='sign_in_btn'>签到</div>");//签到按钮
        var difMonth = "M";
        htmls.push("<div class='top-tip'>(" + difMonth + ")月</div>");//(M)月
        htmls.push("</div>");
        //日历主体
        htmls.push("<div class='sign' id='sign_cal'>");
        //日历数据主体
        htmls.push(Mc.Pc.Calendar.SignCal.getCalDataHtml(settings.iYear, settings.iMonth, settings.iDay, settings.signList));
        htmls.push("</div>");
        htmls.push("</div>");
        return htmls.join('');
    },

    /**
     * 更新日历数据
     * @param {} options
     * @returns {}
     */
    updateCal: function (options) {
        var current = new Date(); //当前时间
        var settings = $.extend({
            iYear: current.getFullYear(), //年 | 默认 当前年份
            iMonth: current.getMonth() + 1, //月 | 默认 当前月份
            iDay: current.getDate(),
            signList: "", //已签到列表 | 默认 ""
            callBack: null //数据更新完成回调函数 | 默认 null
        }, options);
        var $signCal = $("#sign_cal");
        //添加新数据
        $signCal.html(Mc.Pc.Calendar.SignCal.getCalDataHtml(settings.iYear, settings.iMonth, settings.iDay, settings.signList));
        //回调函数为空||回调函数不为空判断是否为函数->true->执行函数
        if (settings.callBack == null || typeof (settings.callBack) === "function" && settings.callBack());
    },

    /**
     * 获得日历当月数据HTML
     * @param {} iYear 年
     * @param {} iMonth 月
     * @param {} signList 当月签到情况
     * @returns {String} 参数指定月份签到HTML
     */
    getCalDataHtml: function (iYear, iMonth, iDay, signList) {
        //判断当天是否已签到
        function isHasSigned(signList, day) {
            var signed = false;
            $.each(signList, function (index, item) {
                if (item === day) {
                    signed = true;
                    return false;
                }
            });
            return signed;
        }
        //获得日历数组
        var myMonth = Mc.Util.Date.getCalendar({
            iYear: iYear,
            iMonth: iMonth
        });
        //日历数据主体HTML构造
        var htmls = new Array();
        htmls.push("<table>");
        htmls.push("<tr>");
        htmls.push("<th class='col-1'><span>" + myMonth[0][0] + "</span></th>");
        htmls.push("<th class='col-2'><span>" + myMonth[0][1] + "</span></th>");
        htmls.push("<th class='col-3'><span>" + myMonth[0][2] + "</span></th>");
        htmls.push("<th class='col-4'><span>" + myMonth[0][3] + "</span></th>");
        htmls.push("<th class='col-5'><span>" + myMonth[0][4] + "</span></th>");
        htmls.push("<th class='col-6'><span>" + myMonth[0][5] + "</span></th>");
        htmls.push("<th class='col-7'><span>" + myMonth[0][6] + "</span></th>");
        htmls.push("</tr>");
        var d, w;
        for (w = 1; w < 7; w++) {
            htmls.push("<tr class='row-" + w + "'>");
            for (d = 1; d < 8; d++) {
                var signed = isHasSigned(signList, myMonth[w][d - 1]);
                var dayDate = !isNaN(myMonth[w][d - 1]) ? myMonth[w][d - 1] : ""; //获取天
                if (signed) {
                    if (myMonth[w][d - 1] == iDay) {
                        htmls.push("<td mc-cal-value='" + dayDate + "' class='col-" + d + " on now-day'><span>" + dayDate + "</span></td>");
                    } else {
                        htmls.push("<td mc-cal-value='" + dayDate + "' class='col-" + d + " on'><span>" + dayDate + "</span></td>");
                    }
                } else {
                    if (Mc.Util.isNull(dayDate)) {
                        htmls.push("<td mc-cal-value='" + dayDate + "' class='col-" + d + " other-month'><span>" + dayDate + "</td>");
                    } else {
                        if (myMonth[w][d - 1] == iDay) {
                            htmls.push("<td mc-cal-value='" + dayDate + "' class='col-" + d + " now-day'><span>" + dayDate + "</span></td>");
                        } else {
                            htmls.push("<td mc-cal-value='" + dayDate + "' class='col-" + d + "'><span>" + dayDate + "</span></td>");
                        }
                    }
                }
            }
            htmls.push("</tr>");
        }
        htmls.push("</table>");
        return htmls.join('');
    },

    /**
     * 执行签到
     * @param {} iDay 要签到的当天
     * @returns {} 如果已经签到 false
     *             未签到 true
     */
    setSignIn: function (iDay) {
        var $signCal = $("#sign_cal");
        var $targeDay = $signCal.find("[mc-cal-value='" + iDay + "']"); //目标日期
        if ($targeDay.hasClass("on")) {
            return false;
        } else {
            $targeDay.addClass("on");
            return true;
        }
    }
}

/**
 * [工具函数-阻止滚动条滚动事件冒泡]
 * @param {} id 滚动层id
 * @returns {}
 */
Mc.Util.preventScroll = function (id) {
    var _this = document.getElementById(id);
    if (_this != null) {
        if (navigator.userAgent.indexOf("Firefox") > 0) {
            _this.addEventListener('DOMMouseScroll', function (e) {
                _this.scrollTop += e.detail > 0 ? 60 : -60;
                e.preventDefault();
            }, false);
        } else {
            _this.onmousewheel = function (e) {
                e = e || window.event;
                _this.scrollTop += e.wheelDelta > 0 ? -60 : 60;
                return false;
            };
        }
    }
    return this;
}

/**
 * @deprecated
 * [工具函数-自定义下拉选择框]
 * @param {} selector 下拉选择框对应的jQ选择器
 * @param {} callback 选项选择时回调函数
 * @returns {}
 */
Mc.Util.selectMenu = function (selector, callback) {
    var $selector = $(selector);
    var $selectorInput = $(selector).find("input");
    var $selectorDiv = $(selector).find("div");
    var $selectorUl = $selector.find("ul");
    $selector.on("click", function (ev) {
        $selector.trigger("selectBoxClick");
        var $this = $(this);
        if ($this.hasClass("open")) {
            $this.removeClass("open");
            $selectorUl.hide();
        } else {
            $this.addClass("open");
            $selectorUl.show();
        }
        ev.stopPropagation();
    });
    $selector.on("click", 'li', function (ev) {
        var $this = $(this);
        var val = $this.text();
        var data_value = $this.attr("mc-select-value");
        $selectorDiv.html(val);
        $selectorInput.val(data_value);
        if (callback != null) callback(this, val);
        $selectorUl.hide();
        $selector.removeClass("open");
        ev.stopPropagation();
    });
    $(document).click(function () {
        $selectorUl.hide();
        $selector.removeClass("open");
    });
}

/**
 * [工具函数-自定义下拉选择框v2]
 * [last alter 2015-11-20 07:32:54 by zero]
 * [target - selectBox的jQ选择器 | 默认 ""]
 * [group - 分组-组值 | 默认分组 "McSelectBox"]
 * [callback - 候选项点击回调函数 | 默认 null]
 * @version 1.3
 * @author Zero
 * @param {} options
 * @returns {}
 */
Mc.Util.selectBox = function (options) {
    var settings = $.extend({
        target: "", //selectBox的jQ选择器 | 默认 ""
        group: "McSelectBox", //分组-组值 | 默认分组 "McSelectBox"
        callback: null //候选项点击回调函数 | 默认 null
    }, options);
    var $target = $(settings.target); //下拉框对象
    var $targetInput = $target.find("input"); //下拉框input对象(存储选择项mc-select-value字段的值)
    var $targetDiv = $target.find("div"); //下拉框div对象(存储选择项文本内容)
    var $targetUl = $target.find("ul"); //下拉框ul对象(候选项列表)
    var $targetLi = $targetUl.find("li"); //下拉框候选项
    var tempAddOption = new Array(); //单项新增的时候的临时存储数组 - 结构["txt","mcSelectValue"]
    //var tempAddOptionTxt = new Array(); //单项新增的时候的临时存储数组(存储选择项文本内容)
    //var tempAddOptionValue = new Array(); //单项新增的时候的临时存储数组(存储选择项mc-select-value字段的值)
    //初始化
    (function selectBoxIni() {
        //隐藏下拉框
        if (!$target.hasClass("mc-active")) {
            $targetUl.hide();
        }
        //分组
        $target.attr("mc-group", settings.group);
    })();
    /**
     * 设置下拉框当前值
     * @param {} option ["txt","mcSelectValue"]
     * @param {} triggerCallback 是否触发回调
     * @returns {}
     */
    function setValue(option, triggerCallback) {
        $targetInput.val(option[1]); //mcSelectValue
        $targetDiv.text(option[0]); //txt
        if (triggerCallback) {
            settings.callback != null && settings.callback(option[1], option[0]); //触发回调函数
        }
    }
    //更新下拉候选项
    function update() {
        $targetLi = $targetUl.find("li");
    }
    //添加候选项
    function add(optionList) {
        var optionHtml = "";
        for (var i = 0; i < optionList.length; i++) {
            optionHtml += '<li mc-select-value="' + optionList[i][1] + '">' + optionList[i][0] + '</li>';
        }
        $targetUl.append(optionHtml);
        update();
    }
    //绑定下拉事件
    $target.on("click", function (ev) {
        if ($targetLi.length) { //判断是否有候选项
            var $this = $(this);
            if ($this.hasClass("mc-active")) {
                $targetUl.hide();
                $this.removeClass("mc-active");
            } else {
                //关闭同组其他下拉框
                $("[mc-group=" + settings.group + "]").removeClass("mc-active").find("ul").hide();
                $this.addClass("mc-active");
                $targetUl.show();
            }
            ev.stopPropagation();
        }
    });
    //绑定候选项点击事件
    $target.on("click", 'li', function (ev) {
        var $this = $(this); //点击项
        var txt = $this.text(); //点击项txt
        var mcSelectValue = $this.attr("mc-select-value"); //点击项mc-select-value
        setValue([txt, mcSelectValue]); //设置下拉框值
        settings.callback != null && settings.callback(mcSelectValue, txt); //触发回调函数
        $targetUl.hide();
        $target.removeClass("mc-active");
        ev.stopPropagation();
    });
    //外部点击隐藏下拉框
    $(document).click(function () {
        $targetUl.hide();
        $target.removeClass("mc-active");
    });
    return {
        /**
         * 判断下拉框是否有选择值
         * @returns {} true->有值,false->无值
         */
        hasValue: function () {
            if (Mc.Util.isNull($targetInput.val())) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * 设置下拉框默认值
         * @param {} option [txt, mcSelectValue]
         * @returns {}
         */
        setDefaultValue: function (option) {
            setValue(option); //设置下拉框值
        },

        /**
         * 根据索引设置索引项为当前项
         * @param {} index 索引值
         * @param {} triggerCallback 是否触发回调函数
         * @returns {}
         */
        setSelect: function (index, triggerCallback) {
            var $select = $targetLi.eq(index);
            if ($select.length) { //如果index超出索引,即不存在项则返回false
                var mcSelectValue = $select.attr("mc-select-value"); //候选项mc-select-value
                var txt = $select.text(); //候选项txt
                setValue([txt, mcSelectValue], triggerCallback); //设置下拉框值
            } else {
                return false;
            }
        },
        /**
         * 根据文本值设置匹配项为当前项
         * 多项匹配则匹配index最小
         * @param {} txt 文本值
         * @param {} triggerCallback 是否触发回调函数
         * @returns {} true 找到匹配项, false 未找到匹配项
         */
        setSelectByTxt: function (txt, triggerCallback) {
            var _this = this;
            var hasMatch = false;
            $targetLi.each(function (i, val) {
                if ($(val).text() == txt) {
                    hasMatch = true;
                    _this.setSelect(i, triggerCallback);
                    return false;
                }
            });
            return hasMatch;
        },
        /**
         * 根据隐藏字段值设置匹配项为当前项
         * 多项匹配则匹配index最小
         * @param {} mcSelectValue 隐藏字段值
         * @param {} triggerCallback 是否触发回调函数
         * @returns {} true 找到匹配项, false 未找到匹配项
         */
        setSelectByValue: function (mcSelectValue, triggerCallback) {
            var _this = this;
            var hasMatch = false;
            $targetLi.each(function (i, val) {
                if ($(val).attr("mc-select-value") == mcSelectValue) {
                    hasMatch = true;
                    _this.setSelect(i, triggerCallback); //todo 需判断setSelect的返回值
                    return false;
                }
            });
            return hasMatch;
        },

        /**
         * 获取下拉框值
         * 如果值为空返回null
         * @returns {} 当前下拉框值{mcSelectValue:隐藏字段值,txt:文本值}
         */
        getSelectedValue: function () {
            var _mcSelectValue = $targetInput.val();
            var _txt = $targetDiv.text();
            return {
                mcSelectValue: Mc.Util.isNull(_mcSelectValue) ? null : _mcSelectValue,
                txt: Mc.Util.isNull(_txt) ? null : _txt
            }
        },
        /**
         * 获取候选项个数
         * @returns {} 候选项个数
         */
        getOptionLength: function () {
            return $targetLi.length;
        },

        /**
         * 添加候选项(单个)
         * 该添加只有在调用updateSelectBox()后才应用到选择框
         * @param {} txt 候选项显示文字
         * @param {} mcSelectValue 候选项隐藏判别字段
         * @returns {}
         */
        addOption: function (txt, mcSelectValue) {
            tempAddOption.push([txt, mcSelectValue]);
        },
        /**
         * 添加候选项(多个)
         * @param  {} optionList 候选项二维数组 [["txt","mcSelectValue"],["txt","mcSelectValue"]]
         * @param {} txt 候选项显示文字数组
         * @param {} mcSelectValue 候选项隐藏判别字段数组
         * @returns {}
         */
        addOptionList: function (optionList) {
            add(optionList);
        },

        /**
        * 改变候选项(多个)
        * @param  {} optionList 候选项二维数组 [["txt","mcSelectValue"],["txt","mcSelectValue"]]
        * @param {} txt 候选项显示文字数组
        * @param {} mcSelectValue 候选项隐藏判别字段数组
        * @returns {}
        */
        changeOptionList: function (optionList) {
            $targetUl.html("");
            add(optionList);
        },

        /**
         * 删除候选项(单个)
         * @param {} index 候选项索引值
         * @returns {}
         */
        removeOption: function (index) {
            $targetLi.eq(index).remove();
            update();
        },
        /**
         * 删除所有候选项
         * @returns {}
         */
        removeAllOption: function () {
            $targetUl.html("");
            update();
        },
        /**
        * 清空下拉选择框
        * @returns {}
        */
        empty: function () {
            $targetUl.html("");
            update();
            setValue(["", ""], false);
        },

        /**
         * 更新下拉选择框
         * 把之前调用addOption()方法添加的元素更新到下拉选择框中
         * @returns {}
         */
        updateSelectBox: function () {
            add(tempAddOption);
            //清空临时数组
            tempAddOption = [];
        }
    }
}

/**
 * [工具函数-特效变化]
 * [Author: zero]
 * [Version: 1.3]
 * [Update: 2015年12月5日16:07:35]
 * [target - 特效变化父级jQ选择器(通过事件代理触发) | 默认 "document"]
 * [event - 触发事件 | 默认click | 可选项 {
 *     click:点击触发,
 *     hover:鼠标移入/移出各触发一次,
 *     mouseover:鼠标移入触发,
 *     mouseout:鼠标移出触发
 * }]
 * [effect - 特效形式 | 默认SH | 可选项 {
 *     SH:show/hide,
 *     FIO:fadeIn/fadeOut,
 *     SDU:slideDown/slideUp
 * }]
 * [onlyActive - 同一时间只能有一个激活 | 默认 false]
 * [lessOneActive - 至少有一个处于激活状态 | 默认 false]
 * [changeCallBack - 切换改变的回调函数 | 默认 null]
 * [effectSpeed - 特效变化时间(毫秒) | 默认 200]
 * [常见用法 {
 *     单页切换: onlyActive:true,lessOneActive:true
 * }]
 * @param {} [event-触发事件|默认click|可选项];点击触发;hover;鼠标移入/移出各触发一次;mouseover;鼠标移入触发;mouseout;鼠标移出触发;
 * @returns {}
 */
Mc.Util.EffectChange = function (options) {
    var settings = $.extend({
        target: "document", //特效变化父级jQ选择器(通过事件代理触发) | 默认 "document"
        event: "click", //触发事件 | 默认 click {click:点击触发,hover:鼠标移入/移出各触发一次,mouseover:鼠标移入触发,mouseout:鼠标移出触发}
        effect: "SH", //特效形式 | 默认 SH {SH:show/hide,FIO:fadeIn/fadeOut,SDU:slideDown/slideUp}
        onlyActive: false, //同一时间只能有一个激活 | 默认 false | Tip:如果实现单页切换,此值应为true
        lessOneActive: false, //至少有一个处于激活状态 | 默认 false | Tip:如果实现单页切换,此值应为true
        changeCallBack: null, //切换改变的回调函数 | 默认 null
        effectSpeed: 200 //特效变化时间(毫秒) | 默认 200
    }, options);
    //特效函数列表
    var effectFn = {
        //=== 开始特效 START ===//
        //显示
        startShowHide: function (efcTarget) {
            efcTarget.show();
        },
        //淡入
        startFadeInOut: function (efcTarget) {
            efcTarget.stop(false, true).fadeIn(settings.effectSpeed);
        },
        //展开
        startSlideDownUp: function (efcTarget) {
            efcTarget.stop(false, true).slideDown(settings.effectSpeed);
        },
        //=== 开始特效 END ===//
        //=== 结束特效 START ===//
        //隐藏
        endShowHide: function (efcTarget) {
            efcTarget.hide();
        },
        //淡出
        endFadeInOut: function (efcTarget) {
            efcTarget.stop(false, true).fadeOut(settings.effectSpeed);
        },
        //收拢
        endSlideDownUp: function (efcTarget) {
            efcTarget.stop(false, true).slideUp(settings.effectSpeed);
        }
        //=== 结束特效 END ===//
    };
    //开始特效对应数据列表
    var efcStartList = {
        "FIO": effectFn.startFadeInOut,
        "SDU": effectFn.startSlideDownUp
    };
    //结束特效对应数据列表
    var efcEndList = {
        "FIO": effectFn.endFadeInOut,
        "SDU": effectFn.endSlideDownUp
    };
    var $targetF = null; //绑定对象
    var $efcBtn = null; //所有选项
    var $efcPage = null; //所有选项目标
    //初始化
    function effectChageIni() {
        $(settings.target + " [mc-efc-page]").each(function (i, val) {
            var $active = $(val);
            if (!$(val).hasClass("mc-active")) {
                $active.hide();
            }
        });
    }
    //选项
    var opt = {
        //更新函数
        update: function () {
            effectChageIni();
            $targetF = $(settings.target); //更新绑定对象
            $efcBtn = $targetF.find("[mc-efc-btn]"); //更新所有选项
            $efcPage = $targetF.find("[mc-efc-page]"); //更新所有选项目标
        }
    };
    (function () {
        effectChageIni(); //初始化
        $targetF = $(settings.target); //获取绑定对象
        $efcBtn = $targetF.find("[mc-efc-btn]"); //所有选项
        $efcPage = $targetF.find("[mc-efc-page]"); //所有选项目标
        var condition1 = !settings.lessOneActive; //条件1 - 可以全处于冻结状态
        //开始特效
        function effectStart(efcTarget) {
            efcTarget.addClass("mc-active");
            (efcStartList[settings.effect] || effectFn.startShowHide)(efcTarget);
        }
        //结束特效
        function effectEnd(efcTarget) {
            efcTarget.removeClass("mc-active");
            var efcType = "SH";
            settings.event != "hover" && (efcType = settings.effect); //触发事件为hover时只执行hide特效
            (efcEndList[efcType] || effectFn.endShowHide)(efcTarget);
        }
        $targetF.on(settings.event, "[mc-efc-btn]", function () {
            var $this = $(this); //当前对象
            var targetData = $this.attr("mc-efc-btn"); //当前对象目标数据(用来选取当前对象目标)
            var $target = $efcPage.filter("[mc-efc-page=" + targetData + "]"); //当前对象目标
            var $activeBtn = $efcBtn.filter(".mc-active"); //处于激活状态的选项
            var $activePage = $efcPage.filter(".mc-active"); //处于激活状态的选项目标
            var condition2 = $activeBtn.length > 1; //条件2 - 处于激活的项多以1个(隐含条件 - 不满足条件1,即至少有一个要处于激活状态)
            if ($this.hasClass("mc-active") && (condition1 || condition2)) {
                //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不执行操作
                if (settings.changeCallBack == null || typeof (settings.changeCallBack) === "function" && settings.changeCallBack() !== false) {
                    //条件1 - 所有选项可以处于冻结状态
                    //条件2 - 处于激活状态的项多于1个(隐含条件 - 不满足条件1,即至少有一个要处于激活状态)
                    //如果当前项处于激活状态,并且符合条件1,2中任意一条 --> 冻结当前项
                    $this.removeClass("mc-active active"); //冻结当前项
                    effectEnd($target); //冻结当前项目标
                }
            } else if (!$this.hasClass("mc-active")) {
                //回调函数为空->关闭||回调函数不为空判断是否为函数->true->执行函数->函数返回值为false不执行操作
                if (settings.changeCallBack == null || typeof (settings.changeCallBack) === "function" && settings.changeCallBack() !== false) {
                    //不满足冻结选项条件(并且当前项处于冻结状态) --> 激活当前项
                    if (settings.onlyActive) {
                        //如果所有选项中只能激活一个选项,则关闭已激活对象,再激活当前对象
                        $activeBtn.removeClass("mc-active active"); //冻结已激活对象
                        effectEnd($activePage); //冻结已激活对象目标
                    }
                    $this.addClass("mc-active active"); //激活当前项
                    effectStart($target); //激活当前项目标
                }
            }
        });
    })();
    return opt;
}

/**
 * [工具函数-侧栏手风琴菜单]
 * @param {} navList 手风琴菜单的jQ选择器
 * @param {boolean} oneSildeDown 是否只有一个能展开 true 一个 false 多个
 * @returns {}
 */
Mc.Util.dropMenuList = function (navList, oneSildeDown) {
    $(navList).on("click", "[mc-dropbtn]", function () {
        var $this = $(this);
        var targetName = $this.attr("mc-dropbtn");
        var $targetObj = $("[mc-dropmenu=" + targetName + "]");
        if ($targetObj.hasClass("open")) {
            $this.removeClass("open");
            $targetObj.removeClass("open").slideUp();
        } else {
            if (oneSildeDown) {
                var $allDropBtn = $("[mc-dropbtn]");
                var $allDropMenu = $("[mc-dropmenu]");
                for (var i = 0; i < $allDropMenu.length; i++) {
                    var nowLooObjB = $allDropBtn.eq(i);
                    var nowLoopObjM = $allDropMenu.eq(i);
                    if (nowLoopObjM.hasClass("open")) {
                        nowLooObjB.removeClass("open");
                        nowLoopObjM.removeClass("open").slideUp();
                    }
                }
            }
            $this.addClass("open");
            $targetObj.addClass("open").slideDown();
        }
    });
}

/**
 * [工具函数-验证码倒计时]
 * Author: Zero
 * Update: 2016年4月1日23:21:57
 * Version: 1.5
 */
Mc.Util.IniFixCountDown = function (options) {
    var settings = $.extend({
        target: "#verifity", //jQuery选择器字符串
        fixTime: 60, //时间
        timeFormat: "%d", //计时格式化字符串
        startCallback: null, //开始倒计时回调函数
        endCallback: null, //结束倒计时回调函数
        defaultTxt: "获取验证码" //默认显示文字
    }, options);
    var _this = this;
    var $target = $(settings.target);
    this.timeCountDownState = true; //倒计时时判断按钮是否可用
    this.interValObj = null; //倒计时的定时器对象
    //开始倒计时
    this.start = function () {
        var timeFormatTxt = new Array();
        var countTime = settings.fixTime >> 0;
        timeFormatTxt = settings.timeFormat.split("%d");
        if (typeof (timeFormatTxt[2]) != "undefined") console.error("不能有超过一个的%d出现");
        if (_this.timeCountDownState) {
            _this.timeCountDownState = false;
            if (settings.startCallback != null) settings.startCallback(); //开始节点回调函数
            _this.interValObj = window.setInterval(function () {
                if (countTime == 1) {
                    //倒计时结束
                    window.clearInterval(_this.interValObj);
                    $target.html(settings.defaultTxt);
                    if (settings.endCallback != null) settings.endCallback(); //结束节点回调函数
                    _this.timeCountDownState = true;
                } else {
                    countTime--;
                    $target.html(timeFormatTxt[0] + countTime + timeFormatTxt[1]);
                }
            }, 1000);
        }
    },
    //清除倒计时
    this.clean = function () {
        if (_this.interValObj != null) {
            window.clearInterval(_this.interValObj);
            $target.html(settings.defaultTxt);
            _this.timeCountDownState = true;
        }
    }
    //是否正在倒计时中
    this.isCountDown = function () {
        return !this.timeCountDownState;
    }
}

/**
 * [获得日历数组]
 * Author: Zero
 * Update: 2015.8.17
 * Version: 1.0
 * [iYear - 年 | 默认 当前年份]
 * [iMonth - 月 | 默认 当前月份]
 * [calHead - 日历表头 | 默认 星期日~星期一]
 * @returns {Array} 当月二维数组
 */
Mc.Util.Date.getCalendar = function (options) {
    var current = new Date(); //当前时间
    var settings = $.extend({
        iYear: current.getFullYear(), //年 | 默认 当前年份
        iMonth: current.getMonth() + 1, //月 | 默认 当前月份
        calHead: ["日", "一", "二", "三", "四", "五", "六"] //日历表头 | 默认 星期日~星期一
    }, options);
    var aMonth = new Array();
    aMonth[0] = new Array(7);
    aMonth[1] = new Array(7);
    aMonth[2] = new Array(7);
    aMonth[3] = new Array(7);
    aMonth[4] = new Array(7);
    aMonth[5] = new Array(7);
    aMonth[6] = new Array(7);
    var dCalDate = new Date(settings.iYear, settings.iMonth - 1, 1);
    var iDayOfFirst = dCalDate.getDay(); //获得当月第一天
    var iDaysInMonth = Mc.Util.Date.getDaysInmonth(settings.iYear, settings.iMonth); //获得当月总天数
    var iVarDate = 1;
    var d, w;
    //表头初始化
    for (var i = 0; i < 7; i++) {
        aMonth[0][i] = settings.calHead[i];
    }
    for (d = iDayOfFirst; d < 7; d++) {
        aMonth[1][d] = iVarDate;
        iVarDate++;
    }
    for (w = 2; w < 7; w++) {
        for (d = 0; d < 7; d++) {
            if (iVarDate <= iDaysInMonth) {
                aMonth[w][d] = iVarDate;
                iVarDate++;
            }
        }
    }
    return aMonth;
}
/**
 * [获得当前月份天数]
 * @param {} iYear 年
 * @param {} iMonth 月
 * @returns {}
 */
Mc.Util.Date.getDaysInmonth = function (iYear, iMonth) {
    var dPrevDate = new Date(iYear, iMonth, 0);
    return dPrevDate.getDate();
}

/**
 * [判断传入的对象是否为null | "" | undefined]
 * @param {} obj 判断对象
 * @returns {} true 传入对象为null | "" | undefined
 *             false 传入对象不为null | "" | undefined
 */
Mc.Util.isNull = function (obj) {
    if (obj == null || obj === "" || typeof (obj) == "undefined") {
        return true;
    }
    return false;
}

/**
 * [判断传入的对象是否为null | "" | NaN | undefined]
 * @param {} obj 判断对象
 * @returns {} true 传入对象不为null | ""| NaN | undefined
 *             false 传入对象为null | ""| NaN | undefined
 */
Mc.Util.isNumber = function (obj) {
    if (obj == null || obj === "" || isNaN(obj) || typeof (obj) == "undefined") {
        return false;
    }
    return true;
}

/**
 * [notNullOrEmpty 判断字符串数组是否为空]
 * @param  {string[]} str
 * @return {Boolean}
 */
Mc.Util.String.notNullOrEmpty = function (str) {
    var item, _i, _len;
    if (str !== null && str.length > 0) {
        for (_i = 0, _len = str.length; _i < _len; _i++) {
            item = str[_i];
            if (!item) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};

/**
 * [isOnlyOne 判断传入对象是否为单个对象]
 * @param  {[type]}  str [obj]
 * @return {Boolean}     [check str if it length === 1]
 */
Mc.Util.String.isOnlyOne = function (str) {
    return str instanceof Array === false && str;
};

/**
 * [Checkphonecode 正则表达式验证手机号是否正确]
 * @param  {varchar} phoneCode
 * @return {Boolean}
 */
Mc.Util.Check.checkPhoneCode = function (phoneCode) {
    var reg;
    if (Mc.Util.String.isOnlyOne(phoneCode)) {
        reg = /^((\(\d{3}\))|(\d{3}\-))?13\d{9}|14[57]\d{8}|15\d{9}|18\d{9}|17\d{9}$/;
        return phoneCode.length === 11 && reg.test(phoneCode);
    }
    return false;
};

/**
 * [Checkphonecode 正则表达式验证电话号码是否正确]
 * @param  {varchar} phoneCode
 * @return {Boolean}
 */
Mc.Util.Check.checkLandlinePhoneCode = function (landlinePhoneCode) {
    var reg;
    if (Mc.Util.String.isOnlyOne(landlinePhoneCode)) {
        reg = /(\d{4}-)?\d{6,8}/;
        return reg.test(landlinePhoneCode);
    }
    return false;
};

/**
 * [Checkmailcode 正则表达式验证邮箱是否正确]
 * @param  {varchar}email
 * @return {Boolean}
 */
Mc.Util.Check.checkMailCode = function (email) {
    var right = /^[0-9A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd0-9]+[-.])+[A-Za-zd]{2,5}$/;
    if (email.match(right)) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * [Checkidcard 正则表达式验证身份证是否正确]
 * @param  {varchar} idcard
 * @return {Boolean}
 */
Mc.Util.Check.checkIdcardCode = function (idcard) {
    var right = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (idcard.match(right)) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * [Checktelcode 正则表达式验证固定电话是否正确]
 * @param  {varchar} telephone
 * @return {Boolean}
 */
Mc.Util.Check.checkTelCode = function (telephone) {
    var right = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (telephone.match(right)) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * [Checktelcode 验证两个字符串是否相等]
 * @param  {varchar} str1 str2
 * @return {Boolean}
 */
Mc.Util.String.cmp = function (str1, str2) {
    var checkstr = [str1, str2];
    if (!Mc.Util.String.isNullOrEmpty(checkstr)) {
        return false;
    }
    if (str1 === str2) {
        return true;
    }
    else {
        return false;
    }
};

/**验证url**/

Mc.Util.Uri.goNextUrl = function (targetUrl) {
    var oldUrl = Mc.Util.Uri.getSigleUrlParam("oldUrl");
    var goUrl = "";
    if (oldUrl != null) {
        if (targetUrl.indexOf("?") == -1) {
            targetUrl += "?";
        } else {
            targetUrl += "&";
        }
        //解码
        goUrl = targetUrl + "oldUrl=" + encodeURIComponent(oldUrl);
        window.location.href = goUrl;
    }
}
/**验证url**/

/**
 * [GetRequest get url param after ?]
 */
Mc.Util.Uri.getUrlParamArray = function () {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") !== -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
        }
    }
    return theRequest;
};
/**
 * *获取单个Url参数
 * @returns {}
 */
Mc.Util.Uri.getUrlParamByName = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
};
/**
 * url解密
 * @param {编码url} url
 * @returns {}
 */
/**
 * 去旧地址
 * @returns {}
 */
Mc.Util.Uri.goOldUrl = function (targetUrl) {
    var oldUrl = Mc.Util.Uri.getUrlParam("oldUrl");
    var goUrl = "";
    if (oldUrl != null) {
        //解码
        goUrl = decodeURIComponent(oldUrl);
        window.location.href = goUrl;
    } else {
        if (targetUrl != null) {
            window.location.href = targetUrl;
        }
    }
}
/**
 * 跳转到指定地址带上本地地址
 * @param {} goUrl
 * @returns {指定地址}
 */
Mc.Util.Uri.goUrl = function (goUrl) {
    goUrl = Mc.Util.Uri.getOldUrl(goUrl);
    setTimeout(function () {
        window.location.href = goUrl;
    }, 1000);
}
/**
 * 获取指定地址带上本地地址
 * @param {指定地址} goUrl
 * @returns {}
 */
Mc.Util.Uri.getOldUrl = function (goUrl) {
    var oldUrl = encodeURIComponent(location.href);
    if (goUrl.indexOf("?") == -1) {
        goUrl += "?";
    }
    goUrl += "oldUrl=" + oldUrl;
    return goUrl;
}

/**
 * [dateFormatter Description]
 * @param  {datetime} date [description]
 * @param  {int} type [1 "yyyy-MM-dd" 2 "MM-dd"]
 * @return {string}
 */
Mc.Util.Date.dateFormatter = function (date, type) {
    var year = date.replace(/yyyy/, this.getFullYear());
    var month = date.replace(/MM/, this.getMonth() > 9 ? this.getMonth().toString() : '0' + this.getMonth());
    var day = date.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    if (type === 1) {
        return year + "-" + month + "-" + day;
    } else if (type === 2) {
        return month + "-'" + day;
    }
    return false;
};


Mc.Util.String.getStrTrueLength = function (str) {
    return str.replace(/[^x00-xff]/g, "xx").length;
};


//@deprecated
//弹出层(废弃)
//Version 1.3.2
//Auther Zero
//Update 2015.6.23
//可选类型：
//1.null - 默认的带有head-body-bottom
//2.void - 空白弹出层:无默认按钮以及标题,可选择传入一个用来关闭弹出层的按钮的JQuery选择器
//3.tip - 提示框:弹出一个操作提示,在tip_live时间(单位毫秒)内存在,然后消失,无回调函数
//4.loading - 载入框:弹出一个载入中的弹出层.需要代码手动remove.
//5.confirm - 确认框 (开发中)
//type: null, 弹出层类型,默认null(即可自定义添加HTML,css控制样式)
//style: 1, 默认样式1
//width: '80%', 默认宽度
//max_height: '80%', 默认最大高度
//fadeSpeed: 200, 默认淡入淡出时间200毫秒
//tip_live: 2000, 操作提示层生存时间(单位毫秒),只有在type为tip时生效
//tip_content: "", 操作提示层内容,只有在type为tip时生效
//loading_content: "载入中...", 载入层提示文字
//hasHead: true, 默认有标题
//head_txt: "是否确认当前操作", 默认弹出层标题
//headHTML: "", 可传入String自定义head,type为void时会自动启用
//html: "", 默认弹出框的内容
//bottomHTML: "", 可传入String自定义bottom,type为void时会自动启用
//confirm_id: "#dialog_L_", 默认左侧按钮绑定的id前缀(开发中)
//confirm_btn: true, 默认显示确认按钮
//confirm_txt: "确认", 默认确认按钮显示文字确认
//callback_L: null, 左侧按钮点击回调函数(confirm_btn)
//cancel_id: "#dialog_R_", 默认右侧按钮绑定的id前缀(开发中)
//cancel_btn: true, 默认显示取消按钮
//cancle_txt: "取消", 默认取消按钮显示文字取消
//callback_R: null, 右侧按钮点击回调函数(cancel_btn)
//hasBg: true, 默认有黑色背景
//bgClose: false, 默认无法点击bg取消弹出框
//callback_bc: null, bg等关闭按钮点击回调函数,只有在bg_close为true的情况下才会生效
//otherClose: null, 传入一个用来关闭弹出层的按钮的JQuery选择器,若要唯一绑定,传入的JQuery必须唯一
//callback_oc: null, otherClose的回调函数
//callback_ini: null, 弹出层初始化回调函数
//callback_close: null, 弹出层消失回调函数
//scroll: true, 默认弹出层有滚动条
//scroll_mouseWheelPixels: 100 默认弹出层body滚动条滚动速度100px
function Dialog(options) {
    var settings = $.extend({
        //可选类型：
        //1.null - 默认的带有head-body-bottom
        //2.void - 空白弹出层:无默认按钮以及标题,可选择传入一个用来关闭弹出层的按钮的JQuery选择器
        //3.tip - 提示框:弹出一个操作提示,在tip_live时间(单位毫秒)内存在,然后消失,无回调函数
        //4.loading - 载入框:弹出一个载入中的弹出层.需要代码手动remove.
        //5.confirm - 确认框 (开发中)
        type: null, //弹出层类型,默认null(即可自定义添加HTML,css控制样式)
        style: 1, //默认样式1

        width: '80%', //默认宽度
        max_height: '80%', //默认最大高度
        fadeSpeed: 200, //默认淡入淡出时间200毫秒

        tip_live: 2000, //操作提示层生存时间(单位毫秒),只有在type为tip时生效
        tip_content: "", //操作提示层内容,只有在type为tip时生效

        loading_content: "载入中...", //载入层提示文字

        hasHead: true, //默认有标题
        head_txt: "是否确认当前操作", //默认弹出层标题
        headHTML: "", //可传入String自定义head,type为void时会自动启用

        html: "", //默认弹出框的内容
        bottomHTML: "", //可传入String自定义bottom,type为void时会自动启用

        confirm_id: "#dialog_L_", //默认左侧按钮绑定的id前缀(开发中)
        confirm_btn: true, //默认显示确认按钮
        confirm_txt: "确认", //默认确认按钮显示文字确认
        callback_L: null, //左侧按钮点击回调函数(confirm_btn)
        cancel_id: "#dialog_R_", //默认右侧按钮绑定的id前缀(开发中)
        cancel_btn: true, //默认显示取消按钮
        cancle_txt: "取消", //默认取消按钮显示文字取消
        callback_R: null, //右侧按钮点击回调函数(cancel_btn)

        hasBg: true, //默认有黑色背景
        bgClose: false, //默认无法点击bg取消弹出框
        callback_bc: null, //bg等关闭按钮点击回调函数,只有在bg_close为true的情况下才会生效

        otherClose: null, //传入一个用来关闭弹出层的按钮的JQuery选择器,若要唯一绑定,传入的JQuery必须唯一
        callback_oc: null, //otherClose的回调函数

        callback_ini: null, //弹出层初始化回调函数
        callback_close: null, //弹出层消失回调函数

        scroll: true, //默认弹出层有滚动条
        scroll_mouseWheelPixels: 100 //默认弹出层body滚动条滚动速度100px
    }, options);

    //======= 变量 START =======//
    var _this = this;
    var dialogBodyMaxHeight = null;

    //把当前时间(从1970.1.1开始的毫秒数)给弹出层作为ID标识
    var dialogId = new Date().getTime();

    var dialogHtml = "";
    //======= 变量 END =======//

    //======= 接口函数 START =======//
    //弹出层dialog-body滚动条更新(CANCEL)
    //_this.updateDialogScroll = function () {
    //    if (settings.scroll) {
    //        $(".dialog-body").mCustomScrollbar("update");
    //    }
    //}
    //获得弹出层dialog-body的max-height
    _this.getDialogBodyMaxHeight = function () {
        return dialogBodyMaxHeight;
    }
    //移除弹出层
    _this.remove = function () {
        delDialog(dialogId);
    }
    //移除载入弹出层
    _this.removeLoading = function () {
        delDialog("loading" + dialogId);
    }
    //======= 接口函数 END =======//


    //======= 弹出层HTML构造 START =======//
    //构造弹出层
    if (settings.type == null) {
        //默认弹出层
        dialogHtml = typeDefaultHtmlCreate();
    } else if (settings.type == "void") {
        //空的弹出层
        dialogHtml = typeVoidHtmlCreate();
    } else if (settings.type == "tip") {
        //提示弹出层
        dialogHtml = typeTipHtmlCreate();
    } else if (settings.type == "loading") {
        //载入中弹出层
        dialogHtml = typeLoadingHtmlCreate();
    } else if (settings.type == "confirm") {
        //确认框弹出层
        dialogHtml = typeConfirmHtmlCreate();
    }

    //1.默认的弹出层构造函数
    function typeDefaultHtmlCreate() {
        var HTML = "";
        HTML += "<div id='" + dialogId + "' class='dialog-position-wrap' style='display:none;'>";
        HTML += "<div class='dialog-wrap ds" + settings.style + "' style='width:" + settings.width + ";max-height:" + settings.max_height + ";'>";

        //dialog-top构造
        HTML += "<div class='dialog-top'>";
        //判断标题是否显示(hasHead优先级最高)
        if (settings.hasHead) {
            //若headHTML有内容(不为空),则覆盖默认的head
            if (isEmptyString(settings.headHTML)) {
                HTML += settings.headHTML;
            } else {
                HTML += "<div class='dialog-head ds" + settings.style + "'>" + settings.head_txt + "</div>";
            }
        }
        HTML += "</div>";

        //dialog-body构造
        HTML += "<div class='dialog-body'>";
        HTML += settings.html;
        HTML += "</div>";

        //dialog-bottom构造
        HTML += "<div class='dialog-bottom'>";
        //若bottomHTML有内容(不为空),则覆盖默认的bottom
        if (isEmptyString(settings.bottomHTML)) {
            HTML += settings.bottomHTML;
        } else {
            //判断按钮显示
            if (settings.confirm_btn || settings.cancel_btn) {
                HTML += "<div class='dialog-btn-wrap ds" + settings.style + "'>";
                if (settings.confirm_btn)
                    HTML += "<div id='dialog_L_" + dialogId + "' class='dialog-btn ds" + settings.style + "'>" + settings.confirm_txt + "</div>";
                if (settings.cancel_btn)
                    HTML += "<div id='dialog_R_" + dialogId + "' class='dialog-btn ds" + settings.style + "'>" + settings.cancle_txt + "</div>";
                HTML += "</div>";
            }
        }
        HTML += "</div>";

        //dialog-bg构造
        if (settings.hasBg) HTML += "<div id='bg_" + dialogId + "' class='dialog-bg ds" + settings.style + "'></div>";

        HTML += "</div></div>";
        return HTML;
    }

    //2.type: void 弹出层HTML构造
    function typeVoidHtmlCreate() {
        var html = "";
        html += "<div id='" + dialogId + "' class='dialog-position-wrap' style='display:none;'>";
        html += "<div class='dialog-wrap ds" + settings.style + "' style='width:" + settings.width + ";max-height:" + settings.max_height + ";'>";

        //dialog-top构造
        html += "<div class='dialog-top'>";
        //判断标题是否显示(hasHead优先级最高)
        if (settings.hasHead) {
            html += settings.headHTML;
        }
        html += "</div>";

        //dialog-body构造
        html += "<div class='dialog-body'>";
        html += settings.html;
        html += "</div>";

        //dialog-bottom构造
        html += "<div class='dialog-bottom'>";
        html += settings.bottomHTML;
        html += "</div>";

        //dialog-bg构造
        if (settings.hasBg) html += "<div id='bg_" + dialogId + "' class='dialog-bg ds" + settings.style + "'></div>";

        html += "</div></div>";
        return html;
    }

    //3.type: tip 弹出层HTML构造
    function typeTipHtmlCreate() {
        var html = "";
        html += "<div id='tip" + dialogId + "' class='dialog-position-wrap' style='display:none;'>";
        html += "<div class='tip-wrap'>";
        html += "<div class='tip-content'>";
        html += settings.tip_content;
        html += "</div></div>";
        return html;
    }

    //4.type: loading 弹出层HTML构造(TO DO)
    function typeLoadingHtmlCreate() {
        var html = "";
        html += "<div id='loading" + dialogId + "' class='dialog-position-wrap' style='display:none;'>";
        html += "<div class='dialog-wrap'>";
        html += "<div class='loading-content'>";
        html += settings.loading_content;
        //dialog-bg构造
        if (settings.hasBg) html += "<div id='bg_" + dialogId + "' class='dialog-bg ds" + settings.style + "'></div>";
        html += "</div></div>";
        return html;
    }

    //5.type: confirm 弹出层HTML构造(TO DO)
    function typeConfirmHtmlCreate() {
        var html = "";

        return html;
    }
    //======= 弹出层HTML构造 END =======//

    //======= 弹出层显示 START =======//
    //把弹出层HTML添加到页面中
    if (settings.type == "tip") {
        $("body").before(dialogHtml);
        //操作提示显示
        $("#tip" + dialogId).fadeIn(settings.fadeSpeed, function () {
            //操作提示延时自动消失
            setTimeout(function () {
                delDialog("tip" + dialogId);
            }, settings.tip_live);
        });
    } else if (settings.type == "loading") {
        $("body").before(dialogHtml);
        //载入中弹出层显示
        $("#loading" + dialogId).fadeIn(settings.fadeSpeed);
    } else {
        $("body").before(dialogHtml);
        //弹出层显示
        $("#" + dialogId).fadeIn(settings.fadeSpeed, function () {
            //设置dialog最大高度
            setDialogMaxHeight();
            //弹出层初始化回调函数
            if (settings.callback_ini != null) settings.callback_ini();
            //滚动条更新(CANCEL)
            //if (settings.scroll) {
            //    $(".dialog-body").mCustomScrollbar("update");
            //}
        });
    }
    //======= 弹出层显示 END =======//


    //======= 弹出层事件添加 START =======//
    if (settings.type == "tip") {
        //提示框被点击的时候直接消失
        $("#tip" + dialogId).bind('click', function () {
            //隐藏并删除确认框
            delDialog("tip" + dialogId);
        });
    } else {
        //其他关闭按钮
        if (settings.otherClose) {
            $(settings.otherClose).live('click', function () {
                //左侧按钮操作
                if (settings.callback_oc != null) settings.callback_oc();
                //隐藏并删除弹出层
                delDialog(dialogId);
            });
        }
        //底部按钮
        if ((settings.confirm_btn || settings.cancel_btn) && settings.type != "void") {
            if (settings.confirm_btn) {
                $(settings.confirm_id + dialogId).bind('click', function () {
                    //左侧按钮操作
                    if (settings.callback_L != null) settings.callback_L();
                    //隐藏并删除弹出层
                    delDialog(dialogId);
                });
            }
            if (settings.cancel_btn) {
                $(settings.cancel_id + dialogId).bind('click', function () {
                    //右侧按钮操作
                    if (settings.callback_R != null) settings.callback_R();
                    //隐藏并删除弹出层
                    delDialog(dialogId);
                });
            }
        }
        //背景关闭按钮
        if (settings.bgClose) {
            $("#bg_" + dialogId).bind('click', function () {
                //关闭弹出框后操作
                if (settings.callback_bc != null) settings.callback_bc();
                //隐藏并删除弹出层
                delDialog(dialogId);
            });
        }
    }
    //======= 弹出层事件添加 END =======//


    //======= 内部工具函数 START =======//
    //隐藏并删除弹出层
    function delDialog(dialogNum) {
        $("#" + dialogNum).fadeOut(settings.fadeSpeed, function () {
            //弹出层消失回调函数
            if (settings.callback_close != null) settings.callback_close();
            $("#" + dialogNum).remove();
        });
    }

    //设置dialog最大高度
    function setDialogMaxHeight() {
        var dialogWrapH = $(".dialog-wrap").outerHeight();
        var dialogHeadH = $(".dialog-top").outerHeight();
        var dialogBtnH = $(".dialog-bottom").outerHeight();
        //dialog_max_H此值为弹出层有实际内容的最大高度
        var dialogMaxH = dialogWrapH - dialogHeadH - dialogBtnH;
        //dialog_body_max_height此值为弹出层满高的最大高度
        dialogBodyMaxHeight = $(window).height() * (parseInt(settings.max_height) / 100) - dialogHeadH - dialogBtnH;
        $(".dialog-body").css("max-height", dialogMaxH);
    }

    //判断字符串是否为空
    function isEmptyString(str) {
        if (str == "") {
            return false;
        } else {
            return true;
        }
    }
    //======= 内部工具函数 END =======//

    //弹出层dialog-body滚动条(CANCEL)
    //if (settings.scroll) {
    //    //弹出层添加滚动条
    //    $(".dialog-body").mCustomScrollbar({
    //        //mouseWheelPixels: settings.scroll_mouseWheelPixels
    //        mouseWheelPixels: "auto"
    //    });
    //}
}
