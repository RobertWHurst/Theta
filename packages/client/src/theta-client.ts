import { Context } from './context'
import { Message } from './message'

export type Plugin = (theta: ThetaClient, opts?: object) => void
export type Classifier = (data: any) => Promise<{ status: string, channel: string }>
export type Formatter = (channel: string, data?: any) => Promise<any>
export type Encoder = (data: any) => Promise<any>
export type Decoder = (encodedData: any) => Promise<any>
export type ChannelHandler = (context: Context) => Promise<any>
export type Handler = (context: Context) => (Promise<void> | void)

export interface PendingSend {
  path: string,
  data: any,
  resolve: (value?: void | PromiseLike<void> | undefined) => void
  reject: (reason?: any) => void
}

export const channelChars: string[] = []
for (let i = 0; i <= 9; i += 1) { channelChars.push(String.fromCharCode(i + 48)) }
for (let i = 0; i <= 25; i += 1) { channelChars.push(String.fromCharCode(i + 97)) }
export let channelIdLength = 10

export const createChannelId = () => {
  return Array.from({ length: channelIdLength })
    .map(() => channelChars[Math.round(Math.random() * (channelChars.length - 1))])
    .join('')
}

export const defaultClassifier: Classifier = async (data) =>
  ({ channel: data && data.channel || '', status: data && data.status || '' })
export const defaultFormatter: Formatter = async (path, data) =>
  data !== null && typeof data === 'object' ? { ...data, path } :
  data ? { data, path } : { path }
export const defaultEncoder: Encoder = async (data) => JSON.stringify(data)
export const defaultDecoder: Decoder = async (encodedData) =>
  typeof encodedData === 'string' ? JSON.parse(encodedData) : {}

export class ThetaClient {
  public context: Object
  public message: Object
  public classifier: Classifier
  public formatter: Formatter
  public encoder: Encoder
  public decoder: Decoder
  private _handlers: { [s: string]: Handler[] }
  private _webSocket?: WebSocket
  private _pendingSends: PendingSend[]

  constructor () {
    this.context = Object.create(Context.prototype)
    this.message = Object.create(Message.prototype)

    this.classifier = defaultClassifier
    this.formatter = defaultFormatter
    this.encoder = defaultEncoder
    this.decoder = defaultDecoder
    this._handlers = {}
    this._pendingSends = []
  }

  public plugin (plugin: Plugin, opts?: any): this {
    plugin(this, opts)
    return this
  }

  public classify (classifier: Classifier): this {
    this.classifier = classifier
    return this
  }

  public format (formatter: Formatter): this {
    this.formatter = formatter
    return this
  }

  public encode (encoder: Encoder): this {
    this.encoder = encoder
    return this
  }

  public decode (decoder: Decoder): this {
    this.decoder = decoder
    return this
  }

  public async connect (url: string) {
    return new Promise((resolve, reject) => {
      const webSocket = new WebSocket(url)

      const handleOpen = () => {
        webSocket.onclose = null
        this._webSocket = webSocket
        resolve()
        for (const pendingSend of this._pendingSends) {
          this.send(pendingSend.path, pendingSend.data)
            .then(pendingSend.resolve, pendingSend.reject)
        }
      }

      const handleClose = (event: CloseEvent) => {
        reject(new Error(
          `Failed to connect to remote. code: ${event.code}, reason: ${event.reason}`
        ))
      }

      webSocket.onopen = handleOpen
      webSocket.onclose = handleClose
      webSocket.onmessage = (event) => { void this._handleMessage(event.data) }
    })
  }

  public async disconnect (): Promise<void> {
    return new Promise((resolve) => {
      if (!this._webSocket) { return }
      this._webSocket.onclose = () => resolve()
      this._webSocket.close()
    })
  }

  public async channel (channelHandler: ChannelHandler): Promise<any> {
    const message = new Message(this)
    message.channel = createChannelId()
    const context = new Context(this, message)
    return channelHandler(context)
  }

  public handle (cb: Handler): void
  public handle (channel: string, handler: Handler): void
  public async handle (): Promise<Context>
  public async handle (channel: string): Promise<Context>
  public handle (channel?: string | Handler, handler?: Handler): Promise<Context> | void {
    if (typeof channel !== 'string') {
      handler = channel as Handler
      channel = ''
    }
    const addHandler = (handler: Handler) => {
      this._handlers[channel as string] || (this._handlers[channel as string] = [])
      this._handlers[channel as string].push(handler)
    }
    if (handler) { return addHandler(handler) }
    return new Promise((resolve) => { addHandler((ctx) => { resolve(ctx) }) })
  }

  public async send (path: string, data?: any): Promise<void> {
    if (!this._webSocket) {
      return new Promise((resolve, reject) => {
        this._pendingSends.push({ path, data, resolve, reject })
      })
    }
    data = await this.formatter(path, data)
    const encodedData = await this.encoder(data)
    process.nextTick(() => {
      if (!this._webSocket) { throw new Error('Connection closed') }
      this._webSocket.send(encodedData)
    })
  }

  public async request (path: string, data?: any): Promise<Context> {
    return this.channel((ctx) => ctx.request(path, data))
  }

  public async _handleMessage (encodedData: any) {
    const message = await Message.fromEncodedData(this, encodedData)
    const handler = this._handlers[message.channel] && this._handlers[message.channel].shift()
    if (!handler) { return }
    await handler(new Context(this, message))
  }
}
