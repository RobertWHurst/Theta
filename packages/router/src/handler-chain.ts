import { Pattern } from '@thetaapp/pattern'
import { Config } from './config'
import { Handler } from './handler'
import { TimeoutError } from './timeout-error'
import { Router } from './router'
import { Context } from './context'

const noop = (): void => {}

export class HandlerChain {
  public nextLink?: HandlerChain
  private _pattern: Pattern
  private _handler: Handler | Router
  private _config: Config
  private _isErrorHandler: boolean

  public constructor(
    config: Config,
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ) {
    this._config = config
    this._pattern = new Pattern(this._config, patternStr)
    this._handler = handler
    this._isErrorHandler = isErrorHandler
  }

  public push(
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ): void {
    this.nextLink
      ? this.nextLink.push(patternStr, handler, isErrorHandler)
      : (this.nextLink = new HandlerChain(
          this._config,
          patternStr,
          handler,
          isErrorHandler
        ))
  }

  public is(
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ): boolean {
    // TODO: remove raw here
    return (
      this._pattern.raw === Pattern.raw(patternStr) &&
      this._handler === handler &&
      this._isErrorHandler === isErrorHandler
    )
  }

  public remove(
    patternStr: string,
    handler: Handler | Router,
    isErrorHandler: boolean
  ): boolean {
    if (!this.nextLink) {
      return false
    }
    if (this.nextLink.is(patternStr, handler, isErrorHandler)) {
      this.nextLink = this.nextLink.nextLink
      return true
    }
    return this.nextLink.remove(patternStr, handler, isErrorHandler)
  }

  public async route(ctx: Context): Promise<void> {
    const executeNext = async (): Promise<void> => {
      if (!this.nextLink) {
        return
      }
      await this.nextLink.route(ctx)
    }

    ctx.next = async function(err?: Error): Promise<void> {
      if (err) {
        this.$$error = err
        return
      }
      await executeNext()
    }

    if (ctx.$$error && !this._isErrorHandler) {
      return executeNext()
    }

    if (!ctx.$$tryToApplyPattern(this._pattern)) {
      return executeNext()
    }

    const executeHandler = async (): Promise<void> => {
      try {
        this._handler instanceof Router
          ? await this.route(ctx)
          : await this._handler(ctx)
      } catch (err) {
        ctx.$$error = err
      }
      if (ctx.$$error) {
        throw ctx.$$error
      }
    }

    const timeout = ctx.$$timeout || this._config.timeout || -1

    if (timeout === -1) {
      ctx.$$resetTimeout = noop
      return executeHandler()
    }

    await Promise.race([
      new Promise((_resolve, reject) => {
        let timeoutId: NodeJS.Timeout
        const exec = (): void => {
          timeoutId !== undefined && clearTimeout(timeoutId)
          if (timeout === -1) {
            return
          }
          timeoutId = setTimeout((): void => {
            reject(new TimeoutError(ctx))
          }, timeout)
        }
        ctx.$$resetTimeout = exec
        exec()
      }),
      executeHandler()
    ])
  }
}
