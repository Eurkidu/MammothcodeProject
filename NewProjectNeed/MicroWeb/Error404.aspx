﻿<% Response.StatusCode = 404 %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="black" name="apple-mobile-web-app-status-bar-style">
    <meta content="telephone=no" name="format-detection">
    <meta content="email=no" name="format-detection">
    <meta name="wap-font-scale" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=2.0, user-scalable=no" />
    <title>寻野就是生活</title>
    <!--主样式文件-->
    <link href="/Content/Include/css/Main.min.css" rel="stylesheet" />
</head>
<body id="body">
    <!-- 页面加载失败 -->
    <div id="mc_page_fail" class="page-load-fail hf" style="display: block">
        <div class="vm-cotar fp">
            <div class="pic-wrap">
                <img src="/Content/Include/img/pic-page-error.png" />
            </div>
            <div class="txt-wrap">
                <div class="h1">你要的页面找不到啦~</div>
                <div class="h2">错误代码：404</div>
            </div>
            <div class="tool-bar">
                <div class="btn -state2" onclick="javascript: window.location.replace('/')">返回首页</div>
            </div>
        </div>
    </div>
    <div class="header fbox">
        <div class="tool-btn left-tool">
            <i class="ic-return" onclick="javascript: history.go(-1)"></i>
        </div>
        <div class="center-box bf1">
            <div class="title"><span>页面错误</span></div>
        </div>
        <div class="tool-btn right-tool">
        </div>
    </div>
</body>
</html>
