var process = require('process');
var readline = require('readline');

var opt = {
  input: process.stdin,
  output: process.stdout
};

function get(str) {
  var rl = readline.createInterface(opt);
  return new Promise((resolve, reject) => {
    rl.question(str, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

function getInfo(account) {
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

module.exports = getInfo;