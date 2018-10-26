import async, { reject } from 'async'
import { Handler, HandlerFn } from './types'
import Theta from './theta'
import Context from './context'
import { resolve } from 'url';

export default class Router {
  theta: Theta
  _handlers: Handler[]
  _errorHandlers: Handler[]

  constructor (theta: Theta) {
    this.theta = theta
    this._handlers = []
    this._errorHandlers = []
  }

  handle(fn: HandlerFn | Router): void;
  handle(pattern: string, fn: HandlerFn | Router): void;
  handle(pattern?: string | HandlerFn | Router, fn?: HandlerFn | Router): void {
    this._handle(false, pattern, fn)
  }

  handleError(fn: HandlerFn): void;
  handleError(pattern: string, fn: HandlerFn): void;
  handleError(pattern?: string | HandlerFn, fn?: HandlerFn): void {
    this._handle(true, pattern, fn)
  }

  async route (context: Context): Promise<void> {
    if (this._handlers.length === 0) { return }

    await new Promise((resolve, reject) => {
      async.eachSeries(this._handlers, (handler, next) => {
        context.next = next

        if (handler.router) {
          handler.router.route(context)
        } else if (handler.fn) {
          handler.fn(context)
        }

        try {
        } catch (err) {
          this.routeError(context, err)
        }
      })
    })
    

    for (const handler of this._handlers) {
      if (!this._pathMatchesPattern(context.message.path, handler.pattern)) { continue }

      context.halt = true
      if (context.halt) { return }
    }
  }

  async routeError(context: Context, error: Error) {
    if (this._errorHandlers.length === 0) { return }

    for (const handler of this._errorHandlers) {
      if (!this._pathMatchesPattern(context.message.path, handler.pattern)) { continue }

      context.error = error
      context.halt = true
      try {
        if (handler.fn) {
          await handler.fn(context)
        }
      } catch (err) {
        error = err
      }
      if (context.halt) { return }
    }

    console.warn('Unhandled error: ', error)
    console.warn(
      'It is highly recommended to register an error handler in order properly report errors to ' +
      'the client'
    )
  }

  _handle(isErrorHandler: boolean, pattern?: string | HandlerFn | Router, fn?: HandlerFn | Router): void {
    if (pattern && !fn) {
      fn = pattern as HandlerFn | Router
      pattern = undefined
    }

    let router
    if (fn instanceof Router) {
      if (isErrorHandler) { throw new Error('Cannot use a router as an error handler') }
      router = fn as Router
      fn = undefined
      router.theta = this.theta
    }

    const handler: Handler = {}
    pattern && (handler.pattern = pattern as string)
    fn && (handler.fn = fn as HandlerFn)
    router && (handler.router = router)

    isErrorHandler
      ? this._errorHandlers.push(handler)
      : this._handlers.push(handler)
  }

  _pathMatchesPattern (path: string, pattern: string = '') {
    const chunks = path.split('.')
    return chunks
      .map((c, i) => chunks.slice(0, i + 1).join('.'))
      .includes(pattern)
  }
}
