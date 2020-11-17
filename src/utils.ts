import fetch from 'cross-fetch'
import * as fs from 'fs'
import * as os from 'os'

export class Utils {

    // 检查文件是否存在
    public static checkFileExist(path: string): boolean {
        return fs.existsSync(path)
    }

    // 写入文件
    public static writeFileSync(...options: any[]): void {
        return fs.writeFileSync.apply(this, options as any)
    }

    // 移除文件
    public static removeFileSync(path: string): void {
        return fs.unlinkSync(path)
    }

    // 获取操作系统类别
    public static getSystemType(): string {
        return os.type()
    }

    // 编译时的操作系统名称
    public static getSystemName(): NodeJS.Platform {
        return os.platform()
    }

    // 编译时的操作系统主机名
    public static getSystemHostName(): string {
        return os.hostname()
    }

    // 获取操作系统的空闲内存，单位字节
    public static getFreeMemory():number {
        return os.freemem()
    }

    // 获取操作系统的内存总量，单位字节
    public static getTotalMemory():number {
        return os.totalmem()
    }

    // 获取网络接口列表
    public static getNetworkInteraces(): NodeJS.Dict<os.NetworkInterfaceInfo[]>{
        return os.networkInterfaces()
    }

    // 获取JSON文件数据
    public static getJsonData(path: string) {
        if (!this.checkFileExist(path)) { return {} }
        try {
            return require(path)
        } catch (error) {
            console.error(`获取文件 ${path} 数据失败`)
            return {}
        } 
    }

    public static async fetchGet(url: string, options?: RequestInit | undefined): Promise<Response> {
        return await fetch(url, options)
    }

    public static formatReponseHeadersToObject(headers: Headers) {
       return Array.from(headers as any)
            .map((h:any) => ({ [h[0]]: h[1] }))
            .reduce((o, h) => Object.assign({}, o, h))
    }
}