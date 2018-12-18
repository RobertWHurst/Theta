import http from 'http'
import https from 'https'
import WebSocket from 'ws'
import { default as Router, Handler } from './router'
import Server from './server'
import Socket from './socket'
import Message from './message'

export type Classifier = (data: any) => Promise<string>
export type Encoder = (data: any) => Promise<any>
export type Decoder = (encodedData: WebSocket.Data) => Promise<any>

export interface Config {
  server?: http.Server | https.Server
  ssl?: object,
  backlog?: number,
  path?: string,
  clientTracking?: boolean,
  handleProtocols?: any,
  maxPayload?: number
}

const defaultClassifier: Classifier = async (message) =>
  message.data && message.data.path || ''
const defaultEncoder: Encoder = async (data) => JSON.stringify(data)
const defaultDecoder: Decoder = async (encodedData) =>
  typeof encodedData === 'string' ? JSON.parse(encodedData) : {}

export default class Theta {

  config: Config
  classifier: Classifier
  encoder: Encoder
  decoder: Decoder
  message: Object
  socket: Object
  router: Router
  server: Server

  constructor (config: Config = {}) {
    this.config = config

    this.message = Object.create(Message.prototype)
    this.socket = Object.create(Socket.prototype)

    this.router = new Router(this)
    this.server = new Server(this)

    this.classifier = defaultClassifier
    this.encoder = defaultEncoder
    this.decoder = defaultDecoder
  }

  classify (classifier: Classifier): this {
    this.classifier = classifier
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

  handle (pathPattern: string, handler: Handler): this {
    this.router.handle(pathPattern, handler)
    return this
  }

  listen (...args: any[]) {
    return this.server.listen(...args)
  }

  close (...args: any[]) {
    return this.server.close(...args)
  }
}
