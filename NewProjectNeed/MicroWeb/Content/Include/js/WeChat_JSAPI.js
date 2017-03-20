//微信JSAPI调用   创建  2015-8-10   毛枫
//config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
//config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把
//相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以
//直接调用，不需要放在ready函数中。

//全局变量
var latitude = ""; // 纬度，浮点数，范围为90 ~ -90
var longitude = ""; // 经度，浮点数，范围为180 ~ -180。

/**
 * 全局： 微信的config存放变量
 */
var globeConfig = { appId: "", timestamp: "", nonceStr: "", signature: "" };

/*
 * 配置方法
 * @param {微信appid} appId
 * @param {时间戳} timestamp
 * @param {随机数} nonceStr
 * @param {签名} signature
 * @returns {}
 */
function WeChat_Config(appId, timestamp, nonceStr, signature) {
    globeConfig.appId = appId;
    globeConfig.timestamp = timestamp;
    globeConfig.nonceStr = nonceStr;
    globeConfig.signature = signature;
    wx.config({
        debug: false,
        appId: appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: [
        "onMenuShareTimeline",
        "onMenuShareAppMessage",
        "onMenuShareQQ",
        "onMenuShareWeibo",
        "hideMenuItems",
        "showMenuItems",
        "hideAllNonBaseMenuItem",
        "showAllNonBaseMenuItem",
        "translateVoice",
        "startRecord",
        "stopRecord",
        "onRecordEnd",
        "playVoice",
        "pauseVoice",
        "stopVoice",
        "uploadVoice",
        "downloadVoice",
        "chooseImage",
        "previewImage",
        "uploadImage",
        "downloadImage",
        "getNetworkType",
        "openLocation",
        "getLocation",
        "hideOptionMenu",
        "showOptionMenu",
        "closeWindow",
        "scanQRCode",
        "chooseWXPay",
        "openProductSpecificView",
        "addCard",
        "chooseCard",
        "openCard"
        ]
    });
}

///分享接口，当前版本，分享接口无法自定义按钮事件触发，只能由手机微信浏览器右上角默认按钮触发
/**
 * 分享到盆友圈
 * @param {分享标题} title
 * @param {分享链接} link
 * @param {分享图片} imgUrl
 * @returns {}
 */
function ShareFriendsCircle(title, link, imgUrl, successCallback, cancelCallback) {
    //接口主函数，自动执行
    wx.ready(function () {
        //分享到朋友圈
        wx.onMenuShareTimeline({
            title: title,
            link: link,
            imgUrl: imgUrl,
            success: function (res) {
                typeof successCallback === "function" && successCallback();
                //alert('已分享');
            },
            cancel: function (res) {
                typeof cancelCallback === "function" && cancelCallback();
                //alert('已取消');
            }//,
            //fail: function (res) {
            //    alert(JSON.stringify(res));
            //}
        });
    });
}

/**
 * 分享给朋友
 * @param {分享标题} title
 * @param {分享描述} desc
 * @param {分享链接} link
 * @param {分享图片} imgUrl
 * @param {分享类型} type
 * @param {数据链接} dataUrl
 * @returns {}
 */
function ShareFriend(title, desc, link, imgUrl, type, dataUrl, successCallback, cancelCallback) {
    //接口主函数，自动执行
    wx.ready(function () {
        //分享给朋友
        wx.onMenuShareAppMessage({
            title: title,//标题
            desc: desc, // 分享描述
            link: link,//分享链接
            imgUrl: imgUrl,//图片路径
            type: type, // 分享类型,music、video或link，不填默认为link
            dataUrl: dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
            success: function (res) {
                typeof successCallback === "function" && successCallback();
                //alert('已分享');
            },
            cancel: function (res) {
                typeof cancelCallback === "function" && cancelCallback();
                //alert('已取消');
            },
            //fail: function (res) {
            //    alert(JSON.stringify(res));
            //}
        });
    });
}

/**
 * 分享到QQ
 * @param {分享标题} title
 * @param {分享描述} desc
 * @param {分享链接} link
 * @param {分享图片} imgUrl
 * @returns {}
 */
function ShareQQ(title, desc, link, imgUrl) {
    wx.ready(function () {
        wx.onMenuShareQQ({
            title: title,//标题
            desc: desc, // 分享描述
            link: link,//分享链接
            imgUrl: imgUrl,//图片路径
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}

/**
 * 分享到微博
 * @param {分享标题} title
 * @param {分享描述} desc
 * @param {分享链接} link
 * @param {分享图片} imgUrl
        //type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
 * @returns {}
 */
function ShareWeibo(title, desc, link, imgUrl) {
    wx.ready(function () {
        wx.onMenuShareWeibo({
            title: title,//标题
            desc: desc, // 分享描述
            link: link,//分享链接
            imgUrl: imgUrl,//图片路径
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}

/**
 * 分享到QQ空间
 * @param {分享标题} title
 * @param {分享描述} desc
 * @param {分享链接} link
 * @param {分享图片} imgUrl
 * @returns {}
 */
function ShareQQCircle(title, desc, link, imgUrl) {
    wx.ready(function () {
        wx.onMenuShareQZone({
            title: title,//标题
            desc: desc, // 分享描述
            link: link,//分享链接
            imgUrl: imgUrl,//图片路径
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}

/**
 * 功能模块：微信获取地理位置接口ready版,无需用户操作自动执行
 * 创建人 ：林以恒
 * 2016-1-14
 * @param {默认为wgs84的gps坐标， 如果要返回直接openLocation的火星坐标，可传入'gcj02'} type
 * @returns {latitude: 纬度, longitude: 经度, speed: 速度, accuracy: 位置精度} location
 */
function getLocationReady(callback) {
    wx.ready(function () {
        wx.getLocation({
            success: function (res) {
                convertorPoint({
                    x: res.longitude,
                    y: res.latitude
                }, function (data) {
                    if (data.status === 0) {
                        typeof callback === "function" && callback.call({
                            longitude: data.points[0].lng,
                            latitude: data.points[0].lat
                        });
                    }
                });
            },
            cancel: function (res) {
                Mc.App.Pop.Tip({ txtContent: "用户拒绝授权获取地理位置" });
            }
        });
    });
}

/**
 * 功能模块： 微信内置地图查看
 * 创建人：林以恒
 * 2015-12-9
 * @param {纬度} latitude
 * @param {经度} longitude
 * @param {位置名} name
 * @param {地址详情} address
 * @param {地图缩放级别} scale
 * @param {查看界面底部显示的超链接， 点击跳转} infoUrl
 * @returns {}
 */
function openLocation(latitude, longitude, name, address, scale, infoUrl) {
    wx.ready(function () {
        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            name: name,
            address: address,
            scale: scale,
            infoUrl: infoUrl
        });
    });

}

wx.error(function (res) {
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    //WeChat_Config(globeConfig.appId, globeConfig.timestamp, globeConfig.nonceStr, globeConfig.signature);
});