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

  // 开始选课
  let counter = 0;
  let index = 0;
  let left = target;

  elect();

  async function getInfo(course) {
    const info = await rp.post({
      uri: `${listUrl}?_t=${Date.now()}`,
      headers,
      json: {
        pageNo: 1,
        pageSize: 1000,
        param: {
          semesterYear: semesterYear,
          ...selectCate[course.type],
          hiddenConflictStatus: '0',
          hiddenSelectedStatus: '0',
          collectionStatus: '0'
        }
      }
    });
    if (info.code === 200 && info.data.rows) {
      for (const clazz of info.data.rows) {
        const index = clazz.courseName.indexOf(course.name);
        if (index === -1) continue;
        else if (clazz.baseReceiveNum - Number(clazz.courseSelectedNum) > 0) {
          return {
            name: course.name,
            body: {
              clazzId: clazz.teachingClassId,
              check: true,
              ...selectCate[course.type]
            }
          };
        } else {
          throw Error('空位不足');
        }
      }
    }
    throw Error('无此课程');
  }

  async function elect() {
    if (!left.length) return;

    try {
      const { body, name } = await getInfo(left[index]);
      const res = await rp.post({
        url: `${electUrl}?_t=${Date.now()}`,
        headers,
        json: body
      });
      if (res.code === 200) {
        console.log(`${name} 选课成功`);
        left.splice(index, 1);
        setTimeout(elect, 500);
      }
    } catch (err) {
      if (err.message) {
        console.log(`${left[index].name} 第${++counter}次选课失败: ${err.message}`);
        setTimeout(elect, 500);
      } else if (err.response.body) {
        console.log(`${left[index].name} 第${++counter}次选课失败: ${err.response.body.message}`);
        setTimeout(elect, 1500 + Math.random() * 1500);
      }
    }

    if (index < left.length - 1) ++index;
    else index = 0;
  }
}

module.exports = begin;
