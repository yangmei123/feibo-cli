const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');

const conf = {
    title:[
      {
        type: "input",
        name: "title",
        message: "请输入页面title",
        default: '主页标题'
      },
    ]
  };

/**
 * @param {string} title 项目配置的title
 * @description 根据输入配置文件
 */
module.exports = async function title(){
    const title = await inquirer.prompt(conf.title);
    checkFile(title);
 }

/**
 * @param {string} title 项目配置的title
 * @description 根据输入配置文件
 */
function copyConfigJS(title){
    figlet('feibo cli', function(err, data) {
        if(err){
            console.log(chalk.red('Some thing about figlet is wrong!'));
        }
        console.log(chalk.yellow(data));
        let targetFilePath = path.resolve('feibo.config.js');
        let templatePath = path.join(__dirname,'../feibo/configjs/feibo.config.js');
        let contents = fs.readFileSync(templatePath,'utf8');
        contents = contents.replace(/标题/g, title)
        fs.writeFileSync(targetFilePath,contents,'utf8');
        console.log(chalk.green('Initialize feibo config success \n'));
        process.exit(0);
    });
}

/**
 * @param {string} title 项目配置的title
 * @description 根据对话的方式询问是否覆盖
 */
function checkFile({title}){
    // 配置文件如果存在则提示是否覆盖
    if(fs.existsSync(path.resolve('feibo.config.js'))){
        // 连续提问
        inquirer.prompt([
            {
                name:'init-confirm',
                type:'confirm',
                message:`feibo.config.js is already existed, are you sure to overwrite?`,
                validate: function(input){
                    if(input.lowerCase !== 'y' && input.lowerCase !== 'n' ){
                        return 'Please input y/n !'
                    }
                    else{
                        return true;
                    }
                }
            }
        ])
            .then(answers=>{
                if(answers['init-confirm']){
                    copyConfigJS(title);
                }
                else{
                    process.exit(0);
                }
            })
            .catch(err=>{
                console.log(chalk.red(err));
            })
    }
    else{
        copyConfigJS();
    }
};

