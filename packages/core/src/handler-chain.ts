import Theta, { Handler } from './theta'
import Context from './context'
import Pattern from './pattern'

export class TimeoutError extends Error {
  constructor (context: Context) {
    super(`Handler for path ${context.message.path} timed out before it resolved`)
  }
}

export default class HandlerChain {
  theta: Theta
  pattern: Pattern
  handler: Handler
  continueOnError: boolean
  nextLink?: HandlerChain

  constructor (theta: Theta, pattern: Pattern, handler: Handler, continueOnError: boolean = false) {
    this.theta = theta
    this.pattern = pattern
    this.handler = handler
    this.continueOnError = continueOnError
  }

  async route (context: Context): Promise<void> {
    context.theta = this.theta
    context.$$nextHandler = async () => {
      if (!this.nextLink) { return }
      await this.nextLink.route(context)
    }

    if (!context.$$tryToApplyPattern(this.pattern)) {
      await context.next()
      return
    }

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

  async _callHandler (context: Context) {
    const timeout =
      typeof context.$$timeout === 'number' ? context.$$timeout :
      typeof this.theta.config.handlerTimeout === 'number' ? this.theta.config.handlerTimeout :
      0

    let timeoutId: any
    const handlerPromise = (async () => {
      await this.handler(context)
      clearTimeout(timeoutId)
    })()
    if (timeout === 0) { return handlerPromise }

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => { reject(new TimeoutError(context)) }, timeout)
    })

    await Promise.race([timeoutPromise, handlerPromise])
  }
}
