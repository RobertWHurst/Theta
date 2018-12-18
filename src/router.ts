import Theta from './theta'
import Context from './context'

export type Handler = (context: Context) => (Promise<void> | void)

export class HandlerChain {
  theta: Theta
  pattern: string
  handler: Handler
  nextLink?: HandlerChain

  constructor (theta: Theta, pattern: string, handler: Handler) {
    this.theta = theta
    this.pattern = pattern
    this.handler = handler
  }

  async route (context: Context, containErrors: boolean = false): Promise<void> {
    context.theta = this.theta
    context.setNextHandler(async () => {
      if (!this.nextLink) { return }
      await this.nextLink.route(context, containErrors)
    })

    if (!this._matchesPath(context.message.path)) {
      await context.next()
    }

    try {
      await this.handler(context)
    } catch (err) {
      if (!containErrors) { throw err }
      context.error = err
      await context.next()
    }
  }

  push (endLink: HandlerChain) {
    this.nextLink
      ? this.nextLink.push(endLink)
      : this.nextLink = endLink
  }

  _matchesPath (path: string) {
    const chunks = path.split('.')
    return chunks
      .map((_, i) => chunks.slice(0, i + 1).join('.'))
      .includes(this.pattern)
  }
}

export default class Router {
  theta: Theta
  _handlerChain?: HandlerChain
  _errorHandlerChain?: HandlerChain

  constructor (theta: Theta) {
    this.theta = theta
  }

  handle (pattern: string, handler: Handler | Router): void
  handle (handler: Handler | Router): void
  handle (pattern?: string | Handler | Router, handler?: Handler | Router): void {
    if (pattern && !handler) {
      handler = pattern as Handler | Router
      pattern = undefined
    }

    if (handler instanceof Router) {
      const router = handler
      handler = c => router.route(c)
    }

    const nextLink = new HandlerChain(this.theta, pattern as string, handler as Handler)

    this._handlerChain
      ? this._handlerChain.push(nextLink)
      : this._handlerChain = nextLink
  }

  handleError (handler: Handler): void
  handleError (pattern: string, handler: Handler): void
  handleError (pattern?: string | Handler, handler?: Handler): void {
    if (pattern && !handler) {
      handler = pattern as Handler
      pattern = undefined
    }

    const nextLink = new HandlerChain(this.theta, pattern as string, handler as Handler)

    this._errorHandlerChain
      ? this._errorHandlerChain.push(nextLink)
      : this._errorHandlerChain = nextLink
  }

  async route (context: Context): Promise<void> {
    if (!this._handlerChain) { return }
    try {
      await this._handlerChain.route(context)
    } catch (err) {
      await this.routeError(err, context)
    }
  }

  async routeError (_: Error, context: Context) {
    if (!this._errorHandlerChain) { return }
    await this._errorHandlerChain.route(context, true)
  }
}
