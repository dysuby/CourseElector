# SYSU course elector

一个简单的选课脚本。。可能要了解一定的js语法

## Quick Start
初次使用须安装`node`，命令行输入`npm install`

在`config/`下新建`user.js`，内容如下

```js
module.exports = {
  account: {
    username: '666',  // 你的NetID
    password: '666',  // 你的密码
  },
  target: [           // 你要选的课
    {
      course: 'DCS239181001', // 课程班号
      type: '专选'  // 类型：公选/专选
    }, 
  ],
  delay: 800  // 频率
};
```

然后 `npm start`/ `node index.js` 即可

## 验证码
CAS验证码保存在`./capthca`文件夹中，可自行在`./src/cas.js`修改保存路径

## Thanks
感谢+C大佬帮忙debug(重写)