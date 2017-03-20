
/*
 * 上传
 * v1.1
 */
; (function (mc, $, undefined) {
    "use strict";
    mc.Uploader = function (options) {
        var opt = $.extend({
            //图片上传所需参数
            target: "", //需要监听的图片上传包裹层jQuery选择器

            //暂时定type
            type: "image", //图片上传，图片-image，文件-file

            //iptFilter: "*", //上传输入框过滤jQuery过滤器
            name: "imagefile", //设置文件上传域的name,对应的后台接受的字段

            //webupload 参数 - 图片
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


            //webupload 参数 - 文件
            acceptFile: [
                ".png", ".jpg", ".jpeg", ".gif", ".bmp",
                ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
                ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid",
                ".rar", ".zip", ".tar", ".gz", ".7z", ".bz2", ".cab", ".iso",
                ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt", ".md", ".xml"
            ],
            fileMaxSize: 500 * 1024 * 1024, // 默认 500 M

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
            uploading: null, //上传中
            hasFailTip: true //是否有上传失败提示
        }, options);
        var _this = this;
        var uploader = null;
        var acceptExtensions;
        if (opt.type === "image") {
            acceptExtensions = (opt.acceptImage || []).join('').replace(/\./g, ',').replace(/^[,]/, '');
            uploader = WebUploader.create({
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
                //runtimeOrder: "flash",
                swf: '/Content/Include/js/lib/mc.upload/webuploader-0.1.5/Uploader.swf',
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
            _this.imageUploader = uploader;
        } else if (opt.type === "file") {
            acceptExtensions = (opt.acceptFile || []).join('').replace(/\./g, ',').replace(/^[,]/, '');
            uploader = WebUploader.create({
                method: "POST",
                //设置为 true 后，不需要手动调用上传，有文件选择即开始上传
                auto: opt.auto,
                pick: {
                    id: opt.target
                },
                accept: {
                    title: 'File',
                    extensions: acceptExtensions
                },
                swf: '/Content/Include/js/lib/mc.upload/webuploader-0.1.5/Uploader.swf',
                server: Mc.Config.imgUploadUrlPrefix + opt.url + '?action=uploadfile',
                fileVal: opt.name, //设置文件上传域的name。
                duplicate: true, //去重
                fileSingleSizeLimit: opt.fileMaxSize
            });
            _this.fileUploader = uploader;
        }

        //upload不存在则结束
        if (!uploader) return;

        //图片被添加到上传队列之前
        _this.imageUploader && _this.imageUploader.on('beforeFileQueued', function (file) {
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
        _this.imageUploader && _this.imageUploader.on('uploadBeforeSend', function (file, data, header) {
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
        uploader.on('startUpload', function () {
            typeof opt.showLoadingFun === "function" && opt.showLoadingFun();
        });

        //当所有文件上传结束时触发
        uploader.on('uploadFinished', function () {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });

        //上传中
        uploader.on('uploadProgress', function (file, percentage) {
            var $this = $("#rt_" + file.source.ruid);
            typeof opt.uploading === "function" && opt.uploading.call(this, $this, file, percentage);
        });

        //上传请求成功
        uploader.on('uploadSuccess', function (file, ret) {
            var $this = $("#rt_" + file.source.ruid);
            opt.successHideLoading && typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
            if (ret.issuccess) {
                //开发者模式绑定上传服务器地址
                Mc.DevelopMode && (ret.data.url = Mc.Config.imgUploadUrlPrefix + ret.data.url);
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
        uploader.on('uploadError', function (file, code) {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
        //上传结束
        uploader.on('uploadComplete', function (file, ret) {
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
        //内部错误
        uploader.on('error', function (code, file) {
            if (code === "Q_TYPE_DENIED") {
                Mc.App.Pop.Tip({
                    txtContent: "不支持所选文件格式，请重新选择!"
                });
            } else if (code === "Q_EXCEED_SIZE_LIMIT") {
                Mc.App.Pop.Tip({
                    txtContent: "文件大小超出限制，请重新选择!"
                });
            } else if (code === "Q_EXCEED_NUM_LIMIT") {
                Mc.App.Pop.Tip({
                    txtContent: "文件数量超出限制，请重新选择!"
                });
            }
            typeof opt.hideLoadingFun === "function" && opt.hideLoadingFun();
        });
    }
})(window.Mc || (window.Mc = {}), window.jQuery);

