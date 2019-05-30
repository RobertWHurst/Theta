import { Config } from './config'
import { Handler } from './handler'
import { HandlerChain } from './handler-chain'
import { Pattern } from '@thetaapp/pattern'
import { Context } from './context'

export class Router<C extends Context> {
  private config: Config
  private handlerChain?: HandlerChain<C>

  public constructor (config: Config) {
    this.config = config
  }

  public handle (handler: Handler<C>): void
  public handle (router: Router<C>): void
  public handle (patternStr: string, handler: Handler<C>): void
  public handle (patternStr: string, router: Router<C>): void
  public handle (patternStr: string | Handler<C> | Router<C>, handler?: Handler<C> | Router<C>): void {
    if (!handler) {
      handler = patternStr as Handler<C>
      patternStr = '+'
    }

    if (handler instanceof Router) {
      const router = handler
      handler = async c => router.route(c)
    }

    const pattern = new Pattern(this.config, patternStr as string)
    const nextLink = new HandlerChain(this.config, pattern, handler)

    this.handlerChain
      ? this.handlerChain.push(nextLink)
      : this.handlerChain = nextLink
  }

  public async route (ctx: C): Promise<void> {
    if (!this.handlerChain) { return }
    await this.handlerChain.route(ctx)
  }
}
