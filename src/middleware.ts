import { InspectToolPlatform, IStrategy } from './InspectToolPlatform'
import { render } from '@mcfed/cra-render'

// 检查工具 KOA2 中间件
export function inspectTools(...strategies:Array<IStrategy>):any {
    return async (ctx:any, next:any):Promise<void> => {
        if (ctx && ctx.url === (process.env.INSPECT_TOOL_URL || '/healthyCheck')) {
            const inspectToolPlatform = new InspectToolPlatform()
            for(const strategyItem of strategies){
                inspectToolPlatform.addStrategy(strategyItem)
            }
            await inspectToolPlatform.run()
            const reports = inspectToolPlatform.getReports()
            ctx.body = render(getContentTemplate(), { reports })
            return;
        }
        await next()
    }
  }

  function getContentTemplate() {
      return `
      <!DOCTYPE html>
        <head>
            <style>
                body {
                    text-align: center;
                    color:#eee;
                    background-color: #ccc;
                }
            </style>
        </head>
        <body>
            <h1>检查报告</h1>
        <ul> 
                {@#reports@}
                    <li>
                       <div>
                            <p>{@name@}</p>
                            <p>{@status@}</p>
                       </div>
                    </li>
                {@/reports@}
        </ul> 
        </body>
        </html>
      `
  }