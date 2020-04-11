import { v4 as uuidv4 } from 'uuid'
import { TransportConnection } from '@thetaapp/server-transport'
import { Encoder } from '@thetaapp/encoder'
import {
  Message,
  Socket as RouterSocket,
  Handler,
  Context,
  Router
} from '@thetaapp/router'
import { Config } from './config'

const noopHandler = (_: Context): void => {
  /* noop */
}

export class Socket implements RouterSocket {
  public uuid: string
  public handleMessage: Handler
  public handleError: Handler
  private readonly _config: Config
  private readonly _router: Router
  private readonly _connection: TransportConnection
  private readonly _encoder: Encoder

  constructor (
    config: Config,
    router: Router,
    connection: TransportConnection,
    encoder: Encoder
  ) {
    this.uuid = uuidv4()
    this.handleMessage = noopHandler
    this.handleError = noopHandler
    this._config = config
    this._router = router
    this._connection = connection
    this._encoder = encoder
    this._connection.handleMessage = async d => await this._handleMessage(d)
  }

  public async send (status: string, rawPath: string, data?: any): Promise<void> {
    return await this.$$send(status, rawPath, data)
  }

  public async $$send (
    status: string,
    rawPath: string,
    data?: any
  ): Promise<void> {
    let bundledData
    try {
      bundledData = await this._encoder.bundle(
        status,
        rawPath,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        data || undefined
      )
    } catch (err) {
      throw new Error(`Error during message bundling: ${err.message as string}`)
    }

    let encodedData
    try {
      encodedData = await this._encoder.encode(bundledData)
    } catch (err) {
      throw new Error(`Error during message encoding: ${err.message as string}`)
    }

    void this._connection.send(encodedData)
  }

  public $$subHandle (
    patternStr: string,
    handler: Handler
  ): void {
    return this._router.$$subHandle(patternStr, handler)
  }

  private async _handleMessage (encodedData: any): Promise<void> {
    let data
    try {
      data = await this._encoder.decode(encodedData)
    } catch (err) {
      this._handleError('decoding', err)
      return
    }

    let expand
    try {
      expand = await this._encoder.expand(data)
    } catch (err) {
      this._handleError('expanding', err)
      return
    }

    const message = new Message(
      expand.path,
      expand.status,
      expand.data
    )
    const ctx = new Context(this._config, message, this)

    void this.handleMessage(ctx)
  }

  private _handleError (stageName: string, err: Error): void {
    const ctx = new Context(this._config, new Message('', '', null), this)
    ctx.$$error = new Error(`Error during message ${stageName}: ${err.message}`)
    void this.handleError(ctx)
  }
}
