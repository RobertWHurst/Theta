
import { Theta, Handler } from './theta'
import { Context } from './context'
import { HandlerChain } from './handler-chain'
import { Pattern } from './pattern'

export class Router {
  public theta?: Theta
  protected _handlerChain?: HandlerChain
  protected _errorHandlerChain?: HandlerChain
  protected _pendingHandlers: any[]

  constructor (theta?: Theta) {
    this.theta = theta
    this._pendingHandlers = []
  }

  handle (pattern: string, handler?: Handler | Router): void
  handle (handler: Handler | Router): void
  handle (pattern?: string | Handler | Router, handler?: Handler | Router): void {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler | Router
      pattern = undefined
    }
    if (!handler) {
      throw new Error('handler can only be excluded for handler socket routes')
    }

    if (!this.theta) {
      this._pendingHandlers.push({ pattern, handler })
      return
    }

    if (handler instanceof Router) {
      const router = handler
      router.applyPendingHandlersWithTheta(this.theta)
      handler = async (ctx: Context) => {
        await router.route(ctx)
        if (ctx.$$handled) { return }
        return ctx.next()
      }
    }

    const nextLink = new HandlerChain(this.theta, new Pattern(pattern || '+'), handler)

    this._handlerChain
      ? this._handlerChain.push(nextLink)
      : this._handlerChain = nextLink
  }

  handleError (handler: Handler): void
  handleError (pattern: string, handler: Handler): void
  handleError (pattern?: string | Handler, handler?: Handler): void {
    if (typeof pattern !== 'string') {
      handler = pattern as Handler
      pattern = undefined
    }

    if (!this.theta) {
      throw new Error('Error handlers can only be bound on the root router')
    }

    const nextLink = new HandlerChain(
      this.theta,
      new Pattern(pattern || '+'),
      handler as Handler,
      true
    )

    this._errorHandlerChain
      ? this._errorHandlerChain.push(nextLink)
      : this._errorHandlerChain = nextLink
  }

  async route (ctx: Context): Promise<void> {
    ctx.$$handled = false
    const existingNextHandler = ctx.$$nextHandler

    if (!ctx.$$error) {
      if (!this._handlerChain) { return }
      await this._handlerChain.route(ctx)
    }

    if (ctx.$$error) {
      if (!this._errorHandlerChain) { return }
      await this._errorHandlerChain.route(ctx)
    }

    ctx.$$nextHandler = existingNextHandler
  }

  applyPendingHandlersWithTheta (theta: Theta) {
    this.theta = theta
    for (const args of this._pendingHandlers) {
      this.handle(args.pattern, args.handler)
    }
  }
}
