#版本0.0.1

本网盘使用了geetest验证码做登录注册+云片短信平台发送注册码+腾讯云对象储存COS储存上传文件,nodejs做后端，前端使用了amazeui框架

geetest验证码  
http://www.geetest.com/  

云片  
https://www.yunpian.com/  

腾讯云对象储存COS  
https://cloud.tencent.com/product/cos  

amazeui框架  
http://amazeui.org/  

运行环境版本  
我只测试过这个版本可以运行  
npm 5.3.0  
nodejs v8.2.1  
pm2 2.6.1  

使用方法：  
0.导入数据库  
导入目录下的xcssa_cloud.sql文件到数据库里面  

1.修改参数  
打开main.js 修改上面的那些已被注释掉的const变量为自己的，并把注释符号去掉，然后注释var pkey = require("./pk"); 这句代码，然后修改ryzm这个函数的返回的内容，内容为发送的验证码的模版  

2.安装pm2  
npm install pm2 -g  

3.切换到项目目录，并安装依赖  
cd 项目目录  
npm install  

4.启动  
npm start  

其它命令:  
pm2 logs 查看日志  
pm2 monit 查看运行的进程  
pm2 stop all 停止所有运行的进程  

![avatar](https://coding.net/u/imxcstar/p/xcssa-cloud/git/raw/master/t2.png)