import { Transport } from '@thetaapp/client-transport'
import { Router, Socket, Context, Handler } from '@thetaapp/router'
import { Encoder, defaultEncoder } from '@thetaapp/encoder'
import { Config } from './config'
import { Message } from './message'

export class Client implements Socket {
  private _config: Config
  private _encoder: Encoder
  private _transport?: Transport
  private _router: Router

  constructor (config?: Config) {
    this._config = config || {}
    this._encoder = this._config.encoder || defaultEncoder
    this._transport = this._config.transport
    this._router = new Router(this._config)
  }

  public encoder (encoder: Encoder) {
    this._encoder = encoder
  }

  public transport (transport: Transport) {
    transport.handleMessage = d => this._handleMessage(d)
    this._transport = transport
  }

  public async connect (): Promise<Context> {
    await this._transport!.connect()
    return new Context(this._config, new Message('', '', undefined), this)
  }

  public async request (path: string, handler: Handler): Promise<void>
  public async request (path: string, data: any, handler: Handler): Promise<void>
  public async request (path: string, data: any | Handler, handler?: Handler): Promise<void> {
    if (!handler) {
      handler = data as Handler
      data = undefined
    }
    const context = new Context(this._config, null, this)
    const rawPath = `${context.channel}@${path}`
    this.$$subHandle(rawPath, handler, this._config.timeout)
    await this.$$send('', rawPath, data)
  }

  public async $$send (status: string, path: string, data?: any): Promise<void> {
    let bundledData
    try {
      bundledData = await this._encoder.bundle(status, path, data || undefined)
    } catch (err) {
      throw new Error(`Error during message bundling: ${err.message}`)
    }

    let encodedData
    try {
      encodedData = await this._encoder.encode(bundledData)
    } catch (err) {
      throw new Error(`Error during message encoding: ${err.message}`)
    }

    this._transport!.send(encodedData)
  }

  public $$subHandle (patternStr: string, handler: Handler, timeout?: number): void {
    return this._router.$$subHandle(patternStr, handler, timeout)
  }

  private async _handleMessage (encodedData: any): Promise<void> {
    let data
    try {
      data = await this._encoder.decode(encodedData)
    } catch (err) {
      this._handleError('decoding', err)
      return
    }

    let classification
    try {
      classification = await this._encoder.classify(data)
    } catch (err) {
      this._handleError('classification', err)
      return
    }

    const message = new Message(classification.path, classification.status, data)
    const ctx = new Context(this._config, message, this)
    await this._router!.route(ctx)
  }

  private async _handleError (stageName: string, err: Error) {
    const ctx = new Context(this._config, new Message('', '', null), this)
    ctx.$$error = new Error(`Error during message ${stageName}: ${err.message}`)
    await this._router!.route(ctx)
  }
}
