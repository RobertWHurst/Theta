import WebSocket from 'ws'
import Theta from './theta'

export default class Message {
  static async fromEncodedData (theta: Theta, encodedData: WebSocket.Data): Promise<Message> {
    const message = new this(theta)
    await message.fromEncodedData(encodedData)
    return message
  }

  data?: WebSocket.Data
  path: string
  _theta: Theta

  constructor (theta: Theta) {
    Object.setPrototypeOf(this, theta.message)
    this._theta = theta
    this.path = ''
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
}
