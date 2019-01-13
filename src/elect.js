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

  console.log('三秒后开始选课');

  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });

  let list = [];
  let errcount = 0;
  while (list.length !== target.length) {
    try {
      await getList();
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    } catch (err) {
      console.log('获取名单失败，重试中');
      ++errcount;
      if (errcount === 10) {
        console.log('获取失败，退出');
        process.exit(1);
      }
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    }
  }

  // 开始选课
  let counter = 0;
  let index = 0;
  let left = target;

  elect();

  async function getList() {
    list = [];
    console.log('获得课程名单....');
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
          if (clazz.courseName.indexOf(tar.name) !== -1)
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
  }

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
        setTimeout(elect, 500);
      }
    } catch (err) {
      if (err.response.body) {
        console.log(`${name} 第${++counter}次选课失败: 选课失败`);
      }
      setTimeout(elect, 1500 + Math.random() * 1500);
    }

    if (index < target.length - 1) ++index;
    else index = 0;
  }
}

module.exports = begin;
