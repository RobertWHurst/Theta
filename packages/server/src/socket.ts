import uuid from 'uuid'
import { TransportConnection } from './transport-connection'
import { Context } from './context'
import { Encoder } from './encoder'
import { Message } from './message'

export class Socket {
  public uuid: string
  public handleMessage?: (ctx: Context) => void
  private _connection: TransportConnection
  private _encoder: Encoder

  constructor (connection: TransportConnection, encoder: Encoder) {
    this.uuid = uuid()
    this._connection = connection
    this._encoder = encoder
    this._connection.handleMessage = d => this._handleMessage(d)
  }

  public async send (status: string, path: string, data: any): Promise<void> {
    let bundledData
    try {
      bundledData = await this._encoder.bundle(status, path, data)
    } catch (err) {
      console.error(err)
      return
    }

    let encodedData
    try {
      encodedData = await this._encoder.encode(bundledData)
    } catch (err) {
      console.error(err)
      return
    }

    await this._connection.send(encodedData)
  }

  private async _handleMessage (encodedData: any): Promise<void> {
    let data
    try {
      data = await this._encoder.decode(encodedData)
    } catch (err) {
      console.error(err)
      return
    }

    let classification
    try {
      classification = await this._encoder.classify(data)
    } catch (err) {
      console.error(err)
      return
    }

    const message = new Message(classification.path, classification.status, data)
    const ctx = new Context(message, this)
    this.handleMessage!(ctx)
  }
}
