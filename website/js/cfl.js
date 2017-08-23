var tsid = 0;
var dqml = "/";
var xzsl = 0;
var sxcf = false;
var upfile = new Array(2);

var mid = function (z, q, h) {
    var qz = z.indexOf(q) + q.length;
    var hz = z.indexOf(h, qz);
    if (hz == -1)
        hz = z.length;
    return z.substring(qz, hz);
};

var tmsg = function (z, d) {
    $(".tsq").append(" <div class=\"tid_" + tsid + " am-alert am-alert-" + z + "\" data-am-alert><button type=\"button\" class=\"am-close\">&times;</button>" + d + "<script>self.setInterval(\"$('.tid_" + tsid + "').alert('close')\",3000);<" + "/script></div>");
    tsid++;
}

var filelist_click = function () {

    $("a[class^='file_list_list_']").click(function () {
        $(".refresh_file").show();
        $(".show_up_file").show();
        $(".show_create_folder").show();
        $(".del_file").hide();
        $(".rename-file").hide();
        $(".mv_file").hide();
        $(".cp_file").hide();
        $(".show_file_info").hide();
        xzsl = 0;
        sxcf = false;
        var zid = mid($(this).attr('class'), 'file_list_list_', ' ');
        var zdqml = dqml.split("/");
        dqml = "/";
        $(".file_list_list").empty();
        for (var i = 0; i <= zid; i++) {
            if (i == 0) {
                $(".file_list_list").append("<li><a href=\"javascript: void(0)\" class=\"file_list_list_" + i + " am-icon-home\">/</a></li>");
            } else if (i == zid) {
                $(".file_list_list").append("<li class=\"file_list_list_" + i + " am-active\">" + zdqml[i] + "</li>");
                dqml += zdqml[i] + "/";
            } else {
                $(".file_list_list").append("<li><a href=\"javascript: void(0)\" class=\"file_list_list_" + i + " am-icon-folder\">" + zdqml[i] + "</a></li>");
                dqml += zdqml[i] + "/";
            }
        }
        if (dqml != "/")
            dqml = dqml.substring(0, dqml.length - 1);
        getfilelist(dqml);
    });

    $("font[class^='file_list_folder_fid_']").click(function () {
        var zzz = $(this).attr('class');
        //alert(mid(zzz, 'file_list_folder_fid_', ' '));
        sxcf = true;
        if (dqml != "/") {
            dqml += "/" + $.trim($(this).text());
            getfilelist(dqml);
        } else {
            dqml += $.trim($(this).text())
            getfilelist(dqml);
        }

    });

    $("font[class^='file_list_file_fid_']").click(function () {
        var zzz = $(this).attr('class');
        alert(mid(zzz, 'file_list_file_fid_', ' '));
    });

    $("input[class^='file_list_file_select_']").click(function () {
        var zzz = mid($(this).attr('class'), 'file_list_file_select_', ' ');
        if ($(this).is(':checked')) {
            xzsl++;
        } else {
            xzsl--;
        }
        if (xzsl == 1) {
            $(".refresh_file").hide();
            $(".show_up_file").hide();
            $(".show_create_folder").hide();
            $(".del_file").show();
            $(".rename-file").show();
            $(".mv_file").show();
            $(".cp_file").show();
            if ($("input[class^='file_list_folder_select_']").is(':checked')) {
                $(".show_file_info").show();
            } else {
                $(".show_file_info").hide();
            }
        } else if (xzsl > 1) {
            $(".refresh_file").hide();
            $(".show_up_file").hide();
            $(".show_create_folder").hide();
            $(".del_file").show();
            $(".rename-file").hide();
            $(".mv_file").show();
            $(".cp_file").show();
            $(".show_file_info").hide();
        } else {
            $(".refresh_file").show();
            $(".show_up_file").show();
            $(".show_create_folder").show();
            $(".del_file").hide();
            $(".rename-file").hide();
            $(".mv_file").hide();
            $(".cp_file").hide();
            $(".show_file_info").hide();
        }
    });

    $("input[class^='file_list_folder_select_']").click(function () {
        var zid = mid($(this).attr('class'), 'file_list_folder_select_', ' ');
        if ($(this).is(':checked')) {
            xzsl++;
        } else {
            xzsl--;
        }
        if (xzsl == 1) {
            $(".refresh_file").hide();
            $(".show_up_file").hide();
            $(".show_create_folder").hide();
            $(".del_file").show();
            $(".rename-file").show();
            $(".mv_file").show();
            $(".cp_file").show();
            if ($("input[class^='file_list_folder_select_']").is(':checked')) {
                $(".show_file_info").show();
            } else {
                $(".show_file_info").hide();
            }
        } else if (xzsl > 1) {
            $(".refresh_file").hide();
            $(".show_up_file").hide();
            $(".show_create_folder").hide();
            $(".del_file").show();
            $(".rename-file").hide();
            $(".mv_file").show();
            $(".cp_file").show();
            $(".show_file_info").hide();
        } else {
            $(".refresh_file").show();
            $(".show_up_file").show();
            $(".show_create_folder").show();
            $(".del_file").hide();
            $(".rename-file").hide();
            $(".mv_file").hide();
            $(".cp_file").hide();
            $(".show_file_info").hide();
        }
    });
}

