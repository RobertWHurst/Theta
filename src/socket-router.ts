import Router, { Handler } from './router'

export default class SocketRouter extends Router {
  _errorHandlerChain: undefined

  handle (pattern?: string | Handler | Router, handler?: Handler | Router): void {
    if (handler instanceof Router) {
      throw new Error('Cannot use routers as handlers for sockets')
    }
    if (pattern && !handler) {
      handler = pattern as Handler
      pattern = undefined
    }

    typeof pattern === 'string'
      ? super.handle(pattern, handler as Handler)
      : super.handle(handler as Handler)
  }

  handleError (): never {
    throw new Error('Cannot handle errors on socket router')
  }

  clearRouterHandlers () {
    this._handlerChain = undefined
  }

  routeError (): never {
    throw new Error('routeErr cannot be called on sockets')
  }
}

module.exports = SocketRouter
