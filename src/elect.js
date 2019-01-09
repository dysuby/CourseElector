const cas = require('./cas');
const { headers, listUrl, electUrl, jwxt } = require('../config/reqConfig');
const { semesterYear, target } = require('../config/user');

const selectCate = {
  专选: {
    selectedCate: '21',
    selectedType: '1'
  },
  专必: {
    selectedCate: '11',
    selectedType: '1'
  },
  公选: {
    selectedCate: '21',
    selectedType: '4'
  }
};

async function begin() {
  const rp = await cas();
  await rp({
    uri: jwxt,
    headers
  });
  let list = [];
  for (const tar of target) {
    const info = await rp.post({
      uri: `${listUrl}?_t=${Date.now()}`,
      headers,
      json: {
        pageNo: 1,
        pageSize: 1000,
        param: {
          semesterYear: semesterYear,
          ...selectCate[tar.type],
          hiddenConflictStatus: '0',
          hiddenSelectedStatus: '0',
          collectionStatus: '0'
        }
      }
    });
    if (info.code === 200 && info.data.rows) {
      for (const clazz of info.data.rows) {
        if (clazz.courseName === tar.name)
          list.push({
            name: tar.name,
            body: {
              clazzId: clazz.teachingClassId,
              check: true,
              ...selectCate[tar.type]
            }
          });
      }
    }
  }

  // 开始选课
  let counter = 0;
  let index = 0;
  let left = target;

  console.log('三秒后开始选课');
  setTimeout(elect, 3000);

  async function elect() {
    if (!left.length) return;

    const { body, name } = list[index];

    try {
      const res = await rp.post({
        url: `${electUrl}?_t=${Date.now()}`,
        headers,
        json: body
      });
      if (res.code === 200) {
        console.log(`${name} 选课成功`);
        left = left.splice(index, 1);
      }
    } catch (err) {
      if (err.response.body) {
        console.log(`${name} 第${++counter}次选课失败: ${err.response.body.message}`);
      }
    }
    
    if (index < target.length - 1) ++index;
    else index = 0;

    setTimeout(elect, 1500 + Math.random() * 1500);
  }
}

module.exports = begin;
