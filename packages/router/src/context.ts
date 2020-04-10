import { Message } from './message'
import { Pattern, Params, createChannelId } from '@thetaapp/pattern'
import { Config } from './config'
import { Socket } from './socket'

export class Context {
  public next?: (err: Error) => Promise<void>
  public $$path?: string
  public $$status?: string
  public $$error?: Error
  public $$handled?: boolean
  public $$timeout?: number
  public $$resetTimeout?: () => void

  public socket: Socket
  public message: Message | null

  private readonly _config: Config

  constructor (config: Config, message: Message | null, socket: Socket) {
    this.message = message
    this.socket = socket
    this._config = config
  }

  public get rawPath (): string {
    return this.message ? this.message.rawPath : ''
  }

  public get channel (): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.message ? this.message.channel! : createChannelId()
  }

  public get path (): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.message ? this.message.path! : ''
  }

  public get params (): Params {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.message ? this.message.params! : {}
  }

  public get data (): any {
    return this.message ? this.message.data : null
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
      this.socket.$$subHandle(this.rawPath, resolve, this._config.timeout)
      this.send(this.rawPath, data).catch(reject)
    })
  }

  public async reply (data?: any): Promise<void> {
    await this.send(this.rawPath, data)
    this.end()
  }

  public end (): void {
    this.$$handled = true
  }

  public timeout (ms?: number): this {
    if (typeof ms === 'number') {
      this.$$timeout = ms
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.$$resetTimeout!()
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
