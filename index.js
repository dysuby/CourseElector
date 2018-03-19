var {
  cas,
  request,
  headers
} = require('./src/cas');
var fs = require('fs');

cas().then(test);

function test() {
  var url = "https://cas.sysu.edu.cn/cas/login?service=https%3A%2F%2Fuems.sysu.edu.cn%2Felect%2FcasLogin";
  var opt1 = {
    url: url,
    headers: headers
  }
  request.get(opt1, (err, resp, body) => {
    console.log('write elect');
    fs.writeFileSync("elect.html", body);
  });
}