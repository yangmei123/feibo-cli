#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

/**
 * @param {string} packageName name of the package
 * @returns {boolean} is the package installed?
 * @description 查看所需要的依赖是否都已安装
 */

const isInstalled = packageName => {
	try {
		require.resolve(packageName);

		return true;
	} catch (err) {
		return false;
	}
};

/**
 * @param {string} command process to run
 * @param {string[]} args commandline arguments
 * @returns {Promise<void>} promise
 * @description 根据命令行参数执行命令
 */
const runCommand = (command, args) => {
  const cp = require('child_process'); // 开启进程执行命令，安装依赖
  return new Promise((resolve, reject) => {
    // 执行要运行的命令
    const executedCommand = cp.spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    executedCommand.on('error', (error) => {
      reject(error);
    });

    executedCommand.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
/**
 * @description 项目主程序
 */
function main() {
    const program = require('commander');
    const gmodule = require('../packages/commands/module');
    const initial = require('../packages/commands/initial');
    const test = require('../packages/commands/test');

    // 是否存在该文件
    if (fs.existsSync(path.resolve('feibo.config.js'))) {
    config = require(path.resolve('feibo.config.js'));
    }
    
    program
    .version('1.0.0', '-v, --version')
    .command('init')
    .description('initialize your feibo config')
    .action(initial);
    
    program
    .command('moudle')
    .description('generator a new module')
    .action(function () {
        gmodule(config);
    });
    
    program
    .command('test')
    .description('test vue option order')
    .action(function () {
        test('src');
    });
    
    // console.log(process.argv);
    program.parse(process.argv);
}
let config = {};
const package = [
	{
		name: "commander",
		installed: isInstalled("commander"),
	},
	{
		name: "chalk",
		installed: isInstalled("chalk"),
    },
	{
		name: "figlet",
		installed: isInstalled("figlet"),
    },
	{
		name: "inquirer",
		installed: isInstalled("inquirer"),
    }
];

const installed = package.filter(cli => !cli.installed);
if (installed.length > 0) {
    runCommand('npm', ['install --save'])
    .then(() => {
        main();
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
} else {
    main();
}