const url = require('url');
const qs = require('querystring');
const cheerio = require('cheerio');
const cas = require('./cas');
const { headers, casUrl, electUrl } = require('../config/reqConfig');
const { target, delay } = require('../config/user');
const msg = require('../config/msg');

async function begin() {
  function parse(href) {
    return qs.parse(url.parse(href).query);
  }
  const rp = await cas();
  const opt = {
    uri: casUrl,
    headers,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  const $ = await rp(opt);

  // 获得参数
  const sid = $('#sid').val();
  const pro_zid = parse($('a')[2].attribs.href).xkjdszid;
  const public_zid = parse($('a')[4].attribs.href).xkjdszid;
  const len = target.length;

  // 开始选课
  target.forEach(v => {
    const form = {
      jxbh: v.course,
      xkjdszid: v.type === '公选' ? public_zid : pro_zid,
      sid
    };
    let counter = 0;
    const id = setInterval(() => {
      rp.post({
        url: electUrl,
        headers,
        form,
        transform: function(body) {
          return cheerio.load(body);
        }
      })
        .then($ => {
          const result = JSON.parse($('textarea').text());
          if (result.err.code === 0) {
            console.log('选课成功');
            clearInterval(id);
            --len;
            if (!len) process.exit(0);
          } else {
            if (counter === Number.MAX_SAFE_INTEGER) counter = 0;
            else ++counter;
            console.log(
              `${form.jxbh} 第${counter}次选课失败: ${
                msg[result.err.code]
              }，continue...`
            );
          }
        })
        .catch(err => {
          clearInterval(id);
          console.log('出错啦');
          process.exit(0);
        });
    }, delay);
  });
}

module.exports = begin;
