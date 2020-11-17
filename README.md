## 检查服务工具

- 这是一个用于检查服务健康状态的工具平台

### 使用 cli

* 安装依赖 `npm install inspecttools --save-dev` or `yarn add inspecttools --dev`
* 在当前项目下运行 `npx itp -d` 命令，执行默认检查
* 在当前项目下运行 `npx itp -s <strategyPath>` 命令，增加自定义策略
* 在当前项目下运行 `npx itp -o <outfilePath>` 命令，指定输出运行检查结果报告文件地址

### 提供了默认的策略

1. API服务健康检查，接口检查，仅支持<GET>请求
2. 文件或者文件夹存在检查
3. 内存使用情况、系统配置情况、网络配置情况检查

### 默认策略配置文件

1. `package.json` 的属性 `strategyConfig` 中配置相关属性
2. 在项目根目录下添加配置文件`strategy.config.js` 或者 `strategy.config.json`文件

### API服务健康检查 需要的配置
```json
    // API服务器地址, 例如：https://www.baidu.com:3000/ditu
    CHECK_API_SERVER?: string 
    // API接口列表，例如["/list", "https://www.baidu.com:3000/ditu/users/list"]
    CHECK_API_LIST?: Array<string>
```

### 文件或者文件夹存在检查
```json
    // 文件或文件夹的路径地址
    CHECK_EXIST_TO_FILE_OR_FOLDERS?: Array<string>
```

#### 自定义策略 javascript

```javascript 
    import { InspectToolPlatform } from 'inspecttools'
    import { MyStrategy } from './mystrategy'

    // 实例化工具类
    const inspectToolPlatform = new InspectToolPlatform()

    // 增加自己的检查项目的实例
    await inspectToolPlatform.addStrategy(new MyStrategy())

    //运行检查程序
    await inspectToolPlatform.run()

    // 输出检查报告到指定的文件中
    await inspectToolPlatform.getReportsForFile('./myreport.json')

```

`mystrategy.ts 文件`
```javascript
import { IStrategy, IResultReport, ICResultReport, Utils } from 'inspecttools'

interface IPCResultReport extends ICResultReport {
    desc: string
}
interface IPResultReport extends IResultReport {
    env: 'test' | 'production' | 'development'
}
export class Strategy implements IStrategy {
    public name: string = 'mystrategy'
    private _report:IPResultReport = {
        env: 'development',
        name: this.name,
        startTime: new Date(),
        endTime: undefined,
        loadding: true,
        status: false,
        reports: [],
    }
    private _root:string = process.cwd()
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
        
        // todolist
        await Promise.all([
            this.run1(),
            this.run2(),
            this.run3(),
            ...
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

    protected async run1(): Promise<void> {
        ...
        ...

        this.setReport({
            name: 'check project 1',
            status: true,
            desc: 'desc',
            data: {}
        } as IPCResultReport)
    }
    protected async run2(): Promise<void> {
        ... 
        ... 

        this.setReport({ 
            name: 'check project 2', 
            status: true,
            data: {}
        })
    }
    protected async run3(): Promise<void> {
        ...
        ...

        this.setReport({ 
            name: 'check project 3', 
            status: true,
            data: {}
        })
    }
}
```