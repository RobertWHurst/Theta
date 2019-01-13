import uuid from 'uuid/v4'
import WebSocket from 'ws'
import { EventEmitter } from 'events'
import Theta, { Handler } from './theta'
import Server from './server'
import Message from './message'
import SocketRouter from './socket-router'
import Context from './context'

declare interface Socket {
  on (event: 'error', handler: (err: Error) => void): this
  on (event: 'message', handler: (context: Context) => void): this
  on (event: 'close', handler: () => void): this

  emit (event: 'error', err: Error): boolean
  emit (event: 'message', context: Context): boolean
  emit (event: 'close'): boolean
}

class Socket extends EventEmitter {
  theta: Theta
  uuid: string
  _router: SocketRouter
  _server: Server
  _rawSocket: WebSocket
  _currentStatus: string
  _currentNamespace: string

  constructor (theta: Theta, server: Server, rawSocket: WebSocket) {
    super()

    Object.setPrototypeOf(this, theta.socket)

    this.theta = theta
    this.uuid = uuid()
    this._router = new SocketRouter(this.theta)
    this._server = server
    this._rawSocket = rawSocket
    this._currentStatus = 'ok'
    this._currentNamespace = ''

    this._rawSocket.on('message', d => this._handleRawMessage(d))
  }

  handle (pattern: string, handler: Handler): void
  handle (handler: Handler): void
  async handle (pattern: string): Promise<Context>
  handle (pattern?: string | Handler, handler?: Handler): Promise<Context> | void {
    return this._router.handle(pattern as any, handler as any)
  }

  status (status: string): this {
    this._currentStatus = status
    return this
  }

  sendStatus (status: string): Promise<void> {
    return this.status(status).send()
  }

  async send (data?: any): Promise<void> {
    const status = this._currentStatus
    this._currentStatus = 'ok'
    const path = this._currentNamespace
    this._currentNamespace = ''
    data = await this.theta.formatter(status, path, data)
    const encodedData = await this.theta.encoder(data)

    // NOTE: We wait a tick so that the handler has time to register additional
    // in-route handlers with the socket router before the client responds.
    process.nextTick(() => { this._rawSocket.send(encodedData) })
  }

  to (uuid: string) {
    return this._server.connectionManager.findByUuid(uuid)
  }

  clearRouterHandlers () {
    this._router.clearRouterHandlers()
  }

  async _handleRawMessage (data: WebSocket.Data) {
    let message
    try {
      message = await Message.fromEncodedData(this.theta, data)
    } catch (err) {
      this.emit('error', err)
      return
    }

    const context = new Context(message, this)
    await this._router.route(context)
    if (context._handled) { return }
    this.emit('message', context)
  }
}

export default Socket
