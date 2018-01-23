# SYSU course elector

一个简单的选课脚本。。但是由于校外上不了选课系统现在暂时只实现了CAS登录。

## Quick Start
初次使用须安装npm，命令行输入`npm install`

`npm start` or `node index.js`

## 验证码
CAS验证码保存在`./capthca`文件夹中，可自行在`./src/cas.js`修改保存路径