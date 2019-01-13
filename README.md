# SYSU course elector

一个简单的选课脚本。。可能要了解一定的 js 语法，支持新的选课系统，多个抢课目标

## Quick Start

初次使用须安装 `node` ，命令行输入 `npm install`

在 `config/` 下新建 `user.js`，内容按下面模板：

```js
module.exports = {
  account: {
    username: '666', // 你的 NetID
    password: '666' // 你的密码
  },
  semesterYear: '2018-2', // 学年，示例为 2018 学年第 2 学期
  target: [
    // 你要选的课
    {
      name: '水课', // 课程名字，只有名字，没有编号
      type: '专选' // 类型：公选/专选/专必
    },
    {
      name: '水课2', // 课程名字，只有名字，没有编号
      type: '专选' // 类型：公选/专选/专必
    }
  ]
};
```

然后 `npm start` / `node index.js` 即可

## 验证码

CAS 验证码保存在 `./capthca` 文件夹中，可自行在 `./src/cas.js` 修改保存路径

## Thanks

感谢+C 大佬帮忙 debug(重写)
