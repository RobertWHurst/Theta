import uuid from 'uuid'
import { TransportConnection } from '@thetaapp/server-transport'
import { Encoder } from '@thetaapp/encoder'
import { Pattern } from '@thetaapp/pattern'
import { Message, Socket as RouterSocket, Handler, Context } from '@thetaapp/router'
import { Config } from './config'

const noopHandler = (_: Context) => {
  // noop
}

export class Socket implements RouterSocket {
  public uuid: string
  public handleMessage: Handler
  public handleError: Handler
  private _config: Config
  private _connection: TransportConnection
  private _encoder: Encoder

  constructor (config: Config, connection: TransportConnection, encoder: Encoder) {
    this.uuid = uuid()
    this.handleMessage = noopHandler
    this.handleError = noopHandler
    this._config = config
    this._connection = connection
    this._encoder = encoder

    this._connection.handleMessage = d => this._handleMessage(d)
  }

  public async send (status: string, rawPath: string, data?: any): Promise <void> {
    const path = Pattern.raw(this._config, rawPath)

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

    this._connection.send(encodedData)
  }

  public $$send (status: string, rawPath: string, data?: any): Promise<void> {
    return this.send(status, rawPath, data)
  }

  private async _handleMessage (encodedData: any): Promise <void> {
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

    this.handleMessage!(ctx)
  }

  private _handleError (stageName: string, err: Error) {
    const ctx = new Context(this._config, new Message('', '', null), this)
    ctx.$$error = new Error(`Error during message ${stageName}: ${err.message}`)
    this.handleError!(ctx)
  }
}
