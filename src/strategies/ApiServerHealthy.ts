import * as path from 'path'
import * as url from 'url'
import { IStrategy, IResultReport, ICResultReport } from '../InspectToolPlatform'
import { Utils } from '../utils'

interface StrategyConfig {
    CHECK_API_SERVER?: string
    CHECK_API_LIST?: Array<string>
}

export class ApiServerHealthyStrategy implements IStrategy {
    public name: string = 'API服务健康检查'
    private _report:IResultReport = {
        name: this.name,
        loadding: true,
        status: false,
        startTime: new Date(),
        endTime: undefined,
        reports: [],
    }
    private _root:string = process.cwd()
    private _config?: StrategyConfig
    constructor() {
        this.setConfig()
    }
    protected setConfig() {
        let config = Utils.getJsonData(path.resolve(this._root, 'strategy.config.json'));
        if (!config) {
            config = Utils.getJsonData(path.resolve(this._root, 'strategy.config.js'));
        }
        if (!config) {
            config = Utils.getJsonData(path.resolve(this._root, './package.json'))?.strategyConfig
        }
        if (config) {
            this._config = config
        }
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
        
        await this.apiServerHealthyCheck()

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

    protected async apiServerHealthyCheck(): Promise<void> {
        if (!this._config?.CHECK_API_LIST 
            || !Array.isArray(this._config?.CHECK_API_LIST)
            || !this._config?.CHECK_API_LIST.length
        ) {
            // console.log('未检测到可利用的 API SERVER 配置')
            return;
        }
        const apiList = this._config?.CHECK_API_LIST
            .map(api => url.resolve(this._config?.CHECK_API_SERVER || '', api))
        
        let data: any = {}
        try {
            data = await Promise.all(apiList.map(this.fetchApi))
        } catch (error) {
            data.error = error
        }

        this.setReport({
            name: 'API服务健康检查',
            status: true,
            data
        })
    }
    private async fetchApi(api: string): Promise<{ api: string, response?: Object, error?: Error }> {
        try {
            const res = await Utils.fetchGet(api)
            return { 
                api, 
                response: {
                    headers: Utils.formatReponseHeadersToObject(res.headers),
                    status: res.status,
                    statusText: res.statusText,
                    ok: res.ok,
                    url: res.url,
                    bodyUsed: res.bodyUsed,
                    redirected: res.redirected,
                    type: res.type,
                    body: await res.json()
                }
            } 
        } catch (error) {
            return { api, error }
        }
    }
}