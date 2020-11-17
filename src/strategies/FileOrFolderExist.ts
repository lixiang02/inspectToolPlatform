import * as path from 'path'
import { IStrategy, IResultReport, ICResultReport } from '../InspectToolPlatform'
import { Utils } from '../utils'

interface StrategyConfig {
    CHECK_EXIST_TO_FILE_OR_FOLDERS?: Array<string>
}

export class FileOrFolderExistStrategy implements IStrategy {
    public name: string = '文件存在情况检查'
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
        
        // 文件存在情况检查
        await this.fileOrFolderExistCheck()

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