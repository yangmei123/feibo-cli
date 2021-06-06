const fs = require("fs");
const pathS = require('path');

function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

const test = function (src) {
  let paths = fs.readdirSync(src); //同步读取当前目录
  paths.forEach(function (path) {
    const _src = src + "/" + path;
    fs.stat(_src, function (err, stats) {// 检查文件属性
      //stats 该对象 包含文件属性
      if (err) throw err;
      if (stats.isFile()) { // 是文件
        if(pathS.extname(path).indexOf('vue') !== -1) {
          const str = fs.readFileSync(_src).toString(); //创建读取流
          console.log(makeMap(str));
          // const strArr = str.split('export default')[1].split('</script>');
          // console.log(JSON.parse(strArr[0].substr()));
        }
      } else if (stats.isDirectory()) {
        //是目录则 递归
        checkDirectory(_src, test);
      }
    });
  });
};
const checkDirectory = function (src) {
  fs.access(src, fs.constants.F_OK, () => { // 测试用户指定的文件或目录的权限
    // 	表明文件对调用进程可见。 这对于判断文件是否存在很有用，但对 rwx 权限没有任何说明。 如果未指定模式，则默认值为该值
    test(src);
  });
};
module.exports = checkDirectory;
