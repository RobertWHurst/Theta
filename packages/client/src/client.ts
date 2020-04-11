import { Transport } from '@thetaapp/client-transport'
import { Router, Socket, Context, Handler, Message } from '@thetaapp/router'
import { Encoder, Expanded, defaultEncoder } from '@thetaapp/encoder'
import { Config } from './config'

export { Transport, Router, Socket, Context, Handler, Encoder, Expanded }

export class Client implements Socket {
  private readonly _config: Config
  private readonly _router: Router
  private readonly _pending: Array<[string, string, any?]>
  private _encoder: Encoder
  private _transport?: Transport
  private _isConnected: boolean

  constructor (config?: Config) {
    this._config = config ?? {}
    this._router = new Router(this._config)
    this._pending = []
    this._encoder = this._config.encoder ?? defaultEncoder
    this._transport = this._config.transport
    this._isConnected = false
  }

  public encoder (encoder: Encoder): void {
    this._encoder = encoder
  }

  public transport (transport: Transport): void {
    transport.handleMessage = async d => await this._handleMessage(d)
    transport.handleClose = async () => await this._handleClose()
    transport.handleError = async e => await this._handleError(e)
    this._transport = transport
  }

  public async connect (): Promise<void> {
    if (!this._transport) {
      throw new Error('Cannot connect. No transport set')
    }
    await this._transport.connect()
    this._isConnected = true
    await Promise.all(
      this._pending.map(async ([status, path, data]) => {
        await this.$$send(status, path, data)
      })
    )
  }

  public async disconnect (): Promise<void> {
    if (!this._transport) {
      throw new Error('Cannot disconnect. No transport set')
    }
    if (!this._isConnected) {
      throw new Error('Cannot disconnect. Transport not connected')
    }
    await this._transport.disconnect()
    this._isConnected = true
  }

  public async send (path: string, data: any): Promise<void> {
    await this.$$send('', path, data)
  }

  public async request(path: string, handler: Handler): Promise<void>
  public async request(path: string, data: any, handler: Handler): Promise<void>
  public async request (
    path: string,
    data: any | Handler,
    handler?: Handler
  ): Promise<void> {
    if (!handler) {
      handler = data as Handler
      data = undefined
    }
    const context = new Context(this._config, null, this)
    const channelAndPath = `${context.channel}@${path}`
    this.$$subHandle(channelAndPath, handler)
    // TODO: handle timeout by generating a timed out context and routing it to
    //       the channelAndPath
    await this.$$send('', channelAndPath, data)
  }

  public handle(handler: Handler): void
  public handle(router: Router): void
  public handle(patternStr: string, handler: Handler): void
  public handle(patternStr: string, router: Router): void
  public handle (
    patternStr: string | Handler | Router,
    handler?: Handler | Router
  ): void {
    return this._router.handle(patternStr as any, handler as any)
  }

  public handleError(handler: Handler): void
  public handleError(patternStr: string, handler: Handler): void
  public handleError (patternStr: string | Handler, handler?: Handler): void {
    return this._router.handleError(patternStr as any, handler as any)
  }

  public async $$send (status: string, path: string, data?: any): Promise<void> {
    if (!this._isConnected || !this._transport) {
      this._pending.push([status, path, data])
      return
    }

    let bundledData
    try {
      bundledData = await this._encoder.bundle(status, path, data)
    } catch (err) {
      throw new Error(`Error during message bundling: ${err.message as string}`)
    }

    let encodedData
    try {
      encodedData = await this._encoder.encode(bundledData)
    } catch (err) {
      throw new Error(`Error during message encoding: ${err.message as string}`)
    }
    void this._transport.send(encodedData)
  }

  public $$subHandle (
    patternStr: string,
    handler: Handler
  ): void {
    return this._router.$$subHandle(patternStr, handler)
  }

  private async _handleMessage (encodedData: any): Promise<void> {
    let decodedData
    try {
      decodedData = await this._encoder.decode(encodedData)
    } catch (err) {
      void this._handleMessageError('decoding', err)
      return
    }

    let expandedData
    try {
      expandedData = await this._encoder.expand(decodedData)
    } catch (err) {
      void this._handleMessageError('expanding', err)
      return
    }

    const message = new Message(
      expandedData.path,
      expandedData.status,
      expandedData.data
    )
    const ctx = new Context(this._config, message, this)
    await this._router.route(ctx)
  }

  private async _handleMessageError (stageName: string, err: Error): Promise<void> {
    const ctx = new Context(this._config, new Message('', '', null), this)
    ctx.$$error = new Error(`Error during message ${stageName}: ${err.message}`)
    await this._router.route(ctx)
  }

  private async _handleClose (): Promise<void> {
    this._isConnected = false
  }

  private async _handleError (err: Error): Promise<void> {
    console.error(err)
  }
}
