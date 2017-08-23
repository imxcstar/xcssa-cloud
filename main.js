var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var md5 = require("blueimp-md5");
var Geetest = require('gt3-sdk');
var COS = require('cos-nodejs-sdk-v5');
var scuuid = require('uuid/v1');
var mysql = require('mysql');
var yz = require('validator');
var http = require('http');
var querystring = require('querystring');
var sdt = require('silly-datetime');
var CryptoJS = require("crypto-js");
var shortid = require('shortid');
var pkey = require("./pk");

// const zkey = "随机数";
// const AppId = "腾讯云Cos-AppId";
// const SecretId = "腾讯云Cos-SecretId";
// const SecretKey = "腾讯云Cos-SecretKey";
// const yp_apikey = "云片-yp_apikey";
// const geetest_id = "geetest验证码-id";
// const geetest_key = "geetest验证码key";
// const secret = "随机数";
// const mysql_host = "数据库地址";
// const mysql_user = "数据库帐号";
// const mysql_password = "数据库密码";
// const mysql_database = "数据库";

//发送注册验证码的内容
var ryzm = function (yzm) {
    return '【XCSSA云】您的注册验证码是 ' + yzm;
}

var rndz = function (n, m) {
    var c = m - n + 1;
    return Math.floor(Math.random() * c + n);
};

var getsunixt = function () {
    return parseInt(Date.now() / 1000);
};

var getsign = function (file, bucket) {
    var str = "a=" + AppId + "&b=" + bucket + "&k=" + SecretId + "&e=0&t=" + getsunixt() + "&r=" + rndz(1000000000, 9999999999) + "&f=" + file;
    var sha1Res = CryptoJS.HmacSHA1(str, SecretKey);
    var strWordArray = CryptoJS.enc.Utf8.parse(str);
    var resWordArray = sha1Res.concat(strWordArray);
    var res = resWordArray.toString(CryptoJS.enc.Base64);
    return res;
};

var gtime = function () {
    return sdt.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
};

var mysqlc = mysql.createConnection({
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    database: mysql_database
});

mysqlc.connect(function (err) {
    if (err) {
        console.error(gtime() + ' [连接数据库错误] - :' + err.message);
        return;
    }
    console.log(gtime() + ' 连接数据库成功！');
});

var cos = new COS({
    AppId: AppId,
    SecretId: SecretId,
    SecretKey: SecretKey
});

var sign = cos.getAuth({
    Method: 'get',
    Key: "/upfile"
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./website'));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/html/index.html");
});

app.use(cookieParser(secret));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 30 }
}));

var yzm = new Geetest({
    geetest_id: geetest_id,
    geetest_key: geetest_key
});

var TUserData = function (res, req) {
    res.send({
        status: 0,
        name: req.session.name,
        s_space: req.session.s_space,
        u_space: req.session.u_space,
        bucket: req.session.bucket,
        appid: AppId
    });
};

var randomString2 = function (len) {
    len = len || 32;
    var $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
    }
    return pwd;
};

var randomString = function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
    }
    return pwd;
};

app.get("/getsign", function (req, res) {
    if (req.session.slogin == true) {
        res.send({
            status: 0,
            sign: getsign("/" + AppId + "/" + req.session.bucket + "/", req.session.bucket)
        });
    } else {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    }
});

