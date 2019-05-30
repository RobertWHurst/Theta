import { Message } from './message'
import { Socket } from './socket'
import { Theta, Handler } from './theta'
import { Pattern, Params } from './pattern'
import { Server } from './server'
import { ServerError } from './server-error'

type NextHandler = () => Promise<void>

export class Context {
  public message: Message
  public socket: Socket
  public theta?: Theta
  public $$error?: Error
  public $$handled?: Boolean
  public $$timeout?: number
  public $$nextHandler?: NextHandler
  private _server: Server

  constructor (server: Server, message: Message, socket: Socket) {
    Object.setPrototypeOf(this, socket.theta.context)
    this.message = message
    this.socket = socket
    this._server = server
  }

  get uuid (): string { return this.socket.uuid }
  get path (): string { return this.message.path }
  get params (): Params { return this.message.params }
  get data (): any { return this.message.data }
  get requestId (): string { return this.message.requestId }
  get isHandled (): boolean { return !!this.$$handled }

  status (status: string): this {
    this.socket.status(status)
    return this
  }

  async sendError (message: string): Promise<void> {
    this._setChannel()
    this.$$error = new ServerError(this, message)
    await this.socket.send(this.$$error)
  }

  async sendStatus (status: string): Promise<void> {
    this._setChannel()
    return this.socket.sendStatus(status)
  }

  async send (data?: any): Promise<void> {
    this._setChannel()
    await this.socket.send(data)
  }

  to (uuid: string) {
    return this._server.connectionManager.findByUuid(uuid)
  }

  handle (pattern: string, handler: Handler): void
  handle (handler: Handler): void
  async handle (pattern: string): Promise<Context>
  handle (pattern?: string | Handler, handler?: Handler): Promise<Context> | void {
    this._setChannel()
    return this.socket.handle(pattern as any, handler as any)
  }

  async request (data: any, pattern: string): Promise<Context>
  async request (pattern: string): Promise<Context>
  async request (data: any | string, pattern?: string): Promise<Context> {
    if (typeof pattern !== 'string') {
      pattern = data as string
      data = undefined
    }
    await this.send(data)
    return this.handle(pattern)
  }

  async next () {
    this.$$handled = false
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
