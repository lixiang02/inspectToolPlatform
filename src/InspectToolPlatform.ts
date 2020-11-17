import { Utils } from './utils'

export interface IStrategy {
    name: string;
    run: ()=>Promise<void>;
    getReport:()=>IResultReport;
}
export interface IResultReport {
    name: string
    status: boolean
    loadding: boolean
    startTime: Date
    endTime?: Date
    reports: Array<ICResultReport>
}
export interface IEResultReport extends IResultReport {
    error: string
}
export interface ICResultReport {
    name:string
    status:boolean
    data:any
}
export class InspectToolPlatform {
    private _loadding: Boolean = false
    private _startTime: number = Date.now()
    private _reports: Array<IResultReport> = []
    private _strategyList: Array<IStrategy> = []

    // 添加策略
    public addStrategy(newStrategy: IStrategy): void {
        this._strategyList.push(newStrategy)
    }

    // 运行检查
    public async run() {
        if (!this._strategyList.length) {
            console.log('策略列表为空，检查结束')
            return ;
        }
        try {
            const names = this._strategyList.map(e => e.name).join(',')
            console.log('运行策略:', names)
            this._startTime = Date.now()
            const reports: Array<IResultReport> = await Promise.all(
                this._strategyList.map(this.processStrategy)
            )
    
            this.setReports(reports)
            this._loadding = true
            console.log(`检查程序运行完毕，用时：${(Date.now() - this._startTime) / 1000} s \n`)
            return this.getReports()
        } catch (error) {
            // console.error('检查程序错误 \n', JSON.stringify(error, null, 2))
            return error
        }
    }

    private async processStrategy(strategyItem: IStrategy): Promise<IResultReport> {
        // console.log('处理策略 ', strategyItem.name)
        const startTime = Date.now()
        try {
            // 运行策略
            await strategyItem.run()

            // 获取报表
            const reports = strategyItem.getReport()

            // console.log(`处理策略 ${strategyItem.name} 完成, 花费时间：${(Date.now() - startTime) / 1000} s \n` )

            return reports;
        } catch (error) {
            return {
                name: strategyItem.name,
                status: false,
                loadding: false,
                reports: [],
                startTime: new Date(this._startTime),
                endTime: new Date(),
                error: JSON.stringify(error.stack || error, null, 2)
            } as IEResultReport
        }
    }

    private setReports(reports: Array<IResultReport>): void {
        this._reports = reports
    }

    // 生成报表
    public getReports(): Array<IResultReport> | undefined {
        if (!this._loadding) { 
            // console.log('检查未完成。。。')
            return;
         }
        return this._reports
    }

    // 生成报告并写入文件
    public async getReportsForFile(filePath: string): Promise<void> {
        if (!this._loadding) { 
            // console.log('检查未完成。。。')
            return;
        }
        await Utils.writeFileSync(filePath, JSON.stringify(this._reports, null, 2), 'utf-8')
    }
}