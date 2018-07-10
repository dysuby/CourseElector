const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const rp = require('request-promise-native').defaults({
  jar: true,
  followAllRedirects: true
});

const ask = require('./ask');
const { casUrl, captcha, headers } = require('../config/reqConfig');
const { account } = require('../config/user');

const captchaDir = path.join(__dirname, '../captcha');
const captchaPath = path.join(__dirname, '../captcha/captcha.jpg');

let form = {};
let opt = {
  headers,
  transform: function (body) {
    return cheerio.load(body);
  }
};

async function connect() {
  opt.uri = casUrl;
  const $ = await rp(opt);
  $('input').each((i, ele) => {
    form[$(ele).attr('name')] = $(ele).val();
  });
  form.username = account.username;
  form.password = account.password;
}

async function getCaptcha() {
  opt.uri = captcha;
  // if (!fs.existsSync(captchaDir))
  //   fs.mkdirSync(captchaDir);
  rp(opt).pipe(fs.createWriteStream(captchaPath));
  console.log('验证码已保存在captcha文件夹中');
  console.log('-----登录CAS-----');
  form.captcha = await ask('验证码: ');
}

async function sign() {
  opt.uri = casUrl;
  opt.form = form;
  const $ = await rp.post(opt);
  if ($('.alert.alert-danger').length) {
    console.log($('.alert.alert-danger').children('span').text() + '\n');
    throw new Error();
  } else {
    console.log('登录CAS成功');
    return rp;
  }
}

async function cas() {
  return await connect().then(getCaptcha).then(sign).catch(err => process.exit(0));
}

module.exports = cas;