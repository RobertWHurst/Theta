import { Router, Handler, Context } from "@thetaapp/router"
import { Transport, TransportConnection } from "@thetaapp/server-transport"
import { Encoder, defaultEncoder } from "@thetaapp/encoder"
import { Config } from "./config"
import { Socket } from "./socket"
import { SocketManager } from "./socket-manager"

export { Router, Handler, Context, Transport, TransportConnection, Encoder }

export class Server {
  private readonly _config: Config
  private _encoder: Encoder
  private _transports: Transport[]
  private readonly _router: Router
  private readonly _socketManager: SocketManager

  constructor(config?: Config) {
    this._config = config ?? {}
    this._encoder = this._config.encoder ?? defaultEncoder
    this._transports = []
    this._router = new Router(this._config)
    this._socketManager = new SocketManager()
  }

  public encoder(encoder: Encoder): void {
    this._encoder = encoder
  }

  public transport(...transports: Transport[]): void {
    for (const transport of transports) {
      transport.handleConnection = c => this._handleConnection(c)
      this._transports.push(transport)
    }
  }

  public async removeTransport(transport?: Transport): Promise<void> {
    if (!transport) {
      const p = this.close()
      this._transports.length = 0
      await p
      return
    }

    const index = this._transports.indexOf(transport)
    if (index === -1) {
      return
    }
    this._transports.splice(index, 1)
    await transport.close()
  }

  public async listen(): Promise<void> {
    await Promise.all(this._transports.map(async t => await t.listen()))
  }

  public async close(): Promise<void> {
    await Promise.all(this._transports.map(async t => await t.close()))
  }

  public handle(handler: Handler): void
  public handle(router: Router): void
  public handle(patternStr: string, handler: Handler): void
  public handle(patternStr: string, router: Router): void
  public handle(patternStr: string | Handler | Router, handler?: Handler | Router): void {
    return this._router.handle(patternStr as any, handler as any)
  }

  public handleError(handler: Handler): void
  public handleError(patternStr: string, handler: Handler): void
  public handleError(patternStr: string | Handler, handler?: Handler): void {
    return this._router.handleError(patternStr as any, handler as any)
  }

  private _handleConnection(connection: TransportConnection): void {
    const socket = new Socket(this._config, this._router, connection, this._encoder)
    socket.handleMessage = async (c: Context) => await this._handleMessage(c)
    socket.handleError = async (c: Context) => await this._handleMessage(c)
    this._socketManager.addSocket(socket)
  }

  private async _handleMessage(ctx: Context): Promise<void> {
    await this._router.route(ctx)
  }
}
