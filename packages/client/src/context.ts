import { Message } from './message'
import { ThetaClient } from './theta-client'

export class Context {
  public message: Message
  private _thetaClient: ThetaClient

  constructor (thetaClient: ThetaClient, message: Message) {
    Object.setPrototypeOf(this, thetaClient.context)
    this.message = message
    this._thetaClient = thetaClient
  }

  get status (): string { return this.message.status }
  get data (): any { return this.message.data }

  public handle (cb: (ctx: Context) => Promise<void>): void
  public async handle (): Promise<Context>
  public handle (cb?: (ctx: Context) => Promise<void>): Promise<Context> | void {
    return this._thetaClient.handle(this.message.channel, cb as any)
  }

  public async send (path: string, data?: any): Promise<void> {
    return this._thetaClient.send(`${this.message.channel}@${path}`, data)
  }

  public async request (path: string, data?: any): Promise<Context> {
    await this.send(path, data)
    return this.handle()
  }
}
