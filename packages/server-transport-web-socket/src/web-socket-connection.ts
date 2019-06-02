import WebSocket from 'ws'
import { TransportConnection } from '@thetaapp/server-transport'

export class WebSocketConnection implements TransportConnection {
  public handleMessage?: (encodedData: any) => void
  private _socket: WebSocket

  constructor (socket: WebSocket) {
    this._socket = socket
    this._socket.on('message', (encodedData) => { this.handleMessage!(encodedData) })
  }

  public async send (encodedData: any) {
    await new Promise((resolve, reject) => {
      this._socket.send(encodedData, (err) => { err ? reject(err) : resolve() })
    })
  }

  public async close () {
    this._socket.close()
  }
}
