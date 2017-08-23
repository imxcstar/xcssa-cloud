var file_list = "/";
var bucket;
var appid;
var s_space;
var u_space;

var login_success = function (data) {
    registerz.modal('close');
    loginz.modal('close');
    $(".user_list").show();
    $(".login").hide();
    $(".u_name").text(" " + data.name);
    bucket = data.bucket;
    s_space = data.s_space;
    u_space = data.u_space;
    appid = data.appid;
    $(".space_jd").css("width", parseInt((s_space / u_space) * 100).toString() + "%");
    if (parseInt(u_space) >= 1024)
        u_space = parseInt(parseInt(u_space) / 1024).toString() + "G";
    else
        u_space += "M";
    if (parseInt(s_space) >= 1024)
        s_space = parseInt(parseInt(s_space) / 1024).toString() + "G";
    else
        s_space += "M";
    $(".u_space").text("空间：" + s_space + "/" + u_space);
    $(".file_list").show();
    getfilelist("/");
};

var zxzx = function () {
    registerz.modal('close');
    loginz.modal('close');
    fpasswordz.modal('close');
    $(".user_list").hide();
    $(".login").show();
    $(".file_list").hide();
};

var login_register = function () {

    var logout = function () {
        $.ajax({
            url: "/logout?" + (new Date()).getTime(),
            type: "get",
            dataType: "json",
            success: function (data) {
                zxzx();
            }
        });
    };

    var login_h = function (captchaObj) {
        $(".tlogin").click(function () {
            captchaObj.verify();
        });
        captchaObj.onSuccess(function () {
            var result = captchaObj.getValidate();
            $.ajax({
                url: '/login',
                type: 'POST',
                dataType: 'json',
                data: {
                    login_tusername: $('.login_tusername').val(),
                    login_tpassword: md5($('.login_tpassword').val()),
                    geetest_challenge: result.geetest_challenge,
                    geetest_validate: result.geetest_validate,
                    geetest_seccode: result.geetest_seccode
                },
                success: function (data) {
                    if (data.status === 0) {
                        login_success(data);
                    } else if (data.status === -1) {
                        alert(data.info);
                    }
                }
            });
        });
        captchaObj.onError(function () {
            captchaObj.reset();
        });
    };

    var register_h = function (captchaObj) {
        var kr = 0;
        $(".tkey").click(function () {
            kr = 0;
            captchaObj.verify();
        });
        $(".tregister").click(function () {
            kr = 1;
            captchaObj.verify();
        });
        captchaObj.onSuccess(function () {
            var result = captchaObj.getValidate();
            if (kr == 0) {
                $.ajax({
                    url: '/tkey',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        register_tphone: $('.register_tphone').val(),
                        geetest_challenge: result.geetest_challenge,
                        geetest_validate: result.geetest_validate,
                        geetest_seccode: result.geetest_seccode
                    },
                    success: function (data) {
                        if (data.status === 0) {
                            $(".tkey").html("发送成功(60)");
                            $(".tkey").attr("disabled", true);
                            var i = 60;
                            var timer = setInterval(function () {
                                if (i == -1) {
                                    clearInterval(timer);
                                    $(".tkey").html("获取验证码");
                                    $(".tkey").attr("disabled", false);
                                } else {
                                    $(".tkey").html("发送成功(" + i + ")");
                                    --i;
                                }
                            }, 1000);
                        } else if (data.status === -1) {
                            alert(data.info);
                        }
                    }
                });
            } else {
                $.ajax({
                    url: '/register',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        register_tusername: $('.register_tusername').val(),
                        register_temail: $('.register_temail').val(),
                        register_tphone: $('.register_tphone').val(),
                        register_tkey: $('.register_tkey').val(),
                        register_tpassword: md5($('.register_tpassword').val()),
                        geetest_challenge: result.geetest_challenge,
                        geetest_validate: result.geetest_validate,
                        geetest_seccode: result.geetest_seccode
                    },
                    success: function (data) {
                        if (data.status === 0) {
                            login_success(data);
                        }
                        alert(data.info);
                    }
                });
            }
        });
        captchaObj.onError(function () {
            captchaObj.reset();
        });
    };

    var fpassword = function (captchaObj) {
        $(".tfpassword").click(function () {
            $.ajax({
                url: '/fpassword',
                type: 'POST',
                dataType: 'json',
                data: {
                    fpassword_tusername: $('.fpassword_tusername').val(),
                    fpassword_temail: $('.fpassword_temail').val(),
                    fpassword_tphone: $('.fpassword_tphone').val(),
                    fpassword_tkey: $('.fpassword_tkey').val(),
                    fpassword_tpassword: md5($('.fpassword_tpassword').val())
                },
                success: function (data) {
                    if (data.status === 0) {
                        zxzx();
                    }
                    alert(data.info);
                }
            });
        });
        $(".fpassword_ttkey").click(function () {
            captchaObj.verify();
        });
        captchaObj.onSuccess(function () {
            var result = captchaObj.getValidate();
            $.ajax({
                url: '/tkey',
                type: 'POST',
                dataType: 'json',
                data: {
                    register_tphone: $('.fpassword_tphone').val(),
                    geetest_challenge: result.geetest_challenge,
                    geetest_validate: result.geetest_validate,
                    geetest_seccode: result.geetest_seccode
                },
                success: function (data) {
                    if (data.status === 0) {
                        $(".fpassword_ttkey").html("发送成功(60)");
                        $(".fpassword_ttkey").attr("disabled", true);
                        var i = 60;
                        var timer = setInterval(function () {
                            if (i == -1) {
                                clearInterval(timer);
                                $(".fpassword_ttkey").html("获取验证码");
                                $(".fpassword_ttkey").attr("disabled", false);
                            } else {
                                $(".fpassword_ttkey").html("发送成功(" + i + ")");
                                --i;
                            }
                        }, 1000);
                    } else if (data.status === -1) {
                        alert(data.info);
                    }
                }
            });
        });
        captchaObj.onError(function () {
            captchaObj.reset();
        });
    };

    $.ajax({
        url: "/login?z=gyzm&t=" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                new_captcha: data.new_captcha,
                offline: !data.success,
                product: "bind",
                width: "100%"
            }, login_h);
        }
    });

    $.ajax({
        url: "/register?z=gyzm&t=" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                new_captcha: data.new_captcha,
                offline: !data.success,
                product: "bind",
                width: "100%"
            }, register_h);
        }
    });

    $.ajax({
        url: "/fpassword?z=gyzm&t=" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                new_captcha: data.new_captcha,
                offline: !data.success,
                product: "bind",
                width: "100%"
            }, fpassword);
        }
    });

    $(".logout").click(function () {
        logout();
    });
};