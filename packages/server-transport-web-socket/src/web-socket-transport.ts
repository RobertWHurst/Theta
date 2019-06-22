import WebSocket from 'ws'
import { Transport, TransportConnection } from '@thetaapp/server-transport'
import { WebSocketConnection } from './web-socket-connection'

export class WebSocketTransport implements Transport {
  private _opts: WebSocket.ServerOptions
  private _server?: WebSocket.Server
  public handleConnection?: (connection: TransportConnection) => void

  constructor(opts: WebSocket.ServerOptions) {
    this._opts = opts
  }

  public async listen() {
    this._server = new WebSocket.Server(this._opts)
    this._server.on('connection', s => {
      this._handleConnection(s)
    })
  }

  public async close() {
    if (!this._server) {
      return
    }
    await new Promise((resolve, reject) => {
      this._server!.close(err => (err ? reject(err) : resolve()))
    })
  }

  private _handleConnection(socket: WebSocket) {
    this.handleConnection!(new WebSocketConnection(socket))
  }
}
