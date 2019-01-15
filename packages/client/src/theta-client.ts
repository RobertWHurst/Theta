import Channel from './channel'

export type Plugin = (thetaClient: ThetaClient, opts?: object) => void
export type Encoder = (path: string, data: any) => Promise<any>
export type Decoder = (encodedData: any) => Promise<any>
export type Handler = (data: any) => (Promise<void> | void)

export const defaultEncoder: Encoder = async (path, data) => JSON.stringify(
  typeof data === 'object' ? { ...data, path } :
  data ? { path, data } : { path }
)
export const defaultDecoder: Decoder = async (encodedData) => JSON.parse(encodedData)

export default class ThetaClient {
  encoder: Encoder
  decoder: Decoder
  _channels: { [s: string]: Channel }
  _pendingSendData: any[]
  _handler?: Handler
  _webSocket?: WebSocket

  constructor () {
    this.encoder = defaultEncoder
    this.decoder = defaultDecoder
    this._channels = {}
    this._pendingSendData = []
  }

  async connect (url: string): Promise<void> {
    const webSocket = new WebSocket(url)
    this._webSocket = webSocket

    webSocket.addEventListener('message', async (event) => {
      const data = await this.decoder(event.data)
      const channel = data.channel && this._channels[data.channel]
      if (channel._handler) {
        channel._handler(data)
      } else if (this._handler) {
        this._handler(data)
      }
    })

    await new Promise((resolve) => {
      const connect = () => { webSocket.removeEventListener('connect', connect); resolve() }
      webSocket.addEventListener('connect', connect)
    })

    this._pendingSendData.forEach(d => webSocket.send(d))
    this._pendingSendData.length = 0
  }

  plugin (plugin: Plugin, opts?: object): this {
    plugin(this, opts)
    return this
  }

  encode (encoder: Encoder): this {
    this.encoder = encoder
    return this
  }

  decode (decoder: Decoder): this {
    this.decoder = decoder
    return this
  }

  channel (fn: (channel: Channel) => Promise<void> | void): Channel {
    const channel = new Channel(this)
    this._channels[channel._channel] = channel
    if (fn) { fn(channel) }
    return channel
  }

  handle (handler: Handler): void {
    this._handler = handler
  }

  async send (path: string, data?: any) {
    const encodedData = await this.encoder(path, data)
    process.nextTick(() => {
      if (this._webSocket) {
        this._webSocket.send(encodedData)
        return
      }
      this._pendingSendData.push(encodedData)
    })
  }
}
