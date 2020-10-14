import { Config } from './config'
import { Handler } from './handler'
import { HandlerChain } from './handler-chain'
import { Context } from './context'

export class Router {
  private readonly _config: Config
  private _handlerChain?: HandlerChain

  public constructor (config: Config) {
    this._config = config
  }

  public async route (ctx: Context): Promise<void> {
    if (!this._handlerChain) {
      return
    }
    await this._handlerChain.route(ctx)
  }

  public handle(handler: Handler): void
  public handle(router: Router): void
  public handle(patternStr: string, handler: Handler): void
  public handle(patternStr: string, router: Router): void
  public handle (
    patternStr: string | Handler | Router,
    handler?: Handler | Router
  ): void {
    if (handler === undefined) {
      handler = patternStr as Handler
      patternStr = '+'
    }
    this._handle(patternStr as string, handler, false)
  }

  public unhandle(handler: Handler): boolean
  public unhandle(router: Router): boolean
  public unhandle(patternStr: string, handler: Handler): boolean
  public unhandle(patternStr: string, router: Router): boolean
  public unhandle (
    patternStr: string | Handler | Router,
    handler?: Handler | Router
  ): boolean {
    if (!handler) {
      handler = patternStr as Handler
      patternStr = '+'
    }
    return this._unhandle(patternStr as string, handler, false)
  }

  public handleError(handler: Handler): void
  public handleError(patternStr: string, handler: Handler): void
  public handleError (patternStr: string | Handler, handler?: Handler): void {
    if (!handler) {
      handler = patternStr as Handler
      patternStr = '+'
    }
    this._handle(patternStr as string, handler, true)
  }

  public unhandleError(handler: Handler): void
  public unhandleError(patternStr: string, handler: Handler): void
  public unhandleError (patternStr: string | Handler, handler?: Handler): void {
    if (!handler) {
      handler = patternStr as Handler
      patternStr = '+'
    }
    this._unhandle(patternStr as string, handler, true)
  }

  public $$subHandle (patternStr: string, handler: Handler): void {
    // TODO: Instead of injecting into the front of the handler chain add
    //       to special array.
    const h: Handler = async (ctx: Context) => {
      this.unhandle(patternStr, h)
      return await handler(ctx)
    }
    const handlerChain = this._handlerChain
    this._handlerChain = new HandlerChain(
      this._config,
      patternStr,
      h,
      false
    )
    this._handlerChain.nextLink = handlerChain
  }

  public $$clearSubHandlers (): void {

  }

  private _handle (
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ): void {
    this._handlerChain
      ? this._handlerChain.push(patternStr, handler, isErrorHandler)
      : (this._handlerChain = new HandlerChain(
        this._config,
        patternStr,
        handler,
        isErrorHandler
      ))
  }

  private _unhandle (
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ): boolean {
    if (!this._handlerChain) {
      return false
    }
    if (this._handlerChain.is(patternStr, handler, false)) {
      this._handlerChain = this._handlerChain.nextLink
      return true
    }
    return this._handlerChain.remove(
      patternStr,
      handler,
      isErrorHandler
    )
  }
}
