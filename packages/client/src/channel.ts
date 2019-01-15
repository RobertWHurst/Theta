import ThetaClient, { Handler } from './theta-client'

export const channelChars: string[] = []
for (let i = 0; i <= 9; i += 1) { channelChars.push(String.fromCharCode(i + 48)) }
for (let i = 0; i <= 26; i += 1) { channelChars.push(String.fromCharCode(i + 97)) }

export type ChannelFn = (channel: Channel) => Promise<void> | void
export let channelIdLength = 10

export default class Channel {
  _thetaClient: ThetaClient
  _channel: string
  _handler?: Handler

  constructor (thetaClient: ThetaClient) {
    this._thetaClient = thetaClient
    this._channel = ''
    for (let i = 0; i < channelIdLength; i += 1) {
      this._channel += channelChars[Math.round(Math.random() * (channelChars.length - 1))]
    }
  }

  handle (): Promise<any> {
    return new Promise((resolve) => {
      this._handler = resolve
    })
  }

  send (path: string, data: any): Promise<void> {
    path = `${this._channel}@${path}`
    return this._thetaClient.send(path, data)
  }
}
