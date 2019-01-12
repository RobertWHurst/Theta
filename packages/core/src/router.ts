
import Theta, { Handler } from './theta'
import Context from './context'
import HandlerChain from './handler-chain'
import Pattern from './pattern'

export default class Router {
  theta: Theta
  _handlerChain?: HandlerChain
  _errorHandlerChain?: HandlerChain

  constructor (theta: Theta) {
    this.theta = theta
  }

  handle (pattern: string, handler?: Handler | Router): void
  handle (handler: Handler | Router): void
  handle (pattern?: string | Handler | Router, handler?: Handler | Router): void {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler | Router
      pattern = undefined
    }
    if (!handler) {
      throw new Error('handler can only be excluded for handler sub-routes')
    }

    if (handler instanceof Router) {
      const router = handler
      handler = c => router.route(c)
    }

    const nextLink = new HandlerChain(this.theta, new Pattern(pattern as string), handler)

    this._handlerChain
      ? this._handlerChain.push(nextLink)
      : this._handlerChain = nextLink
  }

  handleError (handler: Handler | Router): void
  handleError (pattern: string, handler: Handler | Router): void
  handleError (pattern?: string | Handler | Router, handler?: Handler | Router): void {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler | Router
      pattern = undefined
    }

    if (handler instanceof Router) {
      const router = handler
      handler = c => router.route(c)
    }

    const nextLink = new HandlerChain(this.theta, new Pattern(pattern as string), handler as Handler, true)

    this._errorHandlerChain
      ? this._errorHandlerChain.push(nextLink)
      : this._errorHandlerChain = nextLink
  }

  async route (context: Context): Promise<void> {
    if (!this._handlerChain) { return }
    await this._handlerChain.route(context)

    if (context.error) {
      if (!this._errorHandlerChain) { return }
      await this._errorHandlerChain.route(context)
    }
  }
}
