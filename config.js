module.exports = {
  casUrl: 'https://cas.sysu.edu.cn/cas/login?service=https%3A%2F%2Fuems.sysu.edu.cn%2Felect%2FcasLogin',
  captcha: 'https://cas.sysu.edu.cn/cas/captcha.jsp',
  electUrl: 'https://uems.sysu.edu.cn/elect/s/elect',
  headers: {
    'accept': '*/*',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'origin': 'https://uems.sysu.edu.cn',
    'host': 'uems.sysu.edu.cn',
    'connection': 'keep-alive',
    'accept-language': 'zh-CN,zh;q=0.9',
  },
  target: [
    {
      course: 'DCS239181001',
      type: '专选'
    },
  ],
  delay: 500
}