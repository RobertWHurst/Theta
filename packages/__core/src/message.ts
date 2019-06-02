import uuid from 'uuid'
import { Theta } from './theta'
import { Pattern, Params } from './pattern'

export class Message {
  static async fromEncodedData (theta: Theta, encodedData: any): Promise<Message> {
    const message = new this(theta)
    await message.fromEncodedData(encodedData)
    return message
  }

  public channel: string
  public path: string
  public data?: any
  public params: Params
  public requestId: string
  private _theta: Theta
  private _path: string

  constructor (theta: Theta) {
    Object.setPrototypeOf(this, theta.message)
    this._theta = theta
    this.channel = ''
    this.path = ''
    this.data = {}
    this.params = {}
    this.requestId = uuid()
    this._path = ''
  }

  async fromEncodedData (encodedData: any) {
    this.data = await this._theta.decoder(encodedData)
    this._path = await this._theta.classifier(this.data)
  }

  $$tryToApplyPattern (pattern: Pattern): boolean {
    const match = pattern.tryMatch(this._path)
    if (!match) { return false }
    this.channel = match.channel
    this.path = match.path
    this.params = match.params
    return true
  }
}
