const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");

// 要拷贝的目标所在路径
let templatePath;
// 目标文件夹根路径
let targetRootPath;

const conf = {
  mkdirName:[
    {
      type: "input",
      name: "mkdir-name",
      message: "输入文件夹名称",
      default: 'newMkdir'
    },
  ],
  fileType:[
    {
      type: "list",
      name: "file-type",
      message: "输入模板文件类型",
      choices: [
        {
          name: "vue",
          value: "vue",
        },
        {
          name: "html",
          value: "html",
        },
        {
            name: "js",
            value: "js",
          },
      ],
    },
  ]
};
async function select(feiboComfig){
   const mkdirName = await inquirer.prompt(conf.mkdirName);
   const filtType = await inquirer.prompt(conf.fileType);
   generateModule(feiboComfig, 'src', filtType['file-type'], mkdirName['mkdir-name'] )
}


function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function copyTemplates(name, type) {
  function readAndCopyFile(parentPath, tempPath) {
    let files = fs.readdirSync(parentPath);
    files.forEach((file) => {
      let curPath = `${parentPath}/${file}`;
      let stat = fs.statSync(curPath);
      let filePath = `${targetRootPath}/${tempPath}/${file}`;
      if (stat.isDirectory()) {
        fs.mkdirSync(filePath);
        readAndCopyFile(`${parentPath}/${file}`, `${tempPath}/${file}`);
      } else {
        const contents = fs.readFileSync(curPath, "utf8");
        fs.writeFileSync(filePath, contents, "utf8");
      }
    });
  }

  readAndCopyFile(
    path.join(__dirname, `../feibo/templates/module/${type}`),
    name
  );
}

function generateModule(feiboComfig, mkdirpath, type, name) {
  templatePath =
    typeof feiboComfig.moduleTemplatePath !== "undefined"
      ? path.resolve(feiboComfig.moduleTemplatePath)
      : path.join(__dirname, "..", "feibo/module");
  targetRootPath = path.resolve(mkdirpath || feiboComfig.modulePath);
  let targetDir = path.join(targetRootPath, name);

  if (fs.existsSync(targetDir)) {
    // 如果已存在改模块，提问开发者是否覆盖该模块
    inquirer
      .prompt([
        {
          name: "module-overwrite",
          type: "confirm",
          message: `Module named ${name} is already existed, are you sure to overwrite?`,
          validate: function (input) {
            if (input.lowerCase !== "y" && input.lowerCase !== "n") {
              return "Please input y/n !";
            } else {
              return true;
            }
          },
        },
      ])
      .then((answers) => {
        console.log("answers", answers);

        // 如果确定覆盖
        if (answers["module-overwrite"]) {
          // 删除文件夹
          deleteFolderRecursive(targetDir);
          console.log(chalk.yellow(`Module already existed , removing!`));

          //创建新模块文件夹
          fs.mkdirSync(targetDir, { recursive: true });
          copyTemplates(name, type);
          console.log(chalk.green(`Generate new module "${name}" finished!`));
        }
      })
      .catch((err) => {
        console.log(chalk.red(err));
      });
  } else {
    //创建新模块文件夹
    fs.mkdirSync(targetDir);
    copyTemplates(name, type);
    console.log(chalk.green(`Generate new module "${name}" finished!`));
  }
}

module.exports = select;