app.get("/createfolder", function (req, res) {
    if (req.session.slogin != true) {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    } else {
        var folder_name = (req.query.folder_name).trim();
        var catalog = (req.query.catalog).trim();
        if (folder_name.length > 0 && folder_name.length <= 30 && catalog.length > 0) {
            if (catalog != "/") {
                if (catalog.substring(0, 1) != "/")
                    catalog = "/" + catalog;
                if (catalog.substring(catalog.length - 1, catalog.length) != "/")
                    catalog += "/";
            }
            folder_name = folder_name.replace("/", "");
            folder_name = folder_name.replace("\\", "");
            var xjml = catalog + folder_name + "/";
            mysqlc.query("select * from file where url=" + mysqlc.escape(xjml) + " AND type='1'", function (err, results) {
                if (err) {
                    console.error(gtime() + ' [新建文件夹查询文件夹错误] - :' + err.message);
                    res.send({
                        status: -1,
                        info: '新建文件夹错误，请重试！'
                    });
                    return;
                } else {
                    if (results == "") {
                        cos.putObject({
                            Bucket: req.session.bucket,
                            Region: 'cn-south',
                            Key: xjml,
                            ContentLength: '0',
                            Body: new Buffer(0),
                            onProgress: function (progressData) { }
                        }, function (err, data) {
                            if (err) {
                                res.send({
                                    status: -1,
                                    info: '新建文件夹错误，请重试！'
                                });
                            } else {
                                var dqtime = new Date();
                                var udsql = 'INSERT INTO file(fid,type,name,ctime,mtime,filesize,sha,url,dir,sfid,share,password,uid) VALUES(0,?,?,?,?,?,?,?,?,?,?,?,?)';
                                var udsql_cs = [1, folder_name, dqtime, dqtime, 0, 0, xjml, catalog, shortid.generate(), 0, 0, req.session.uid];
                                mysqlc.query(udsql, udsql_cs, function (err, result) {
                                    if (err) {
                                        console.error('[新建文件夹添加文件夹错误] - ', err.message);
                                        res.send({
                                            status: -1,
                                            info: '新建文件夹错误，请重试！'
                                        });
                                        return;
                                    } else {
                                        res.send({
                                            status: 0,
                                            info: '新建文件夹成功！'
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send({
                            status: -1,
                            info: '新建文件夹失败，文件夹已存在！'
                        });
                    }
                }
            });
        } else {
            res.send({
                status: -1,
                info: "文件名或新建目录错误，文件名不能为空而且长度不能超过30，请重试！"
            });
        }
    }
});

app.get("/gfilelist", function (req, res) {
    if (req.session.slogin != true) {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    } else {
        var filez = (req.query.filez).trim();
        if (filez.length > 0) {
            if (filez != "/") {
                if (filez.substring(0, 1) != "/")
                    filez = "/" + filez;
                if (filez.substring(filez.length - 1, filez.length) != "/")
                    filez += "/";
            }
            filez = mysqlc.escape(filez);
            mysqlc.query("select * from file where uid='" + req.session.uid + "' AND dir=" + filez, function (err, results) {
                if (err) {
                    console.error(gtime() + ' [获取文件列表查询用户错误] - :' + err.message);
                    res.send({
                        status: -1,
                        info: "获取文件列表错误，请重试！"
                    });
                    return;
                } else {
                    var fhz = {};
                    fhz.status = 0;
                    if (results == "") {
                        fhz.filelist = "";
                    } else {
                        fhz.num = results.length;
                        fhz.filelist = [];
                        for (var i = 0; i < results.length; i++) {
                            fhz.filelist[i] = {};
                            fhz.filelist[i].type = results[i].type;
                            fhz.filelist[i].fid = results[i].fid;
                            fhz.filelist[i].name = results[i].name;
                        }
                    }
                    res.send(fhz);
                }
            });
        } else {
            res.send({
                status: -1,
                info: "获取目录错误，请重试！"
            });
        }
    }
});

app.get("/slogin", function (req, res) {
    if (req.session.slogin == true) {
        TUserData(res, req);
    } else {
        res.send({
            status: -1
        });
    }
});

app.get("/logout", function (req, res) {
    req.session.slogin = false;
    res.send({
        status: 0
    });
});

app.get("/login", function (req, res) {
    if (req.query.z == "gyzm") {
        yzm.register({
            client_type: 'unknown',
            ip_address: 'unknown'
        }, function (err, data) {
            if (err) {
                console.error(gtime() + ' [登陆验证码获取错误] - :' + err.message);
                res.send({
                    status: -1,
                    info: '获取验证码错误!'
                });
                return;
            }
            if (!data.success) {
                req.session.fallback = true;
                res.send(data);
            } else {
                req.session.fallback = false;
                res.send(data);
            }
        });
    }
});

app.get("/register", function (req, res) {
    if (req.query.z == "gyzm") {
        yzm.register({
            client_type: 'unknown',
            ip_address: 'unknown'
        }, function (err, data) {
            if (err) {
                console.error('[注册验证码获取错误] - :' + err.message);
                res.send({
                    status: -1,
                    info: '获取验证码错误!'
                });
                return;
            }
            if (!data.success) {
                req.session.fallback = true;
                res.send(data);
            } else {
                req.session.fallback = false;
                res.send(data);
            }
        });
    }
});

app.get("/fpassword", function (req, res) {
    if (req.query.z == "gyzm") {
        yzm.register({
            client_type: 'unknown',
            ip_address: 'unknown'
        }, function (err, data) {
            if (err) {
                console.error('[修改密码验证码获取错误] - :' + err.message);
                res.send({
                    status: -1,
                    info: '获取验证码错误!'
                });
                return;
            }
            if (!data.success) {
                req.session.fallback = true;
                res.send(data);
            } else {
                req.session.fallback = false;
                res.send(data);
            }
        });
    }
});

app.post("/tkey", function (req, res) {
    yzm.validate(req.session.fallback, {
        geetest_challenge: req.body.geetest_challenge,
        geetest_validate: req.body.geetest_validate,
        geetest_seccode: req.body.geetest_seccode
    }, function (err, success) {
        if (err) {
            res.send({
                status: -1,
                info: err.message
            });
        } else if (!success) {
            res.send({
                status: -1,
                info: '错误'
            });
        } else {
            var register_tphone = req.body.register_tphone;
            if (yz.isMobilePhone(register_tphone, 'zh-CN')) {
                req.session.tkey = randomString(5);
                var postData = querystring.stringify({
                    apikey: yp_apikey,
                    mobile: register_tphone,
                    text: ryzm(req.session.tkey)
                });
                var options = {
                    hostname: 'sms.yunpian.com',
                    port: 80,
                    path: '/v2/sms/single_send.json',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json; charset=utf-8;',
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }
                var res_send = function (zstatus, zinfo) {
                    res.send({
                        status: zstatus,
                        info: zinfo
                    });
                };
                var h = http.request(options, function (res) {
                    res.setEncoding('utf-8');
                    var body = "";
                    res.on('data', function (data) {
                        body += data;
                    }).on('end', function () {
                        if (res.statusCode == 200) {
                            body = JSON.parse(body);
                            if (body.code == 0) {
                                res_send(0, '发送成功!');
                            } else if (body.code == 8) {
                                res_send(-1, '请等待60秒后调用!');
                            } else if (body.code == 9) {
                                res_send(-1, '同一手机号码在5分钟内重复发送!');
                            } else if (body.code == 22) {
                                res_send(-1, '同一手机号码在一个小时内重复发送超过3次!');
                            } else {
                                res_send(-1, '未知错误!');
                            }
                        } else {
                            res_send(-1, '发送错误!');
                        }
                    });
                });
                h.on('error', function (err) {
                    res.send({
                        status: -1,
                        info: '发送错误!'
                    });
                });
                h.write(postData);
                h.end();
            } else {
                res.send({
                    status: -1,
                    info: '错误手机号(只支持国内手机号)!'
                });
            }

        }
    });
});

app.post("/fpassword", function (req, res) {
    var fpassword_tusername = req.body.fpassword_tusername;
    var fpassword_temail = req.body.fpassword_temail;
    var fpassword_tphone = req.body.fpassword_tphone;
    var fpassword_tkey = req.body.fpassword_tkey;
    var fpassword_tpassword = req.body.fpassword_tpassword;
    if (yz.escape(fpassword_tusername) == fpassword_tusername && yz.escape(fpassword_tpassword) == fpassword_tpassword && yz.isLength(fpassword_tusername, { min: 3, max: 10 }) && yz.isMobilePhone(fpassword_tphone, 'zh-CN') && yz.isEmail(fpassword_temail) && fpassword_tusername.length > 0 && fpassword_temail.length > 0 && fpassword_tphone.length > 0 && fpassword_tkey.length > 0 && fpassword_tpassword.length > 0) {
        fpassword_tpassword = md5(fpassword_tpassword, zkey);
        mysqlc.query("select * from user where username=" + mysqlc.escape(fpassword_tusername) + " AND email=" + mysqlc.escape(fpassword_temail) + " AND phone='" + mysqlc.escape(fpassword_tphone), function (err, results) {
            if (err) {
                console.error(gtime() + ' [修改密码查询用户错误] - :' + err.message);
                res.send({
                    status: -1,
                    info: '修改密码错误，请重试！'
                });
                return;
            } else {
                if (results == "") {
                    res.send({
                        status: -1,
                        info: '帐号不存在！'
                    });
                } else {
                    var udsql = 'UPDATE user SET password = ? WHERE username = ?';
                    var udsql_cs = [mysqlc.escape(fpassword_tpassword), mysqlc.escape(fpassword_tusername)];
                    mysqlc.query(udsql, udsql_cs, function (err, result) {
                        if (err) {
                            console.error(gtime() + ' [修改密码错误] - :' + err.message);
                            res.send({
                                status: -1,
                                info: '修改密码错误，请重试！'
                            });
                            return;
                        }
                        req.session.slogin = false;
                        res.send({
                            status: 0,
                            info: '修改成功，请重新登录！'
                        });
                    });
                }
            }
        });
    } else {
        res.send({
            status: -1,
            info: '修改密码错误，请重试！'
        });
    }
});

app.post("/register", function (req, res) {
    yzm.validate(req.session.fallback, {
        geetest_challenge: req.body.geetest_challenge,
        geetest_validate: req.body.geetest_validate,
        geetest_seccode: req.body.geetest_seccode
    }, function (err, success) {
        if (err) {
            res.send({
                status: -1,
                info: err.message
            });
        } else if (!success) {
            res.send({
                status: -1,
                info: '注册错误，请重试！'
            });
        } else {
            var register_tusername = req.body.register_tusername;
            var register_temail = req.body.register_temail;
            var register_tphone = req.body.register_tphone;
            var register_tkey = req.body.register_tkey;
            var register_tpassword = req.body.register_tpassword;
            //register_tkey == req.session.tkey && 
            if (yz.escape(register_tusername) == register_tusername && yz.escape(register_tpassword) == register_tpassword && yz.isLength(register_tusername, { min: 3, max: 10 }) && yz.isMobilePhone(register_tphone, 'zh-CN') && yz.isEmail(register_temail) && register_tusername.length > 0 && register_temail.length > 0 && register_tphone.length > 0 && register_tkey.length > 0 && register_tpassword.length > 0) {
                register_tpassword = md5(register_tpassword, zkey);
                mysqlc.query("select * from user where username=" + mysqlc.escape(register_tusername) + " OR email=" + mysqlc.escape(register_temail) + " OR phone=" + mysqlc.escape(register_tphone), function (err, results) {
                    if (err) {
                        console.error(gtime() + ' [注册帐号查询用户错误] - :' + err.message);
                        res.send({
                            status: -1,
                            info: '注册错误，请重试！'
                        });
                        return;
                    } else {
                        if (results == "") {
                            var ZBucket = md5(scuuid(), zkey).toLowerCase();
                            cos.putBucket(
                                {
                                    Bucket: ZBucket,
                                    Region: 'cn-south'
                                }, function (err, data) {
                                    if (err) {
                                        res.send({
                                            status: -1,
                                            info: '注册错误，请重试！'
                                        });
                                    } else {
                                        var params = {
                                            Bucket: ZBucket,
                                            Region: 'cn-south',
                                            CORSRules: [
                                                {
                                                    ID: 'up_file',
                                                    AllowedMethods: [
                                                        'Get',
                                                        'Put',
                                                        'Head',
                                                        'Post',
                                                        'Delete'
                                                    ],
                                                    AllowedOrigins: [
                                                        'http://qcloud.com',
                                                        'http://a.qcloud.com',
                                                        'http://b.qcloud.com',
                                                        'http://localhost/'
                                                    ],
                                                    AllowedHeaders: [
                                                        'origin',
                                                        'accept',
                                                        'content-type',
                                                        'authorization'
                                                    ],
                                                    ExposeHeaders: [
                                                        'ETag',
                                                    ],
                                                    MaxAgeSeconds: '60'
                                                },
                                            ]
                                        };
                                        cos.putBucketCORS(params, function (err, data) {
                                            if (err) {
                                                cos.deleteBucket(
                                                    {
                                                        Bucket: ZBucket,
                                                        Region: 'cn-south'
                                                    }, function (err, data) { });
                                                res.send({
                                                    status: -1,
                                                    info: '注册错误，请重试！'
                                                });
                                            } else {
                                                var udsql = 'INSERT INTO user(uid,username,password,email,phone,bucket,s_space,u_space,level,purview,huajicurrency) VALUES(0,?,?,?,?,?,0,1024,0,0,0)';
                                                var udsql_cs = [register_tusername, register_tpassword, register_temail, register_tphone, ZBucket];
                                                var sj = mysqlc.query(udsql, udsql_cs, function (err, result) {
                                                    if (err) {
                                                        console.error('[注册帐号添加用户错误] - ', err.message);
                                                        res.send({
                                                            status: -1,
                                                            info: '注册错误，请重试！'
                                                        });
                                                        return;
                                                    } else {
                                                        req.session.slogin = true;
                                                        req.session.tkey = "";
                                                        req.session.uid = sj._results[0].insertId;
                                                        req.session.name = register_tusername;
                                                        req.session.bucket = ZBucket;
                                                        req.session.s_space = 0;
                                                        req.session.u_space = 1024;
                                                        res.send({
                                                            status: 0,
                                                            name: req.session.name,
                                                            s_space: req.session.s_space,
                                                            u_space: req.session.u_space,
                                                            bucket: req.session.bucket,
                                                            appid: AppId,
                                                            info: '注册成功'
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                        } else {
                            res.send({
                                status: -1,
                                info: '账号或邮箱或手机号已存在！'
                            });
                        }
                    }
                });
            } else {
                res.send({
                    status: -1,
                    info: '注册错误，请重试！'
                });
            }
        }
    });
});

app.post("/login", function (req, res) {
    yzm.validate(req.session.fallback, {
        geetest_challenge: req.body.geetest_challenge,
        geetest_validate: req.body.geetest_validate,
        geetest_seccode: req.body.geetest_seccode
    }, function (err, success) {
        if (err) {
            res.send({
                status: -1,
                info: err.message
            });
        } else if (!success) {
            res.send({
                status: -1,
                info: '登录错误！'
            });
        } else {
            var login_tusername = req.body.login_tusername;
            var login_tpassword = req.body.login_tpassword;
            if (yz.escape(login_tusername) == login_tusername && yz.escape(login_tpassword) == login_tpassword && yz.isLength(login_tusername, { min: 3, max: 10 }) && login_tusername.length > 0 && login_tpassword.length > 0) {
                login_tpassword = md5(login_tpassword, zkey);
                mysqlc.query("select * from user where username=" + mysqlc.escape(login_tusername) + " AND password=" + mysqlc.escape(login_tpassword), function (err, results) {
                    if (err) {
                        console.error(gtime() + ' [登录帐号查询用户错误] - :' + err.message);
                        res.send({
                            status: -1,
                            info: '登录错误，请重试！'
                        });
                        return;
                    } else {
                        if (results == "") {
                            res.send({
                                status: -1,
                                info: '账号不存在或密码错误！'
                            });
                        } else {
                            req.session.slogin = true;
                            req.session.tkey = "";
                            req.session.uid = results[0].uid;
                            req.session.name = results[0].username;
                            req.session.s_space = results[0].s_space;
                            req.session.u_space = results[0].u_space;
                            req.session.bucket = results[0].bucket;
                            res.send({
                                status: 0,
                                name: req.session.name,
                                s_space: req.session.s_space,
                                u_space: req.session.u_space,
                                bucket: req.session.bucket,
                                appid: AppId,
                                info: '登录成功'
                            });
                        }
                    }
                });
            } else {
                res.send({
                    status: -1,
                    info: '登录错误，请重试！'
                });
            }
        }
    });
});

app.post("/tfile", function (req, res) {
    if (req.session.slogin == true) {
        var vid = req.body.vid;
        var resource_path = req.body.resource_path;
        var ml = req.body.ml;
        var name = req.body.name;
        var size = req.body.size;
        var dqtime = new Date();
        if (ml != "/") {
            if (ml.substring(ml.length - 1, ml.length) != "/")
                ml += "/";
        }
        //if (parseFloat(req.session.s_space + size / 1048576) <= parseFloat(req.session.u_space)) {
        var udsql = 'INSERT INTO file(fid,type,name,ctime,mtime,filesize,sha,url,dir,sfid,share,password,uid) VALUES(0,?,?,?,?,?,?,?,?,?,?,?,?)';
        var udsql_cs = [0, name, dqtime, dqtime, size, vid, resource_path, ml, shortid.generate(), 0, 0, req.session.uid];
        mysqlc.query(udsql, udsql_cs, function (err, result) {
            if (err) {
                console.error('[上传文件添加文件错误] - ', err.message);
                res.send({
                    status: -1,
                    info: "上传错误！"
                });
                return;
            } else {
                // var udsql2 = 'UPDATE user SET s_space = ? WHERE uid = ' + req.session.uid;
                // req.session.s_space = parseFloat(req.session.s_space + size / 1048576).toFixed(2).toString();
                // var udsql_cs2 = [req.session.s_space];
                // mysqlc.query(udsql2, udsql_cs2, function (err, result) {
                //     if (err) {
                //         console.error(gtime() + ' [上传文件修改用户使用空间错误] - :' + err);
                //         res.send({
                //             status: -1,
                //             info: "上传错误！"
                //         });
                //         return;
                //     }
                res.send({
                    status: 0,
                    info: "上传成功！"
                });
                //});
            }
        });
        // } else {
        //     res.send({
        //         status: -1,
        //         info: "空间不足！"
        //     });
        // }
    } else {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    }
});

app.post("/delfile", function (req, res) {
    if (req.session.slogin == true) {
        var files = req.body.file.split(",");
        var filesql = "";
        for (let i = 0; i < files.length; i++) {
            if (yz.isNumeric(files[i]))
                filesql += "fid=" + mysqlc.escape(files[i]) + " OR ";
        }
        filesql.substring(0, filesql.length - 4);
        console.log(filesql);
        var udsql = 'DELETE FROM file where ' + filesql;
        mysqlc.query(udsql, function (err, result) {
            if (err) {
                console.error('[删除文件错误] - ', err.message);
                res.send({
                    status: -1,
                    info: "删除错误，请重试！"
                });
                return;
            }
            console.log(result);
            res.send({
                status: 0,
                info: "删除成功！"
            });
        });
    } else {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    }
});

app.post("/delfolder", function (req, res) {
    if (req.session.slogin == true) {
        res.send({
            status: 0,
            info: "删除成功！"
        });
    } else {
        res.send({
            status: -1,
            info: "你还没登录哟！"
        });
    }
});

var port = 80;
app.listen(port, function () {
    console.log(gtime() + ' 监听 http://localhost:' + port);
});