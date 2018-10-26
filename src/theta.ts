import {
  Config,
  ClassifyFn,
  ClassifyFnWCb,
  EncodeFn,
  EncodeFnWCb,
  DecodeFn,
  DecodeFnWCb,
  HandlerFn,
  HandlerFnWCb
} from './types'

import Router from './router'
import Server from './server'
import Socket from './socket'
import Message from './message'

const defaultClassifyFn: ClassifyFn = async (message) => message.data.path
const defaultEncodeFn: EncodeFn = async (data) => JSON.stringify(data)
const defaultDecodeFn: DecodeFn = async (encodedData, flags) => {
  if (flags.binary) { throw new Error('binary websockets unsupported') }
  return JSON.parse(encodedData)
}

export default class Theta {

  config: Config
  classifyFn?: ClassifyFn
  encodeFn?: EncodeFn
  decodeFn?: DecodeFn
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

    this.classify(defaultClassifyFn)
    this.encode(defaultEncodeFn)
    this.decode(defaultDecodeFn)
  }

  classify (classifyFn: ClassifyFn | ClassifyFnWCb): this {
    this.classifyFn = data => new Promise((resolve, reject) => {
      try {
        classifyFn.length === 2
          ? (classifyFn as ClassifyFnWCb)(data, (err, path) => err ? reject(err) : resolve(path))
          : (classifyFn as ClassifyFn)(data).then(resolve).catch(reject)
      } catch (err) {
        reject(err)
      }
    })
    return this
  }

  encode (encodeFn: EncodeFn | EncodeFnWCb): this {
    this.encodeFn = data => new Promise((resolve, reject) => {
      try {
        encodeFn.length === 2
          ? (encodeFn as EncodeFnWCb)(data, (err, encodedData) => err ? reject(err) : resolve(encodedData))
          : (encodeFn as EncodeFn)(data).then(resolve).catch(reject)
      } catch (err) {
        reject(err)
      }
    })
    return this
  }

  decode (decodeFn: DecodeFn | DecodeFnWCb): this {
    this.decodeFn = encodedData => new Promise((resolve, reject) => {
      try {
        decodeFn.length === 2
          ? (decodeFn as DecodeFnWCb)(encodedData, (err, data) => err ? reject(err) : resolve(data))
          : (decodeFn as DecodeFn)(encodedData).then(resolve).catch(reject)
      } catch (err) {
        reject(err)
      }
    })
    return this
  }

  handle (pathPattern: string, handlerFn: HandlerFn | HandlerFnWCb): this {
    this.router.handle(pathPattern, handlerFn)
    return this
  }

  listen (...args) {
    return this.server.listen(...args)
  }

  close (...args) {
    return this.server.close(...args)
  }
}

module.exports = Theta
