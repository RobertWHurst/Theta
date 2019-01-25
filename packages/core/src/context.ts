import Message from './message'
import Socket from './socket'
import Theta, { Handler } from './theta'
import Pattern, { Params } from './pattern'

type NextHandler = () => Promise<void>

export default class Context {
  message: Message
  socket: Socket
  theta?: Theta
  error?: Error
  $$handled?: Boolean
  $$timeout?: number
  $$nextHandler?: NextHandler

  constructor (message: Message, socket: Socket) {
    Object.setPrototypeOf(this, socket.theta.context)
    this.message = message
    this.socket = socket
  }

  get uuid (): string { return this.socket.uuid }
  get path (): string { return this.message.path }
  get params (): Params { return this.message.params }
  get data (): any { return this.message.data }

  status (status: string): this {
    this.socket.status(status)
    return this
  }

  async sendStatus (status: string): Promise<void> {
    this._setChannel()
    return this.socket.sendStatus(status)
  }

  async send (data?: any): Promise<void> {
    this._setChannel()
    await this.socket.send(data)
  }

  handle (pattern: string, handler: Handler): void
  handle (handler: Handler): void
  async handle (pattern: string): Promise<Context>
  handle (pattern?: string | Handler, handler?: Handler): Promise<Context> | void {
    this._setChannel()
    return this.socket.handle(pattern as any, handler as any)
  }

  async next () {
    if (!this.$$nextHandler) { return }
    await this.$$nextHandler()
  }

  timeout (timeout: number) {
    this.$$timeout = timeout
    return this
  }

  $$tryToApplyPattern (pattern: Pattern): boolean {
    if (!this.message.$$tryToApplyPattern(pattern)) { return false }
    this.$$handled = true
    return true
  }

  _setChannel () {
    this.socket.$$router.channel = this.message.channel
  }
}
