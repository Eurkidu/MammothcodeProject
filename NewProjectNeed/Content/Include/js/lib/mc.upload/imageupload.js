//    用于压缩图片的canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
//    瓦片canvas
var tCanvas = document.createElement("canvas");
var tctx = tCanvas.getContext("2d");
//图片最大大小
var maxsize = 100 * 1024;


//第一步：图片提交处理 https://github.com/whxaxes/node-test/blob/master/server/upload/index_2.html
function filechooserOnchange(_this, imgType, $img, _callback) {
    var orientations = 1;
    if (!_this.files.length) return;
    var files = Array.prototype.slice.call(_this.files);
    files.forEach(function (file, i) {
        if (!/\/(?:jpeg|png|gif)/i.test(file.type)) return;
        var reader = new FileReader();
        //  获取图片大小
        reader.onload = function () {
            var result = this.result;
            var img = new Image();

            img.src = result;
            //如果图片大小小于100kb，则直接上传
            if (result.length <= maxsize) {
                img = null;
                upload(result, file.type, imgType, orientations, $img, _callback);
                return;
            }
            //图片加载完毕之后进行压缩，然后上传
            if (img.complete) {
                callback();

            } else {
                img.onload = callback;
            }

            function callback() {
                EXIF.getData(img, function () {
                    //获取图片的exif信息 http://code.ciaoca.com/javascript/exif-js/
                    orientations = EXIF.getTag(this, 'Orientation');
                    //orientations = EXIF.getTag(this, 'Orientation');
                });
                var data = compress(img);

                upload(data, file.type, imgType, orientations, $img, _callback);
                img = null;
            }
        };
        reader.readAsDataURL(file);
    });
};

//第二步：使用canvas对大图片进行压缩
function compress(img) {
    var initSize = img.src.length;
    var width = img.width;
    var height = img.height;
    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    var ratio;
    if ((ratio = width * height / 4000000) > 1) {
        ratio = Math.sqrt(ratio);
        width /= ratio;
        height /= ratio;
    } else {
        ratio = 1;
    }
    canvas.width = width;
    canvas.height = height;
    //        铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //如果图片像素大于100万则使用瓦片绘制
    var count;
    if ((count = width * height / 1000000) > 1) {
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
        //            计算每块瓦片的宽和高
        var nw = ~~(width / count);
        var nh = ~~(height / count);
        tCanvas.width = nw;
        tCanvas.height = nh;
        for (var i = 0; i < count; i++) {
            for (var j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }
    //进行最小压缩
    var ndata = canvas.toDataURL('image/jpeg', 0.4);
    //console.log('压缩前：' + initSize);
    //console.log('压缩后：' + ndata.length);
    //console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
    return ndata;
}

//第三步：图片上传，将base64的图片转成二进制对象，塞进formdata上传
function upload(basestr, type, imgType, orientations, $img, callback) {

    var loading = new Mc.Pc.Pop.Loading({
        loadingTxt: "上传中"
    });
    var text = window.atob(basestr.split(",")[1]);
    var buffer = new Uint8Array(text.length);
    var pecent = 0, loop = null;
    for (var i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i);
    }
    var blob = getBlob(buffer, type);
    var xhr = new XMLHttpRequest();
    var formdata = new FormData();

    formdata.append('imagefile', blob);
    //提交到后台
    xhr.open('post', Mc.Config.AjaxUrl + '/Api/FileUpload/UpdateImg?type=' + imgType + '&orientations=' + orientations, true);
    //需要添加请求报文头，Content-Type.
    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //当收到该消息时上传完毕
            //去除上传中的框
            loading.removeLoading();
            var response = eval('(' + xhr.responseText + ')');
            //var response = xhr.responseText;
            var imgUrl = response.href;
            if (response.issuccess) {
                //将图片附加上去
                $img.attr("src", imgUrl);
                typeof callback === "function" && callback.call(this, imgUrl);
                //$target=$img.parent().next();
                //if ($target.length && $target.is("input[type=text]")) {
                //    $target.val(imgUrl);
                //}
            } else {
                Mc.App.Pop.Tip({
                    txtContent: "上传失败，请重新上传!", fadeSpeed: 100
                });
            }
            clearInterval(loop);
        }
    };

    //////数据发送进度，前50%展示该进度
    //xhr.upload.addEventListener('progress', function (e) {
    //    if (loop) return;
    //    pecent = ~~(100 * e.loaded / e.total) / 2;
    //    if (pecent == 10) {

    //    }
    //}, false);

    xhr.send(formdata);
}

// 获取blob对象的兼容性写法
function getBlob(buffer, format) {
    var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
    if (Builder) {
        var builder = new Builder;
        builder.append(buffer);
        return builder.getBlob(format);
    } else {
        return new window.Blob([buffer], { type: format });
    }
}


//Android兼容版：另外一种直接上传图片函数
function formUp($img, type, $form, callback) {
    var loading = new Mc.Pc.Pop.Loading({
        loadingTxt: "上传中"
    });
    //var data = { "type": type, "orientations": "hor" };
    $form.ajaxSubmit({
        url: Mc.Config.AjaxUrl + "/Api/FileUpload/UpdateImg?type="+type+"&orientations=undefined",
        type: "POST",
        //data: data,
        timeout: 60000, //超时时间：30秒
        async: true,
        success: function (response) {
            loading.removeLoading();
            //API 不需要parse
            //var response = eval('(' + json + ')');
            var imgUrl = response.href;
            //上传成功
            if (response.issuccess) {
                $img.attr("src", imgUrl);
                typeof callback === "function" && callback.call(this, imgUrl);
                //var $target = $img.parent().next();
                //if($target.length && $target.is("input[type=text]")){
                //    $target.val(imgUrl);
                //}
            } else {
                Mc.App.Pop.Tip({
                    txtContent: "上传失败，请重新上传!", fadeSpeed: 100
                });
            }
        }
    });
}