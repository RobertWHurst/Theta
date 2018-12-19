import Message from './message'
import Socket from './socket'
import Theta, { Handler } from './theta'

type NextHandler = () => Promise<void>

export default class Context {
  message: Message
  socket: Socket
  theta?: Theta
  error?: Error
  _handled?: Boolean
  _timeout?: number
  _nextHandler?: NextHandler

  constructor (message: Message, socket: Socket) {
    this.message = message
    this.socket = socket
  }

  status (status: string): this {
    this.socket.status(status)
    return this
  }

  async sendStatus (status: string): Promise<void> {
    return this.socket.sendStatus(status)
  }

  async send (data?: any): Promise<void> {
    await this.socket.send(data)
  }

  async handle (pattern: string, handler?: Handler): Promise<Context>
  async handle (handler: Handler): Promise<Context>
  async handle (pattern?: string | Handler, handler?: Handler): Promise<Context> {
    return this.socket.handle(pattern as any, handler as any)
  }

  async next () {
    if (!this._nextHandler) { return }
    await this._nextHandler()
  }

  setTimeout (timeout: number) {
    this._timeout = timeout
  }
}
