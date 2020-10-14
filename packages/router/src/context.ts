import { Message } from './message'
import { Pattern, Params, createChannelId } from '@thetaapp/pattern'
import { Config } from './config'
import { Socket } from './socket'

export class Context {
  public next?: (err?: Error) => Promise<void>
  public $$path?: string
  public $$status?: string
  public $$error?: Error
  public $$timeout?: number
  public $$resetTimeout?: (ms?: number) => void

  public socket: Socket
  public message: Message | null

  constructor (_config: Config, message: Message | null, socket: Socket) {
    this.message = message
    this.socket = socket
  }

  public get rawPath (): string {
    return this.message?.rawPath ?? ''
  }

  public get channel (): string {
    return this.message?.channel ?? createChannelId()
  }

  public get path (): string {
    return this.message?.path ?? ''
  }

  public get params (): Params {
    return this.message?.params ?? {}
  }

  public get data (): any {
    return this.message?.data
  }

  public get currentStatus (): string {
    return this.$$status ?? 'ok'
  }

  public get error (): Error | void {
    return this.$$error
  }

  public status (status: string): this {
    this.$$status = status
    return this
  }

  public async send (path: string, data?: any): Promise<void> {
    await this.socket.$$send(this.currentStatus, path, data)
  }

  public async request (data?: any): Promise<Context> {
    return await new Promise((resolve, reject) => {
      this.socket.$$subHandle(this.rawPath, resolve)
      this.send(this.rawPath, data).catch(reject)
    })
  }

  public async reply (data?: any): Promise<void> {
    await this.send(this.rawPath, data)
  }

  public timeout (ms?: number): this {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.$$resetTimeout!(ms)
    return this
  }

  public clearError (): this {
    delete this.$$error
    return this
  }

  public $$tryToApplyPattern (pattern: Pattern): boolean {
    return this.message ? this.message.$$tryToApplyPattern(pattern) : false
  }
}
