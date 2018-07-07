# SYSU course elector

一个简单的选课脚本。。可能要了解一定的js语法

## Quick Start
初次使用须安装`node`，命令行输入`npm install`

在项目根目录下新建`account.js`，内容如下

```js
module.exports = {
  username: '666', // 你的netID
  password: '666'  // 你的密码
};
```

然后在`config.js`中修改`target`加入你要选的课程班号和类型（公选/专选），例如
```js
  target: [
    {
      course: 'DCS239181001',
      type: '专选'
    },
  ],
```

然后 `npm start`/ `node index.js` 即可

## 验证码
CAS验证码保存在`./capthca`文件夹中，可自行在`./src/cas.js`修改保存路径

## Thanks
感谢+C大佬帮忙debug(重写)