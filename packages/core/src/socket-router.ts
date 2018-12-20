import Router from './router'
import { Handler } from './theta'
import Context from './context'

export default class SocketRouter extends Router {
  _errorHandlerChain: undefined

  handle (pattern: string, handler: Handler): void
  handle (handler: Handler): void
  async handle (pattern: string): Promise<Context>
  handle (pattern?: string | Handler, handler?: Handler): Promise<Context> | void {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler
      pattern = undefined
    }

    if (!handler) {
      return new Promise((resolve) => {
        const handler = async (ctx: Context) => {
          this.clearRouterHandlers()
          resolve(ctx)
        }
        typeof pattern === 'string'
          ? super.handle(pattern, handler)
          : super.handle(handler)
      })
    }

    typeof pattern === 'string'
      ? super.handle(pattern, handler)
      : super.handle(handler)
  }

  handleError (): never {
    throw new Error('Cannot handle errors on socket router')
  }

  clearRouterHandlers () {
    this._handlerChain = undefined
  }
}

module.exports = SocketRouter