const cas = require('./cas');
const { headers, listUrl, electUrl } = require('../config/reqConfig');
const { semesterYear, target } = require('../config/user');

// 课程类型参数
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
  // 登录
  const rp = await cas();

  console.log('三秒后开始选课');

  // 等待 3 秒
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

  // 获得某一课程的课程号
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
      // 在返回的列表中查找该课程
      for (const clazz of info.data.rows) {
        // 查看是否为是对方的子串
        const index = clazz.courseName.indexOf(course.name) + course.name.indexOf(clazz.courseName);
        if (index === -2 || clazz.teachingTimePlace.indexOf(course.teacher) === -1) continue;
        if (4 === Number(clazz.selectedStatus)) {
          // 遇到已选上课程
          console.log(`${course.name} 已选上`);
          return {
            name: course.name,
            body: null
          };
        } else if (clazz.baseReceiveNum - Number(clazz.courseSelectedNum) > 0) {
          // 有空位
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
    // 已经选完
    if (!left.length) return;

    try {
      const { body, name } = await getInfo(left[index]);
      if (!body) {
        left.splice(index, 1);
        setTimeout(elect, 500);
      } else {
        const res = await rp.post({
          url: `${electUrl}?_t=${Date.now()}`,
          headers,
          json: body
        });
        if (res.code === 200) {
          console.log(`${name} 选课成功`);
          // 从候选数组移去
          left.splice(index, 1);
          // 选课成功只等待 0.5 秒
          setTimeout(elect, 500);
        }
      }
    } catch (err) {
      if (err.error) {
        // 选课出错，等待 1.5~3 秒
        console.log(
          `${left[index].name} 第${++counter}次选课失败: ${
            err.error.message
          }`
        );
        setTimeout(elect, 1500 + Math.random() * 1500);
      } else if (err.message) {
        // getInfo 出错，只等待 0.5~1 秒
        console.log(
          `${left[index].name} 第${++counter}次选课失败: ${err.message}`
        );
        setTimeout(elect, 500 + Math.random() * 500);
      } 
    }

    if (index < left.length - 1) ++index;
    else index = 0;
  }
}

module.exports = begin;
