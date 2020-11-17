import * as path from 'path'
import * as url from 'url'
import { IStrategy, IResultReport, ICResultReport, Utils } from '../index'

interface IPCResultReport extends ICResultReport {
    desc: string
}
interface IPResultReport extends IResultReport {
    env: 'test' | 'production' | 'development'
}
interface StrategyConfig {
    CHECK_API_SERVER?: string
    CHECK_API_LIST?: Array<string>
    CHECK_EXIST_TO_FILE_OR_FOLDERS?: Array<string>
}

export class Strategy implements IStrategy {
    public name: string = 'default'
    public runStatus: boolean = true
    private _report:IPResultReport = {
        env: 'development',
        name: this.name,
        loadding: true,
        status: false,
        startTime: new Date(),
        endTime:  undefined,
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
            console.error('检查未结束')
            return this._report;
        }
        return this._report
    }

    // 运行策略
    public async run () {
        if (!this.runStatus) {
            throw new Error('运行策略错误')
        }
        // todolist
        await Promise.all([
            // api 服务健康检查
            this.apiServerHealthyCheck(),

            // 内存可用情况检查
            this.memoryUsableCheck(),

            // 文件存在情况检查
            this.fileOrFolderExistCheck()
        ])

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
            console.log('未检测到可利用的 API SERVER 配置')
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
            name: 'api服务健康检查',
            status: true,
            desc: 'desc',
            data
        } as IPCResultReport)
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
    protected async memoryUsableCheck(): Promise<void> {
        this.setReport({ 
            name: '内存可用情况检查', 
            status: true,
            data: {
                systemType: Utils.getSystemType(),
                systemName: Utils.getSystemName(),
                hostname: Utils.getSystemHostName(),
                freeMem: `${Utils.getFreeMemory()} bytes`,
                totalMem: `${Utils.getTotalMemory()} bytes`
                // networkInterfaces: Utils.getNetworkInteraces()
            }
        })
    }
    protected async fileOrFolderExistCheck(): Promise<void> {
        const config = Object.assign({
            CHECK_EXIST_TO_FILE_OR_FOLDERS: [
                './package.json', 
                './packages/'
            ]
        }, this._config)
        this.setReport({ 
            name: '文件存在情况检查', 
            status: true,
            data: {
                root: this._root,
                searchFileOrFolders: config?.CHECK_EXIST_TO_FILE_OR_FOLDERS?.map(searchPath => ({
                    searchFilePath: searchPath,
                    absolutePath: path.resolve(this._root, searchPath),
                    exist: Utils.checkFileExist(path.resolve(this._root, searchPath))        
                }))
            }
        })
    }
}