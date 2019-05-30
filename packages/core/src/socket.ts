import uuid from 'uuid/v4'
import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { Theta, Handler } from './theta'
import { Server } from './server'
import { Message } from './message'
import { SocketRouter } from './socket-router'
import { Context } from './context'

declare interface Socket {
  on (event: 'error', handler: (err: Error) => void): this
  on (event: 'message', handler: (context: Context) => void): this
  on (event: 'close', handler: () => void): this

  emit (event: 'error', err: Error): boolean
  emit (event: 'message', context: Context): boolean
  emit (event: 'close'): boolean
}

class Socket extends EventEmitter {
  public theta: Theta
  public uuid: string
  public $$router: SocketRouter
  public $$currentStatus: string
  private _server: Server
  private _rawSocket: WebSocket

  constructor (theta: Theta, server: Server, rawSocket: WebSocket) {
    super()

    Object.setPrototypeOf(this, theta.socket)

    this.theta = theta
    this.uuid = uuid()
    this.$$router = new SocketRouter(this.theta)
    this._server = server
    this._rawSocket = rawSocket
    this.$$currentStatus = 'ok'

    this._rawSocket.on('message', d => this._handleRawMessage(d))
  }

  status (status: string): this {
    this.$$currentStatus = status
    return this
  }

  async sendStatus (status: string): Promise<void> {
    return this.status(status).send()
  }

  async send (data?: any): Promise<void> {
    const status = this.$$currentStatus
    this.$$currentStatus = 'ok'
    const channel = this.$$router.channel || ''
    this.$$router.channel = ''
    data && typeof data.toJSON === 'function' && (data = data.toJSON())
    data = await this.theta.formatter(status, channel, data)
    const encodedData = await this.theta.encoder(data)

    // NOTE: We wait a tick so that the handler has time to register additional
    // in-route handlers with the socket router before the client responds.
    process.nextTick(() => { this._rawSocket.send(encodedData) })
  }

  handle (pattern: string, handler: Handler): void
  handle (handler: Handler): void
  async handle (pattern: string): Promise<Context>
  handle (pattern?: string | Handler, handler?: Handler): Promise<Context> | void {
    return this.$$router.handle(pattern as any, handler as any)
  }

  async _handleRawMessage (data: WebSocket.Data) {
    let message
    try {
      message = await Message.fromEncodedData(this.theta, data)
    } catch (err) {
      this.emit('error', err)
      return
    }

    const context = new Context(this._server, message, this)
    await this.$$router.route(context)
    if (context.$$handled) { return }
    this.emit('message', context)
  }

  _generateChannel (): string {
    return ''
  }
}

export { Socket }
