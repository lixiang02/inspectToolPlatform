#!/usr/bin/env node

import program from 'commander';
import * as path from 'path';
// import * as packageObj from '../package.json';
import { InspectToolPlatform } from './InspectToolPlatform'
import { Utils } from './utils'
import {
    ApiServerHealthyStrategy,
    FileOrFolderExistStrategy,
    MemoryUsableStrategy
} from './strategies'

program
  .version('v0.0.1')
  .description('监控检查服务监控工具')
  .option('-d --default-strategy', '添加默认策略')
  .option('-s --strategy <strategy...>', '添加的策略文件地址')
  .option('-o --outfile <outfile>', '监控报表的生成文件地址')
  .action(async (commander:any) => {
    const inspectToolPlatform = new InspectToolPlatform()

    // 使用默认策略
    useDefaultStrategy(inspectToolPlatform, commander.defaultStrategy)

    // 添加策略
    await addStrategy(inspectToolPlatform, commander.strategy)

    // 运行检查程序
    await inspectToolPlatform.run()

    // 输出检查报告到指定文件
    await inspectToolPlatform.getReportsForFile(getOutfilePath(commander.outfile))

    // 格式化输出报告结果
    printReports(inspectToolPlatform.getReports())
  }).on('--help', () => {
    console.log('');
    console.log('');
    console.log('');
  })
  program.parse(process.argv);

function printReports(reports?: Array<any>) {
    if (!reports || !reports.length) { return; }
    for (const r of reports) {
        console.log(`${r.status ? '√' : 'x'} ${r.name}`)
    }
}
// 添加默认策略
function useDefaultStrategy(inspectToolPlatform: InspectToolPlatform, defaultStrategy?:boolean):void {
    if (!defaultStrategy) { return; }
    inspectToolPlatform.addStrategy(new ApiServerHealthyStrategy())
    inspectToolPlatform.addStrategy(new FileOrFolderExistStrategy())
    inspectToolPlatform.addStrategy(new MemoryUsableStrategy())
}

// 获取输出文件路径
function getOutfilePath(outfile?:string): string {
    return outfile || path.resolve(process.cwd(), './myreport.json')
}

// 添加策略
async function addStrategy(inspectToolPlatform: InspectToolPlatform, strategies:Array<string>):Promise<void> {
    if (!strategies || !strategies.length) { return; }
    await Promise.all(strategies.map(processStrategy))
   
    // 处理策略
    async function processStrategy(strategyPath: string) {
        const _root = process.cwd()
        console.log('strategyPath:', path.resolve(_root, strategyPath))
        if (Utils.checkFileExist(path.resolve(_root, strategyPath))) {
            try {
                let strategy = require(path.resolve(_root, strategyPath))
                strategy = strategy.default ?  
                    strategy.default : 
                    (  strategy.Strategy ? 
                        strategy.Strategy :  
                        strategy
                    )

                if (typeof strategy === 'function') {
                    strategy = new strategy()
                    if (strategy.run && typeof strategy.run === 'function') {
                        inspectToolPlatform.addStrategy(strategy)
                    }
                }
            } catch (error) {
                console.error(error.stack || error)
                process.exit(1)
            }
        }
    }
}
