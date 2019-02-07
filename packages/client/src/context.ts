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

  get status (): string {
    return this.message.status
  }

  handle (cb: (ctx: Context) => Promise<void>): void
  async handle (): Promise<void>
  async handle (cb?: (ctx: Context) => Promise<void>): Promise<void> {
    return this._thetaClient.handle(this.message.channel, cb as any)
  }

  async send (path: string, data: any): Promise<void> {
    return this._thetaClient.send(`${this.message.channel}@${path}`, data)
  }
}
