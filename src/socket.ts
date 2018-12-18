import uuid from 'uuid/v4'
import WebSocket from 'ws'
import { EventEmitter } from 'events'
import Theta from './theta'
import Server from './server'
import Message from './message'
import { Handler } from './router'
import SocketRouter from './socket-router'
import Context from './context'

declare interface Socket {
  on (event: 'error', handler: (err: any, context: Context) => void): this
  on (event: 'message', handler: (context: Context) => void): this
  on (event: 'close', handler: () => void): this
}

class Socket extends EventEmitter {
  theta: Theta
  uuid: string
  _router: SocketRouter
  _server: Server
  _rawSocket: WebSocket

  constructor (theta: Theta, server: Server, rawSocket: WebSocket) {
    super()

    Object.setPrototypeOf(this, theta.socket)

    this.theta = theta
    this.uuid = uuid()
    this._router = new SocketRouter(this.theta)
    this._server = server
    this._rawSocket = rawSocket

    this._rawSocket.on('message', d => this._handleRawMesssage(d))
  }

  handle (pattern: string, handlerFn: Handler) {
    this._router.handle(pattern, handlerFn)
  }

  async send (data: any) {
    if (!this.theta.encoder) { return }
    const encodedData = await this.theta.encoder(data)
    this._rawSocket.send(encodedData)
  }

  to (uuid: string) {
    return this._server.connectionManager.findByUuid(uuid)
  }

  clearRouterHandlers () {
    this._router.clearRouterHandlers()
  }

  async _handleRawMesssage (data: WebSocket.Data) {
    let message
    try {
      message = await Message.fromEncodedData(this.theta, data)
    } catch (err) {
      this.emit('error', err)
      return
    }

    const context = new Context(message, this)

    try {
      await this._router.route(context)
    } catch (err) {
      this.emit('error', err, message)
      return
    }
    this.emit('message', context)
  }
}

export default Socket
