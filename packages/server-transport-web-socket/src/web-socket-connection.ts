import WebSocket from 'ws'
import { TransportConnection } from '@thetaapp/server-transport'

export class WebSocketConnection implements TransportConnection {
  public handleMessage?: (encodedData: any) => Promise<void>
  private readonly _socket: WebSocket

  constructor (socket: WebSocket) {
    this._socket = socket
    this._socket.on('message', encodedData => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      void this.handleMessage!(encodedData)
    })
  }

  public async send (encodedData: any): Promise<void> {
    await new Promise((resolve, reject) => {
      this._socket.send(encodedData, err => {
        err ? reject(err) : resolve()
      })
    })
  }

  public async close (): Promise<void> {
    this._socket.close()
  }
}