var getfilelist = function (filez) {
    $.ajax({
        url: "/gfilelist?filez=" + filez + "&t=" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            if (data.status === 0) {
                $(".file_list_1").empty();
                if (data.num > 0) {
                    var filelist = data.filelist;
                    for (var i = 0; i < filelist.length; i++) {
                        if (filelist[i].type == 0) {
                            $(".file_list_1").append("<li class=\"file_list_file\"><a><label><input class=\"file_list_file_select_" + filelist[i].fid + "\" type=\"checkbox\"></label><i class=\"am-icon-file am-margin-horizontal-xs\"></i><font class=\"file_list_file_fid_" + filelist[i].fid + "\" href=\"javascript: void(0)\">" + filelist[i].name + "</font></a></li> ");
                        } else {
                            $(".file_list_1").append("<li class=\"file_list_folder\"><a><label><input class=\"file_list_folder_select_" + filelist[i].fid + "\" type=\"checkbox\"></label><i class=\"am-icon-folder am-margin-horizontal-xs\"></i><font class=\"file_list_folder_fid_" + filelist[i].fid + "\" href=\"javascript: void(0)\">" + filelist[i].name + "</font></a></li> ");
                        }
                    }
                } else {
                    tmsg("secondary", "没有文件耶，快来上传吧！");
                }
                if (sxcf == true) {
                    $(".refresh_file").show();
                    $(".show_up_file").show();
                    $(".show_create_folder").show();
                    $(".del_file").hide();
                    $(".rename-file").hide();
                    $(".mv_file").hide();
                    $(".cp_file").hide();
                    $(".show_file_info").hide();
                    xzsl = 0;
                    sxcf = false;
                    var zdqml = dqml.split("/");
                    $(".file_list_list").empty();
                    for (var i = 0; i < zdqml.length; i++) {
                        if (i == 0) {
                            $(".file_list_list").append("<li><a href=\"javascript: void(0)\" class=\"file_list_list_" + i + " am-icon-home\">/</a></li>");
                        } else if (i == zdqml.length - 1) {
                            $(".file_list_list").append("<li class=\"file_list_list_" + i + " am-active\">" + zdqml[i] + "</li>");
                        } else {
                            $(".file_list_list").append("<li><a href=\"javascript: void(0)\" class=\"file_list_list_" + i + " am-icon-folder\">" + zdqml[i] + "</a></li>");
                        }
                    }
                }
                filelist_click();
            } else {
                tmsg("danger", data.info);
            }
        }
    });
};

$(".refresh_file").click(function () {
    getfilelist(dqml);
});

$(".create_folder").click(function () {
    input_folder_name = $(".create_folder_name").val();
    if (input_folder_name.length > 0) {
        $.ajax({
            url: "/createfolder?folder_name=" + input_folder_name + "&catalog=" + dqml + "&t=" + (new Date()).getTime(),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status === 0) {
                    create_folder_z.modal('close');
                    tmsg("success", data.info);
                    getfilelist(dqml);
                } else {
                    alert(data.info);
                }
            }
        });
    } else {
        alert("请输入文件夹名字！")
    }
});

var close_up_file = function () {
    $("button[class^='close_upfile_']").click(function () {
        var cid = mid($(this).attr('class'), 'close_upfile_', ' ');
        upfile(cid) = undefined;
        $(".upfile_listz_" + cid).remove();
    });
}

$('#open_up_file').on('change', function () {
    var fileNames = '';
    var scsl = 0;
    var lssize;
    upfile = undefined;
    upfile = new Array(2);
    fileNames += '<ul class="am-list am-list-static am-list-border">';
    $.each(this.files, function () {
        scsl++;
        if (scsl <= 3) {
            upfile[scsl - 1] = this;
            fileNames += '<li class="am-margin-top-sm upfile_listz_' + scsl + '"><div class="am-badge am-badge-warning up_file_status_' + scsl + '">等待上传...</div>' + this.name;
            fileNames += '<button type="button" class="am-close am-text-right close_upfile_' + scsl + '" style="margin-bottom:5px">&times;</button>';
            fileNames += '<div class="am-progress am-margin-vertical-xs am-progress-sm">';
            fileNames += '<div class="am-progress-bar up_file_jd_' + scsl + '" style="width:0%;height:30px"></div>';
            lssize = (this.size / 1024).toString();
            if (parseFloat(lssize) >= 1024) {
                lssize = parseFloat(parseFloat(lssize) / 1024).toFixed(2).toString();
                if (parseFloat(lssize) >= 1024) {
                    lssize = parseFloat(parseFloat(lssize) / 1024).toFixed(2).toString() + "G"
                } else {
                    lssize += "M"
                }
            } else {
                lssize = parseFloat(lssize).toFixed(2).toString() + "K";
            }
            fileNames += '</div>大小:' + lssize + '</li>';
            close_up_file();
        }
    });
    fileNames += "</ul>";
    $('.up_file-list').html(fileNames);
});

