import WebSocket from 'ws'
import Theta from './theta'
import Pattern, { Params } from './pattern'

export default class Message {
  static async fromEncodedData (theta: Theta, encodedData: WebSocket.Data): Promise<Message> {
    const message = new this(theta)
    await message.fromEncodedData(encodedData)
    return message
  }

  path: string
  data?: any
  params: Params
  _theta: Theta

  constructor (theta: Theta, path: string = '', data?: any) {
    Object.setPrototypeOf(this, theta.message)
    this._theta = theta
    this.path = path
    this.data = data
    this.params = {}
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
    const params = pattern.tryMatch(this.path)
    if (!params) { return false }
    this.params = params
    return true
  }
}
