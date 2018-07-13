const url = require('url');
const qs = require('querystring');
const cheerio = require('cheerio');
const cas = require('./cas');
const { headers, casUrl, electUrl } = require('../config/reqConfig');
const { target } = require('../config/user');
const msg = require('../config/msg');

async function begin() {
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
  function parse(href) {
    return qs.parse(url.parse(href).query);
  }

  const sid = $('#sid').val();
  const pro_zid = parse($('a')[2].attribs.href).xkjdszid;
  const public_zid = parse($('a')[4].attribs.href).xkjdszid;

  // 开始选课
  let counter = 0;

  target.forEach(v => {
    setTimeout(elect.bind(null, v), 1000 + Math.random() * 1000);
  });

  async function elect(v) {
    const form = {
      jxbh: v.course,
      xkjdszid: v.type === '公选' ? public_zid : pro_zid,
      sid
    };
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
          console.log(`${v.course} 选课成功`);
        } else {
          if (counter === Number.MAX_SAFE_INTEGER) counter = 0;
          else ++counter;
          console.log(
            `${form.jxbh} 第${counter}次选课失败: ${msg[result.err.code]}`
          );
          setTimeout(elect.bind(null, v), 1000 + Math.random() * 1000);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = begin;
