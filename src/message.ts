import Theta from './theta'
import Server from './server'

export default class Message {
  static async fromEncodedData (theta: Theta, server: Server, encodedData: any, flags: object) {
    const message = new this(theta, server)
    await message.fromEncodedData(encodedData, flags)
  }

  data: any
  path: string
  _theta: Theta
  _server: Server

  constructor (theta: Theta, server: Server) {
    Object.setPrototypeOf(this, theta.message)
    this._theta = theta
    this._server = server
    this.path = ''
  }

  async fromEncodedData (encodedData: any, flags: object) {
    if (!this._theta.decodeFn || !this._theta.classifyFn) {
      throw new Error(
        'Cannot create message from encoded data. Theta is missing a ' +
        'decodeFn or classifyFn'
      );
    }
    this.data = await this._theta.decodeFn(encodedData, flags)
    this.path = await this._theta.classifyFn(this.data)
  }

  toEncodedData () {
    if (!this._theta.encodeFn) {
      throw new Error('Cannot encode message. Theta is missing a encodeFn');
    }
    return this._theta.encodeFn(this.data)
  }
}
