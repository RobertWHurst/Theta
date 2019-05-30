import { Pattern } from '@thetaapp/pattern'
import { Config } from './config'
import { Context } from './context'
import { Handler } from './handler'
import { TimeoutError } from './timeout-error'

export class HandlerChain<C extends Context> {
  private config: Config
  private pattern: Pattern
  private handler: Handler<C>
  private nextLink?: HandlerChain<C>

  public constructor (config: Config, pattern: Pattern, handler: Handler<C>) {
    this.config = config
    this.pattern = pattern
    this.handler = handler
  }

  public push (nextLink: HandlerChain<C>) {
    this.nextLink
      ? this.nextLink.push(nextLink)
      : this.nextLink = nextLink
  }

  public async route (ctx: C): Promise<void> {
    const executeNext = async () => {
      if (!this.nextLink) { return }
      await this.nextLink.route(ctx)
    }

    if (!ctx.$$tryToApplyPattern(this.pattern)) {
      return executeNext()
    }

    const timeoutPromise = new Promise((_, reject) => {
      const timeout = ctx.$$timeout || this.config.timeout || -1
      if (timeout === -1) { return }
      setTimeout(() => { reject(new TimeoutError(ctx)) }, timeout)
    })

    const handlerPromise = (async () => {
      ctx.next = async function (err?: Error) {
        if (err) {
          this.$$error = err
          return
        }
        await executeNext()
      }

      try {
        await this.handler(ctx)
      } catch (err) {
        ctx.$$error = err
      }
      if (ctx.$$error) {
        throw ctx.$$error
      }
    })()

    await Promise.race([timeoutPromise, handlerPromise])
  }
}
