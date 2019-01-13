import WebSocket from 'ws'
import Theta from './theta'
import Pattern, { Params } from './pattern'

export default class Message {
  static async fromEncodedData (theta: Theta, encodedData: WebSocket.Data): Promise<Message> {
    const message = new this(theta)
    await message.fromEncodedData(encodedData)
    return message
  }

  namespace: string
  path: string
  data?: any
  params: Params
  _theta: Theta
  _path: string

  constructor (theta: Theta, path: string = '', data?: any) {
    Object.setPrototypeOf(this, theta.message)
    this.namespace = ''
    this.path = ''
    this.data = data
    this.params = {}
    this._theta = theta
    this._path = path
  }

  async fromEncodedData (encodedData: WebSocket.Data) {
    this.data = await this._theta.decoder(encodedData)
    this.path = await this._theta.classifier(this.data)
  }

  toEncodedData () {
    if (!this._theta.encoder) {
      throw new Error('Cannot encode message. Theta is missing a encoder')
    }
    return this._theta.encoder(this.data)
  }

  _tryToApplyPattern (pattern: Pattern): boolean {
    const match = pattern.tryMatch(this._path)
    if (!match) { return false }
    this.namespace = match.namespace
    this.path = match.path
    this.params = match.params
    return true
  }
}
