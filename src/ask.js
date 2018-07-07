const process = require('process');
const readline = require('readline');

const opt = {
  input: process.stdin,
  output: process.stdout
};

async function ask(str) {
  const rl = readline.createInterface(opt);
  return new Promise((resolve, reject) => {
    rl.question(str, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

module.exports = ask;