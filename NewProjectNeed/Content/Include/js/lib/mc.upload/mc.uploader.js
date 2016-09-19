
; (function (mc, $, undefined) {
    "use strict";
    mc.Uploader = function (options) {
        var opt = $.extend({
            //图片上传所需参数
            target: "", //需要监听的图片上传包裹层jQuery选择器
            //iptFilter: "*", //上传输入框过滤jQuery过滤器
            name: "imagefile", //设置文件上传域的name,对应的后台接受的字段

            //webupload 参数
            compress: true, //是否进行压缩
            auto: false, //设置为 true 后，不需要手动调用上传，有文件选择即开始上传
            acceptImage: [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
            imageCompressWidth: 1920, //图片最大宽度
            imageCompressHeight: 1920, //图片最大高度
            // 图片质量，只有type为`image/jpeg`的时候才有效。
            quality: 80,
            // 单位字节，如果图片大小小于此值，不会采用压缩。
            imageCompressSize: 0,

            //图片上传最大尺寸
            imageMaxSize: 8 * 1024 * 1024, // 默认 8 M

            //表单上传所需参数
            iswater: true, //是否有水印
            url: "", //提交的地址
            data: {}, //额外参数
            //isApi: false, //是否是api请求
            //type: "default", //后台文件保存的分类
            //orientations: null, //图片方向,必须在设置type的情况下使用
            showLoadingFun: null, //显示loading的函数
            hideLoadingFun: null, //隐藏loading的函数
            successHideLoading: true, //上传请求成功时是否运行隐藏loading的函数
            beforeSend: null,
            success: null,
            fail: null,
            hasFailTip: true //是否有上传失败提示
        }, options);
        var acceptExtensions = (opt.acceptImage || []).join('').replace(/\./g, ',').replace(/^[,]/, '');
        var _this = this;
        _this.imageUploader = WebUploader.create({
            method: "POST",
            //设置为 true 后，不需要手动调用上传，有文件选择即开始上传
            auto: opt.auto,
            pick: {
                id: opt.target
            },
            accept: {
                title: 'Images',
                extensions: acceptExtensions,
                //mimeTypes: 'image/*'
                mimeTypes: 'image/jpg,image/jpeg,image/png'   //fix chrome input 点击延迟
            },
            swf: '/webuploader-0.1.5/Uploader.swf',
            server: Mc.Config.imgUploadUrlPrefix + opt.url + '?action=uploadimage',
            fileVal: opt.name, //设置文件上传域的name。
            duplicate: true, //去重
            fileSingleSizeLimit: opt.imageMaxSize,
            compress: opt.compress ? {
                width: opt.imageCompressWidth,
                height: opt.imageCompressHeight,
                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: opt.quality,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,
                // 是否允许裁剪。
                crop: false,
                // 是否保留头部meta信息。
                preserveHeaders: true,
                // 单位字节，如果图片大小小于此值，不会采用压缩。
                compressSize: opt.imageCompressSize
            } : false
        });

        //图片被添加到上传队列之前
        _this.imageUploader.on('beforeFileQueued', function (file) {
            //todo 阻止上传后loading的隐藏有些小问题
            //图片为png且图片大小超过2M，阻止上传
            if (file.type.indexOf('png') !== -1 && file.size > 2097152) {
                Mc.App.Pop.Tip({
                    txtContent: "png格式的图片最大支持2M!"
                });
                return false;
            }
            return true;
        });

        //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
        _this.imageUploader.on('uploadBeforeSend', function (file, data, header) {
            //这里可以通过data对象添加POST参数
            data = $.extend(data, {
                iswater: opt.iswater ? true : false //水印
                //, isTruncate: opt.isTruncate ? true : false //裁剪
                //, x1: 20
                //, x2: 260
                //, x3: 20
                //, x4: 260
            }, opt.data);
            //header['X_Requested_With'] = 'XMLHttpRequest'; 添加header
        });

        //开始上传之前
        _this.imageUploader.on('startUpload', function () {
            typeof opt.showLoadingFun === "function" && opt.showLoadingFun();
        });

        //当所有文件上传结束时触发
        _this.imageUploader.on('uploadFinished', function () {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });

        //上传请求成功
        _this.imageUploader.on('uploadSuccess', function (file, ret) {
            var $this = $("#rt_" + file.source.ruid);
            opt.successHideLoading && typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
            if (ret.issuccess) {
                //上传成功
                typeof opt.success === "function" && opt.success.call(this, $this, ret, file);
            } else {
                //上传失败
                opt.hasFailTip && Mc.App.Pop.Tip({
                    txtContent: "上传失败，请重新上传!"
                });
                typeof opt.fail === "function" && opt.fail.call(this, $this, ret, file);
            }
        });

        //上传请求失败 -> 网络错误或者服务器错误
        _this.imageUploader.on('uploadError', function (file, code) {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
        //上传结束
        _this.imageUploader.on('uploadComplete', function (file, ret) {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
        //内部错误
        _this.imageUploader.on('error', function (code, file) {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
    }
})(window.Mc || (window.Mc = {}), window.jQuery);
