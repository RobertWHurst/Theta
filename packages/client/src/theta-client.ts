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
  _webSocket: WebSocket
  _asyncHandler?: Handler
  _handler?: Handler

  constructor (url: string) {
    this.encoder = defaultEncoder
    this.decoder = defaultDecoder

    this._webSocket = new WebSocket(url)
    this._webSocket.addEventListener('message', async (event) => {
      const data = await this.decoder(event.data)
      if (this._asyncHandler) { this._asyncHandler(data); this._asyncHandler = undefined }
      if (this._handler) { this._handler(data) }
    })
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

  handle (handler: Handler): void
  async handle (): Promise<any>
  handle (handler?: Handler): Promise<any> | void {
    if (!handler) { return new Promise((resolve) => { this._asyncHandler = resolve }) }
    this._handler = handler
  }

  async send (path: string, data?: any) {
    const encodedData = await this.encoder(path, data)
    process.nextTick(() => { this._webSocket.send(encodedData) })
  }
}
