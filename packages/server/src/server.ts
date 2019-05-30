import { Router } from '@thetaapp/router'
import { Config } from './config'
import { Encoder } from './encoder'
import { Socket } from './socket'
import { Context } from './context'
import { Transport } from './transport'
import { TransportConnection } from './transport-connection'
import { SocketManager } from './socket-manager'

export class Server {
  private _config: Config
  private _transports: Transport[]
  private _router: Router<Context>
  private _socketManager: SocketManager
  private _encoder: Encoder

  constructor (encoder: Encoder) {
    this._config = {}
    this._transports = []
    this._router = new Router(this._config)
    this._socketManager = new SocketManager()
    this._encoder = encoder
  }

  public transport (...transports: Transport[]) {
    for (const transport of transports) {
      transport.handleConnection = c => this._handleConnection(c)
      this._transports.push(transport)
    }
  }

  public async listen (): Promise<void> {
    await Promise.all(this._transports.map(t => t.listen()))
  }

  public async close (): Promise<void> {
    await Promise.all(this._transports.map(t => t.close()))
  }

  private _handleConnection (connection: TransportConnection) {
    const socket = new Socket(connection, this._encoder)
    this._socketManager.addSocket(socket)
    socket.handleMessage = (c: Context) => this._handleMessage(c)
  }

  private async _handleMessage (ctx: Context): Promise<void> {
    await this._router.route(ctx)
  }
}
