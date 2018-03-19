var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path');

var get = require('./get');

var url = "https://cas.sysu.edu.cn/cas/login";
var captcha = 'https://cas.sysu.edu.cn/cas/captcha.jsp';
var headers = {
  'host': 'cas.sysu.edu.cn',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  'referer': url,
  'origin': 'https://cas.sysu.edu.cn',
  'upgrade-insecure-requests': 1,
  'cache-control': 'max-age=0',
  'connection': 'keep-alive',
  'accept-language': 'zh-CN,zh;q=0.9',
};

var captchaPath = path.join(__dirname + '/../captcha/captcha.jpg');
var captchaDir = path.join(__dirname + '/../captcha');

var $ = null;
var account = {};

request = request.defaults({
  jar: true,
  followAllRedirects: true
});

function connect() {
  return new Promise((resolve, reject) => {
    var opt = {
      url: url,
      headers: headers,
    };
    request(opt, (err, res, body) => {
      if (err || res.statusCode != 200) console.error('连接CAS失败');
      $ = cheerio.load(body);
      $('input').each((i, ele) => {
        account[$(ele).attr('name')] = $(ele).val();
      });
      resolve();
    });
  });
}

function getCaptha(cookie) {
  var opt = {
    url: captcha,
    headers: headers,
  };
  if (!fs.existsSync(captchaDir))
    fs.mkdirSync(captchaDir);
  request(opt).pipe(fs.createWriteStream(captchaPath));
  console.log('验证码已保存在capthca文件夹中');
}

function getInfo() {
  console.log("-----登录CAS-----");
  return get("netID: ").then(ans => {
    account.username = ans;
    return get("密码(明文输入): ");
  }).then(ans => {
    account.password = ans;
    return get("验证码: ");
  }).then(ans => {
    account.captcha = ans;
    return Promise.resolve();
  }).catch(err => {
    console.log(err);
  });
}

function sign() {
  var opt = {
    url: url,
    form: account,
    headers: headers,
  };
  return new Promise((resolve, reject) => {
    request.post(opt, (err, res, body) => {
      $ = cheerio.load(body);
      if ($('.alert.alert-danger').length) {
        console.log($('.alert.alert-danger').children('span').text() + '\n');
        reject();
      } else {
        console.log('登录CAS成功');
        resolve();
      }
    });
  });
}

function cas() {
  return connect().then(getCaptha).then(getInfo).then(sign).catch(cas);
}

module.exports = {
  cas,
  request,
  headers
};