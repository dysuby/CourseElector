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

module.exports = get;