import { ThetaClient } from './theta-client'

export class Message {
  public static async fromEncodedData (thetaClient: ThetaClient, encodedData: any): Promise<Message> {
    const message = new this(thetaClient)
    await message.fromEncodedData(encodedData)
    return message
  }

  public data?: any
  public status: string
  public channel: string
  private _thetaClient: ThetaClient

  constructor (thetaClient: ThetaClient) {
    Object.setPrototypeOf(this, thetaClient.message)
    this.status = ''
    this.channel = ''
    this._thetaClient = thetaClient
  }

  public async fromEncodedData (encodedData: any) {
    this.data = await this._thetaClient.decoder(encodedData)
    const { channel, status } = await this._thetaClient.classifier(this.data)
    this.channel = channel
    this.status = status
  }
}
