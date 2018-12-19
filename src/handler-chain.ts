import Theta, { Handler } from './theta'
import Context from './context'

export class TimeoutError extends Error {
  constructor (context: Context) {
    super(`Handler for path ${context.message.path} timed out before it resolved`)
  }
}

export default class HandlerChain {
  theta: Theta
  pattern: string
  handler: Handler
  continueOnError: boolean
  nextLink?: HandlerChain

  constructor (theta: Theta, pattern: string, handler: Handler, continueOnError: boolean = false) {
    this.theta = theta
    this.pattern = pattern
    this.handler = handler
    this.continueOnError = continueOnError
  }

  async route (context: Context): Promise<void> {
    context.theta = this.theta
    context._nextHandler = async () => {
      if (!this.nextLink) { return }
      await this.nextLink.route(context)
    }

    if (!this._matchesPath(context.message.path)) {
      await context.next()
    }
    context._handled = true

    try {
      await this._callHandler(context)
    } catch (err) {
      context.error = err
      if (!this.continueOnError) { return }
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

  async _callHandler (context: Context) {
    const timeout = (
      typeof context._timeout === 'number' ? context._timeout :
      typeof this.theta.config.handlerTimeout === 'number' ? this.theta.config.handlerTimeout :
      10000
    )

    let timeoutId: any
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => { reject(new TimeoutError(context)) }, timeout)
    })

    const handlerPromise = (async () => {
      await this.handler(context)
      clearTimeout(timeoutId)
    })()

    await Promise.race([timeoutPromise, handlerPromise])
  }
}
