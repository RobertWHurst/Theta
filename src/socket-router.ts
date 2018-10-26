import Router from './router'
import Theta from './theta';
import Socket from './socket';
import { HandlerFn, Handler } from './types';
import Context from './context';

export default class SocketRouter extends Router {
  handle(pattern?: string | HandlerFn | Router, fn?: HandlerFn | Router): void {
    if (pattern && !fn) {
      fn = pattern as HandlerFn | Router
      pattern = ''
    }
    if (!fn) {
      throw new Error('fn is required')
    }
    if (fn instanceof Router) {
      throw new Error('Cannot use routers as handlers for sockets')
    }
    const handler: Handler = { fn }
    pattern && (handler.pattern = pattern as string)
    this._handlers.push(handler)
  }

  handleError(pattern?: string | HandlerFn, fn?: HandlerFn): never {
    throw new Error('Cannot use error handlers for sockets')
  }

  clearRouterHandlers () {
    this._handlers.length = 0
  }

  async routeErr (context: Context, err: Error) {
    context.error = err
    await context.next()
  }

  _executeHandlerFn (handler, ...args) {
    const cb = args.pop()
    try {
      handler.fn(...args, cb)
    } catch (err) { cb(err) }

    const handlerIndex = this._handlers.indexOf(handler)
    if (handlerIndex > -1) {
      this._handlers.splice(handlerIndex, 1)
    }
  }
}

module.exports = SocketRouter