$(".close_upfile_z").click(function () {
    upfile = undefined;
    upfile = new Array(2);
    for (var i = 1; i <= 3; i++) {
        $(".upfile_listz_" + i).remove();
    }
});

$(".up_file").click(function () {
    var zcsign;
    $.ajax({
        url: "/getsign?t=" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            $(".close_upfile_z").hide();
            $(".s_up_file_b").hide();
            $(".up_file").hide();
            if (data.status == 0) {
                zcsign = data.sign;
                var cos = new CosCloud({
                    appid: appid,
                    bucket: bucket,
                    region: 'gz',
                    getAppSign: function (callback) {
                        callback(zcsign);
                    },
                    getAppSignOnce: function (callback) {
                        callback(zcsign);
                    }
                });
                for (var i = 1; i <= 3; i++) {
                    (function (i) {
                        if (upfile[i - 1] != null && upfile[i - 1] != undefined) {
                            $(".up_file_status_" + i).html("正在上传...");
                            $(".close_upfile_" + i).hide();
                            var up_su = function (result) {
                                $.ajax({
                                    url: '/tfile',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        vid: result.data.vid,
                                        resource_path: result.data.resource_path,
                                        ml: dqml,
                                        name: upfile[i - 1].name,
                                        size: upfile[i - 1].size
                                    },
                                    success: function (data) {
                                        if (data.status === 0) {
                                            $(".up_file_status_" + i).removeClass("am-badge-warning");
                                            $(".up_file_status_" + i).addClass("am-badge-success");
                                            $(".up_file_status_" + i).html(data.info);
                                        } else if (data.status === -1) {
                                            $(".up_file_status_" + i).removeClass("am-badge-warning");
                                            $(".up_file_status_" + i).addClass("am-badge-danger");
                                            $(".up_file_status_" + i).html(data.info);
                                        }
                                    }
                                });
                            };

                            var up_err = function (result) {
                                $(".up_file_status_" + i).removeClass("am-badge-warning");
                                $(".up_file_status_" + i).addClass("am-badge-danger");
                                $(".up_file_status_" + i).html("上传失败！");
                            };;

                            var up_jd = function (curr, sha1) {
                                var z = curr * 100;
                                $(".up_file_jd_" + i).css("width", z.toString() + "%");
                                $(".up_file_status_" + i).html("正在上传..." + parseFloat(z).toFixed(2).toString() + "%");
                            };;

                            if (dqml == "/") {
                                cos.uploadFile(up_su, up_err, up_jd, bucket, dqml + upfile[i - 1].name, upfile[i - 1], 1);
                            } else {
                                cos.uploadFile(up_su, up_err, up_jd, bucket, dqml + "/" + upfile[i - 1].name, upfile[i - 1], 1);
                            }
                        }
                    })(i);
                }
            } else {
                alert(data.info);
            }
            $(".close_upfile_z").show();
            $(".s_up_file_b").show();
            $(".up_file").show();
        }
    });
});

$(".del_file").click(function () {
    var z = "";
    var z2 = "";
    for (var i = 0; i < $("input[class^='file_list_file_select_']").length; i++) {
        (function (i) {
            console.log("file:" + i);
            if ($("input[class^='file_list_file_select_']")[i].checked == true) {
                var fid = mid($("input[class^='file_list_file_select_']")[i].className, 'file_list_file_select_', ' ');
                z += fid + ",";
            }
            if (i == $("input[class^='file_list_file_select_']").length - 1 && z != "") {
                $.ajax({
                    url: '/delfile',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        file: z
                    },
                    success: function (data) {
                        if (data.status === 0) {
                            tmsg("success", data.info);
                        } else if (data.status === -1) {
                            tmsg("danger", data.info);
                        }
                    }
                });
            }
        })(i);
    }
    for (var i = 0; i < $("input[class^='file_list_folder_select_']").length; i++) {
        (function (i) {
            console.log("folder:" + i);
            if ($("input[class^='file_list_folder_select_']")[i].checked == true) {
                var fid = mid($("input[class^='file_list_folder_select_']")[i].className, 'file_list_folder_select_', ' ');
                z2 += fid + ",";
            }
            if (i == $("input[class^='file_list_folder_select_']").length - 1 && z2 != "") {
                $.ajax({
                    url: '/delfolder',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        folder: z2
                    },
                    success: function (data) {
                        if (data.status === 0) {
                            tmsg("success", data.info);
                        } else if (data.status === -1) {
                            tmsg("danger", data.info);
                        }
                    }
                });
            }
        })(i);
    }
});