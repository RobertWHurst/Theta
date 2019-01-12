import http from 'http'
import https from 'https'
import WebSocket from 'ws'
import Router from './router'
import Server from './server'
import Socket from './socket'
import Message from './message'
import Context from './context'

export type Plugin = (theta: Theta, opts?: object) => void
export type Classifier = (data: any) => Promise<string>
export type Responder = (status: string, data?: any, err?: Error) => Promise<any>
export type Encoder = (data: any) => Promise<any>
export type Decoder = (encodedData: WebSocket.Data) => Promise<any>
export type Handler = (context: Context) => (Promise<void> | void)

export interface Config {
  server?: http.Server | https.Server
  ssl?: object,
  backlog?: number,
  path?: string,
  clientTracking?: boolean,
  handleProtocols?: any,
  maxPayload?: number,
  handlerTimeout?: number
}

export const defaultClassifier: Classifier = async (data) => data && data.path || ''
export const defaultResponder: Responder = async (status, data, err) =>
  err ? { error: err } :
  typeof data === 'object' ? { ...data, status } :
  data ? { data, status } : { status }
export const defaultEncoder: Encoder = async (data) => JSON.stringify(data)
export const defaultDecoder: Decoder = async (encodedData) =>
  typeof encodedData === 'string' ? JSON.parse(encodedData) : {}

export default class Theta {

  config: Config
  classifier: Classifier
  responder: Responder
  encoder: Encoder
  decoder: Decoder
  context: Object
  message: Object
  socket: Object
  router: Router
  server: Server

  constructor (config: Config = {}) {
    this.config = config

    this.context = Object.create(Context.prototype)
    this.message = Object.create(Message.prototype)
    this.socket = Object.create(Socket.prototype)

    this.router = new Router(this)
    this.server = new Server(this)

    this.classifier = defaultClassifier
    this.responder = defaultResponder
    this.encoder = defaultEncoder
    this.decoder = defaultDecoder
  }

  plugin (plugin: Plugin, opts?: any): this {
    plugin(this, opts)
    return this
  }

  classify (classifier: Classifier): this {
    this.classifier = classifier
    return this
  }

  respond (responder: Responder): this {
    this.responder = responder
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

  handle (pattern: string, handler?: Handler | Router): this
  handle (handler: Handler | Router): this
  handle (pattern?: string | Handler | Router, handler?: Handler | Router): this {
    this.router.handle(pattern as any, handler)
    return this
  }

  handleError (handler: Handler | Router): this
  handleError (pattern: string, handler: Handler | Router): this
  handleError (pattern?: string | Handler | Router, handler?: Handler | Router): this {
    this.router.handleError(pattern as any, handler as any)
    return this
  }

  listen (...args: any[]): this {
    this.server.listen(...args)
    return this
  }

  close (...args: any[]): this {
    this.server.close(...args)
    return this
  }
}
