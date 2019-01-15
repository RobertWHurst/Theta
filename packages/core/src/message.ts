import WebSocket from 'ws'
import Theta from './theta'
import Pattern, { Params } from './pattern'

export default class Message {
  static async fromEncodedData (theta: Theta, encodedData: WebSocket.Data): Promise<Message> {
    const message = new this(theta)
    await message.fromEncodedData(encodedData)
    return message
  }

  channel: string
  path: string
  data?: any
  params: Params
  _theta: Theta
  _path: string

  constructor (theta: Theta) {
    Object.setPrototypeOf(this, theta.message)
    this._theta = theta
    this.channel = ''
    this.path = ''
    this.data = {}
    this.params = {}
    this._path = ''
  }

  async fromEncodedData (encodedData: WebSocket.Data) {
    this.data = await this._theta.decoder(encodedData)
    this._path = await this._theta.classifier(this.data)
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
    this.channel = match.channel
    this.path = match.path
    this.params = match.params
    return true
  }
}
