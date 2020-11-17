import { IStrategy, IResultReport, ICResultReport } from '../InspectToolPlatform'
import { Utils } from '../utils'

export class MemoryUsableStrategy implements IStrategy {
    public name: string = '内存可用情况检查'
    private _report:IResultReport = {
        name: this.name,
        loadding: true,
        status: false,
        startTime: new Date(),
        endTime: undefined,
        reports: [],
    }
    protected setReport(report: ICResultReport): void {
        this._report?.reports?.push(report)
    }

    public getReport(): IResultReport {
        if (this._report.loadding) {
            // console.error('检查未结束')
            return this._report;
        }
        return this._report
    }

    // 运行策略
    public async run () {
        
        // 内存可用情况检查
        await this.memoryUsableCheck(),

        this.setReportStatus()
        this.setLoading(false)
        this._report.endTime = new Date()
    }
    private setReportStatus():void {
        this._report.status = !this._report.reports.find(r => r.status === false)
    }
    private setLoading(loading: boolean):void {
        this._report.loadding = !!loading
    }

    protected async memoryUsableCheck(): Promise<void> {
        this.setReport({ 
            name: '内存可用情况检查', 
            status: true,
            data: {
                systemType: Utils.getSystemType(),
                systemName: Utils.getSystemName(),
                hostname: Utils.getSystemHostName(),
                freeMem: `${Utils.getFreeMemory()} bytes`,
                totalMem: `${Utils.getTotalMemory()} bytes`,
                networkInterfaces: Utils.getNetworkInteraces()
            }
        })
    }
}