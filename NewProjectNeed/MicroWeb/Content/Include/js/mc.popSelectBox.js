/**
 * 弹出选择
 * Zero
 * 2016年4月1日22:38:21
 * Zero
 * 2016年6月13日17:32:22
 * version 1.1
 * @param {} options 
 * @returns {} 
 */
Mc.PopSelectBox = function (options) {
    "use strict";
    var args = $.extend({
        $dataConfig: {}, //数据配置项,dataId指定数据所在的数组,指定text对应的数据字段,指定value对应的数据字段,searchKey搜索字段的字段名
        data: [],
        externTemplate: false, //外部模板
        pageMode: true, //分页模式
        groupMode: false, //分组模式
        searchMode: false, //搜索模式
        touchOptimize: false, //触屏优化
        titileName: "请选择", //弹出层标题名称
        $ajaxConfig: {}, //数据ajax请求配置项
        pageSize: 20, //分页数
        popSelectBoxTemplate: null, //组件模板
        defaultDataTemplateGroup: null, //数据模板(不分组)
        defaultDataTemplate: null, //数据模板(分组)
        success: function () { }, //分页请求成功且有数据回调
        beforeSend: function () { }, //分页请求发送之前回调
        noMore: function () { }, //已无更多数据回调
        beforeIni: function () { }, //初始化之前回调
        iniSuccess: function () { }, //初始化成功回调
        beforeSearch: function () { }, //搜索请求之前回调
        successSearch: function () { }, //搜索请求成功且有数据回调
        noResultSearch: function () { } //搜索请求成功但无搜索结果回调
    }, options);

    //#region 内部变量
    var $$this = this;
    //当前的jQ对象
    var $this = $(this);
    //分页对象
    var pageObj = {
        pageSize: args.pageSize,
        pageIndex: 1
    }
    //要渲染的数据
    var renderData = null;
    //钩子对象
    var mcHook = null;
    //弹出层对象
    var $popSelect = $({});
    //搜索框对象
    var $popSearchIpt = $({});
    //数据显示层
    var $popDataBody = $({});
    //#endregion

    //#region set/get
    //获取全局配置项
    function getGlobalOpt() {
        return Mc.PopSelectBox.global;
    }
    //设置全局配置项
    function setGlobalOpt(opt) {
        Mc.PopSelectBox.global = opt;
    }
    //获取渲染数据
    function getRenderData() {
        return renderData;
    }
    //设置渲染数据
    function setRenderData(newData) {
        renderData = args.$dataConfig.dataId ? newData[args.$dataConfig.dataId] : newData;
    }
    //获取分页对象
    function getPageObj() {
        return pageObj;
    }
    //设置分页对象
    function setPageObj(newObj) {
        pageObj = $.extend(pageObj, newObj);
    }
    //获取钩子对象
    function getPageHook() {
        return mcHook;
    }
    //设置钩子对象
    function setPageHook(hook) {
        mcHook = hook;
    }
    //#endregion

    //#region 内部变量相关函数
    //初始化pageObj
    function iniPageObj() {
        setPageObj({
            pageSize: args.pageSize,
            pageIndex: 1
        });
    }
    //pageObj到下一页
    function pageObjToNext() {
        setPageObj({
            pageIndex: getPageObj().pageIndex + 1
        });
    }
    //#endregion

    //#region html模板,渲染函数
    //转换html
    function convertHtmlString(fn) {
        return fn.toString().replace(/^[^\/]+\/\*!?\s?/, "").replace(/\*\/[^\/]+$/, "");
    };

    //组件模板
    function popSelectBoxTemplate() {
        /*
        <div id="{{id}}" class="mc-pop-select-box fbox">
            <div class="mc-pop-header"><i class="mc-close-btn">〈</i><span class="mc-header-text">{{headerTxt}}</span></div>
            {{if searchMode}}
            <div class="mc-pop-search-box fbox">
                <div class="ipt-wrap bf1"><input type="text" class="mc-search-ipt" placeholder="请输入要搜索的内容"></div>
                <div class="search-btn-wrap"><div class="search-btn">搜索</div></div>
            </div>
            {{/if}}
            <ul class="mc-pop-body bf1"></ul>
        </div>
         */
    }

    //组件渲染函数
    var popSelectRenderFun = (function () {
        //获取全局配置项
        var globalOpt = getGlobalOpt();
        var html = globalOpt.popSelectBoxTemplate || (args.popSelectBoxTemplate ? args.popSelectBoxTemplate : popSelectBoxTemplate);
        var source = convertHtmlString(html);
        return template.compile(source);
    })();

    //默认的数据模板(非分组)
    function defaultDataTemplate() {
        /*
        {{each data as item i}}
            <div class="mc-item default-item" mc-code={{item.code}}>{{item.txt}}</div>
        {{/each}}
         */
    }
    //默认的数据模板(分组)
    function defaultDataTemplateGroup() {
        /*
        {{each data as item i}}
            <div class="mc-item default-group-item" mc-code={{item.code}}>{{item.txt}}</div>
        {{/each}}
         */
    }

    //数据渲染函数
    var dataRenderFun = (function () {
        //获取全局配置项
        var globalOpt = getGlobalOpt();
        var source = "";
        var html = function () { };
        if (args.groupMode) {
            html = globalOpt.defaultDataTemplateGroup || (args.defaultDataTemplateGroup ? args.defaultDataTemplateGroup : defaultDataTemplateGroup);
            source = convertHtmlString(html);
        } else {
            html = globalOpt.defaultDataTemplate || (args.defaultDataTemplate ? args.defaultDataTemplate : defaultDataTemplate);
            source = convertHtmlString(html);
        }
        return template.compile(source);
    })();
    //#endregion

    //#region 内部函数
    //请求数据,当下拉分页时才会触发
    function ajaxData(def) {
        //获取全局配置项
        var globalOpt = getGlobalOpt();
        var ajaxConfig = $.extend(globalOpt.$ajaxConfig, args.$ajaxConfig);
        if (!Mc.Util.isNull(ajaxConfig.url)) {
            Mc.Ajax({
                url: ajaxConfig.url,
                //判断是否是分页模式
                data: (args.pageMode ? $.extend(ajaxConfig.data, getPageObj()) : ajaxConfig.data),
                success: function(response) {
                    //设置渲染数据
                    setRenderData(response);
                    $this.trigger("ajax_success", response);
                    def.resolve(response);
                },
                fail: function(response) {
                    $this.trigger("ajax_fail", response);
                    console.info("ajax fail");
                }
            });
        } else {
            //todo 没有url时候解决def对象,防止一直loading
            console.info("no ajax url");
        }
        return def;
    }

    //删除ajax请求的data的某个键值
    function delAjaxDataByKey(key) {
        delete args.$ajaxConfig.data[key];
    }

    //添加ajax请求的data
    function addAjaxData(addData) {
        args.$ajaxConfig.data = $.extend(args.$ajaxConfig.data, addData);
    }

    //获取真正数据
    function getRealData() {
        var def = $.Deferred();
        if (args.data.length) { //调用传入数据生成
            //设置渲染数据
            setRenderData(args.data);
            def.resolve();
        } else { //请求数据生成
            ajaxData(def);
        }
        return def;
    }

    //生成dom结构
    function genDom() {
        //渲染html
        var html = popSelectRenderFun({
            id: 'popSelect' + new Date().getTime(),
            headerTxt: args.titileName,
            searchMode: args.searchMode
        });
        $popSelect = $(html);
        args.searchMode && ($popSearchIpt = $popSelect.find(".mc-search-ipt")); //搜索框
        $popDataBody = $popSelect.find(".mc-pop-body"); //数据显示层
        $(body).append($popSelect); //添加popSelect
    }

    //设置数据
    function $$SetData() {
        //获取要渲染的数据
        var renderData = getRenderData();
        if (renderData) {
            //转换数据
            var data = args.externTemplate ? renderData : renderData.map(function (val, i) {
                return {
                    code: args.$dataConfig.value ? val[args.$dataConfig.value] : "",
                    txt: args.$dataConfig.text ? val[args.$dataConfig.text] : ""
                }
            });
            //渲染数据html
            var html = dataRenderFun({
                data: data
            });
            getPageHook().add(html); //通过钩子添加数据
        }
    }

    //绑定下拉事件
    function bindDropDownEvent() {
        var hook = getPageHook();
        //设置分页对象，用于ajaxData方法请求数据
        setPageObj({
            pageIndex: 2 //更改pageObj对象的pageIndex为第二页
        });
        //监听hook触发事件
        hook.$.on("hook", function () {
            var def = $.Deferred();
            hook.disable(); //禁用钩子,防止重复触发
            args.beforeSend.call($$this); //beforeSend回调
            //请求数据
            ajaxData(def).then(function (response) {
                pageObjToNext(); //修改pageObj的pageIndex为下一页，用于下次请求
                if (response.count) { //还有更多数据
                    hook.enable(); //启用钩子
                    $$SetData(); //添加数据
                    args.success.call($$this, response); //success回调
                } else { //已无更多数据
                    //todo 在非搜索模式的时候销毁钩子，因为钩子没有任何剩余作用了
                    args.noMore.call($$this, response); //noMore回调
                }
            });
        });
    }

    //弹出层关闭
    function popClose() {
        $popSelect.remove();
        $this.trigger("pop_close"); //触发外部关闭事件
    }

    //绑定内部事件
    function bindInternalEvent() {
        var hook = getPageHook();
        //搜索事件
        function doSearch() {
            //判断是否存在搜索框，如果是外部模板，写错的情况下可能不存在搜索框
            if ($popSearchIpt.length) {
                var def = $.Deferred();
                $this.trigger("search"); //触发外部搜索事件
                iniPageObj(); //初始化分页对象
                hook.clean(); //清空列表
                var searchData = $popSearchIpt.val(); //搜索框内容
                searchData = searchData.trim(); //去除两边空格
                if (searchData !== "") {
                    var addData = {}; //要添加的请求条件对象
                    addData[args.$dataConfig.searchKey] = searchData; //设置新的请求条件
                    addAjaxData(addData); //添加请求条件
                } else {
                    //搜索条件不存在
                    delAjaxDataByKey(args.$dataConfig.searchKey); //删除搜索条件
                }
                hook.disable(); //禁用钩子,防止重复触发
                args.beforeSearch.call($$this); //搜索请求之前回调
                //请求首次数据
                ajaxData(def).then(function (response) {
                    pageObjToNext(); //修改pageObj的pageIndex为下一页，用于下次请求
                    if (response.count) { //还有更多数据
                        hook.enable(); //启用钩子
                        $$SetData(); //添加数据
                        args.successSearch.call($$this, response); //搜索请求成功且有数据回调
                    } else { //已无更多数据
                        args.noResultSearch.call($$this, response); //搜索请求成功但无搜索结果回调
                    }
                });
            } else {
                console.info("no search box");
            }
        }
        if (args.searchMode) {
            //搜索框回车事件
            $popSearchIpt.on("keyup", function (ev) {
                //回车事件
                if (ev.keyCode === 13) {
                    doSearch();
                }
            });
            //搜索按钮点击事件
            $popSelect.on("click", ".search-btn", doSearch);
        }
        //返回按钮事件
        $popSelect.on("click", ".mc-close-btn", function () {
            popClose();
        });
        //列表点击事件
        $popDataBody.on("click", ".mc-item", function () {
            //this为当前点击项
            $this.trigger("item_click", this); //触发外部点击事件
        });
    }

    //初始化分页钩子
    function iniPageHook() {
        //todo 同步下拉分页Hook更新,暂用Mc.DropDownHook v1.0版本
        var hook = new Mc.DropDownHook({
            $scrollItem: $popDataBody,
            $targetList: $popDataBody,
            touchOptimize: args.touchOptimize
        });
        hook.iniHook(); //初始化钩子
        return hook;
    }

    //初始化弹出层分页
    function iniPopSelectBox() {
        args.beforeIni.call($$this); //beforeIni回调
        //获取真实数据
        getRealData().then(function () {
            //生成dom结构
            genDom();
            //初始化分页钩子,获得分页钩子对象
            setPageHook(iniPageHook());
            $$SetData(); //添加数据
            //绑定内部事件
            bindInternalEvent();
            //如果分页模式则绑定分页事件
            if (args.pageMode) {
                bindDropDownEvent(); //绑定下拉事件
            }
            args.iniSuccess.call($$this); //iniSuccess回调
        });
    }

    //#endregion

    //#region API
    //显示弹出层
    this.showPop = function () {
        iniPageObj(); //初始化分页对象
        iniPopSelectBox(); //初始化弹出层分页
    }
    //关闭弹出层
    this.closePop = function () {
        popClose();
    }
    //更改ajax请求的data
    this.changeAjaxData = function (newData) {
        args.$ajaxConfig.data = newData;
    }
    //删除ajax请求的data的某个键值
    this.delAjaxDataByKey = function (key) {
        delAjaxDataByKey(key);
    }
    //添加ajax请求的data
    this.addAjaxData = function (addData) {
        addAjaxData(addData);
    }
    //向列表底部追加加HTML内容
    this.addHtml = function(html) {
        getPageHook().add(html);
    }
    //清空列表内容
    this.cleanHtml = function() {
        getPageHook().clean();
    }
    //赋值jQ对象
    this.$ = $this;
    //#endregion
}

Mc.PopSelectBox.global = {
    $ajaxConfig: { //数据ajax请求配置项
        url: "",
        data: {}
    },
    popSelectBoxTemplate: null, //组件模板
    defaultDataTemplateGroup: null, //数据模板(不分组)
    defaultDataTemplate: null //数据模板(分组)
};

//全局设置请求参数
Mc.PopSelectBox.setAjaxConfig = function (config) {
    Mc.PopSelectBox.global.$ajaxConfig = $.extend(Mc.PopSelectBox.global.$ajaxConfig, config);
}

//全局设置组件模板
Mc.PopSelectBox.setPopSelectBoxTemplate = function (fun) {
    Mc.PopSelectBox.global.popSelectBoxTemplate = fun;
}

//全局设置数据模板(非分组)
Mc.PopSelectBox.setDefaultDataTemplate = function (fun) {
    Mc.PopSelectBox.global.defaultDataTemplate = fun;
}

//全局设置数据模板(分组)
Mc.PopSelectBox.setDefaultDataTemplateGroup = function (fun) {
    Mc.PopSelectBox.global.defaultDataTemplateGroup = fun;
}
