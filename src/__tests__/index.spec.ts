import * as path from 'path'
import { InspectToolPlatform, Utils, IEResultReport } from '../index'
import { Strategy } from './Strategy'

describe('检查工具平台', () => {
    it('实例化平台', async () => {
        const tool = new InspectToolPlatform()
        expect(tool).toBeTruthy
    });
    it('实例化平台 包含增加策略方法', async () => {
        const tool = new InspectToolPlatform()
        expect(tool.addStrategy).toBeTruthy
        expect(typeof tool.addStrategy).toEqual('function')
    });
    it('实例化平台 包含获取报表方法', async () => {
        const tool = new InspectToolPlatform()
        expect(tool.getReports).toBeTruthy
    });
    it('实例化平台 为运行策略之前，获取报表为空', async () => {
        const tool = new InspectToolPlatform()
        expect(tool.getReports()).toBeUndefined
    });
    it('实例化平台 包含运行策略方法', async () => {
        const tool = new InspectToolPlatform()
        expect(tool.run).toBeTruthy
        expect(typeof tool.run).toEqual('function')
    });
    it('实例化平台 异步运行策略方法，获取结果失败', async () => {
        const tool = new InspectToolPlatform()
        tool.addStrategy(new Strategy())
        const reports = tool.run()
        expect(reports).toBeUndefined
    });
    it('实例化平台 同步运行策略方法，获取结果成功', async () => {
        const tool = new InspectToolPlatform()
        tool.addStrategy(new Strategy())
        const reports = await tool.run()
        expect(reports).toBeTruthy
        expect(reports?.length).toBeTruthy
    });
    it('实例化平台 获取运行结构，写入文件', async () => {
        const tool = new InspectToolPlatform()
        tool.addStrategy(new Strategy())
        await tool.run()
        const myreport = path.resolve(process.cwd(), 'myreport.json')
        await tool.getReportsForFile(myreport)
        expect(Utils.checkFileExist(myreport)).toBeTruthy
        Utils.removeFileSync(myreport)
    });
    it('实例化平台 获取平台运行正常，策略运行报错', async () => {
        const tool = new InspectToolPlatform()
        const myStartegy = new Strategy()
        myStartegy.runStatus = false
        tool.addStrategy(myStartegy)
        const result = await tool.run()
        expect(result).toBeTruthy
        expect(result?.length).toBeTruthy
        expect(result && result[0] && result[0] && (<IEResultReport>result[0]).error).toBeTruthy
    });
});