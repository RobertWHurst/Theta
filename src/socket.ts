import uuid from 'uuid/v4'
import Theta from './theta'
import Server from './server'
import Message from './message'
import SocketRouter from './socket-router'
import { EventEmitter } from 'events'
import { HandlerFn } from './types';

export default class Socket extends EventEmitter {
  theta: Theta
  uuid: string
  _router: SocketRouter
  _server: Server
  _rawSocket: any

  constructor (theta: Theta, server: Server, rawSocket: any) {
    super()

    Object.setPrototypeOf(this, theta.socket)

    this.theta = theta
    this.uuid = uuid()
    this._router = new SocketRouter(this.theta)
    this._server = server
    this._rawSocket = rawSocket

    this._rawSocket.on('message', (d, f) => this._handleRawMesssage(d, f))
  }

  handle (pattern: string, handlerFn: HandlerFn) {
    this._router.handle(pattern, handlerFn)
  }

  async send (data: any) {
    if (!this.theta.encodeFn) { return }
    const encodedData = await this.theta.encodeFn(data)
    this._rawSocket.send(encodedData)
  }

  to (uuid: string) {
    return this._server.connectionManager.findByUuid(uuid)
  }

  clearRouterHandlers () {
    this._router.clearRouterHandlers()
  }

  async _handleRawMesssage (data: any, flags: object) {
    let message
    try {
      message = await Message.fromEncodedData(this.theta, this._server, data, flags)
    } catch (err) {
      return this.emit('error', err)
    }
    try {
      await this._router.route(message, this)
    } catch (err) {
      return this.emit('error', err, message)
    }
    this.emit('message', message)
  }
}
