import Router from './router'
import { Handler } from './theta'
import Context from './context'

export default class SocketRouter extends Router {
  _errorHandlerChain: undefined

  async handle (pattern: string, handler?: Handler): Promise<Context>
  async handle (handler: Handler): Promise<Context>
  async handle (pattern?: string | Handler, handler?: Handler): Promise<Context> {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler
      pattern = undefined
    }
    return new Promise((resolve) => {
      const handlerWrapper = async (ctx: Context) => {
        if (handler) { await handler(ctx) }
        resolve(ctx)
      }
      typeof pattern === 'string'
        ? super.handle(pattern, handlerWrapper)
        : super.handle(handlerWrapper)
    })
  }

  handleError (): never {
    throw new Error('Cannot handle errors on socket router')
  }

  clearRouterHandlers () {
    this._handlerChain = undefined
  }
}

module.exports = SocketRouter
