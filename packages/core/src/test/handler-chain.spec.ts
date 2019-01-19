import assert from 'assert'
import sinon from 'sinon'
import HandlerChain from '../handler-chain'
import theta from './fixture/theta'
import pattern from './fixture/pattern'
import context from './fixture/context'

describe('new HandlerChain(theta: Theta, pattern: Pattern, handler: Handler, continueOnError: boolean)', () => {

  it('can be constructed', () => {
    const handler = sinon.stub() as any
    new HandlerChain(theta(), pattern(), handler, false)
  })

  describe('#route(context: Context): Promise<void>', () => {

    it('attaches theta to the context', async () => {
      const handler = sinon.stub() as any
      const ctx = context()
      const t = theta()
      const handlerChain = new HandlerChain(t, pattern(), handler, false)

      await handlerChain.route(ctx)

      assert.strictEqual(ctx.theta, t)
    })

    it('attaches _nextHandler to the context which calls nextLink.route when executed', async () => {
      const handler = sinon.stub() as any
      const ctx = context()
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      await handlerChain.route(ctx)

      assert.ok(ctx._nextHandler)
    })

    it('calls the current link\'s handler if it\'s pattern matches', async () => {
      const handler = sinon.stub() as any
      const ctx = context({ _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      await handlerChain.route(ctx)

      sinon.assert.calledOnce(handler)
      sinon.assert.calledWith(handler, ctx)
    })

    it('attaches an error to the context if thrown from the handler', async () => {
      const err = new Error('Test error')
      const handler = sinon.stub().throws(err) as any
      const ctx = context({ _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      await handlerChain.route(ctx)

      assert.strictEqual(ctx.error, err)
    })

    it('calls the next link\'s handler after an error if continueOnError is set to true', async () => {
      const err = new Error('Test error')
      const handler = sinon.stub().throws(err) as any
      const ctx = context({ _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(theta(), pattern(), handler, true)
      const route = sinon.stub()
      handlerChain.nextLink = { route } as any

      await handlerChain.route(ctx)

      assert.strictEqual(ctx.error, err)
      sinon.assert.calledOnce(route)
      sinon.assert.calledWith(route, ctx)
    })

    it('attaches an error to the context if the handler times out', async () => {
      const handler = sinon.stub().returns(new Promise(() => {})) as any
      const ctx = context({ _timeout: 1000 * 1000, _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      const timers = sinon.useFakeTimers()
      const p = handlerChain.route(ctx)
      timers.tick(1000 * 1000)
      await p
      timers.restore()

      assert.ok(ctx.error.message.indexOf('timed out') !== -1)
    })

    it('uses the timeout set on theta if not set on the context', async () => {
      const t = theta({ config: { handlerTimeout: 1000 * 1000 } })
      const handler = sinon.stub().returns(new Promise(() => {})) as any
      const ctx = context({ _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(t, pattern(), handler, false)

      const timers = sinon.useFakeTimers()
      const p = handlerChain.route(ctx)
      timers.tick(1000 * 1000)
      await p
      timers.restore()

      assert.ok(ctx.error.message.indexOf('timed out') !== -1)
    })

    it('never times out if timeout is set to zero', async () => {
      const handler = sinon.stub().returns(new Promise(() => {})) as any
      const ctx = context({ _tryToApplyPattern: () => ({}) })
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      const timers = sinon.useFakeTimers()
      let hasResolved = false
      handlerChain.route(ctx).then(() => { hasResolved = true })
      timers.tick(Infinity)
      timers.restore()

      assert.ok(!hasResolved)
    })

    it('calls the next link\'s route method if the a match is not made', async () => {
      const handler = sinon.stub() as any
      const ctx = context()
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)
      const route = sinon.stub()
      handlerChain.nextLink = { route } as any

      await handlerChain.route(ctx)

      sinon.assert.calledOnce(route)
      sinon.assert.calledWith(route, ctx)
    })

    it('does not continue on errors by default', async () => {
      const handlerChain = new HandlerChain(theta(), pattern(), 'HANDLER' as any)

      assert.strictEqual(handlerChain.continueOnError, false)
    })
  })

  describe('push(context: Context): Promise<void>', () => {

    it('adds a new link to the chain', () => {
      const handler = 'HANDLER' as any
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      const secondaryHandler = 'SECONDARY_HANDLER' as any
      const secondaryHandlerChain = new HandlerChain(theta(), pattern(), secondaryHandler, false)
      handlerChain.push(secondaryHandlerChain)

      assert.strictEqual(handlerChain.nextLink, secondaryHandlerChain)
    })

    it('anyways adds links to the end of the chain', () => {
      const handler = 'HANDLER' as any
      const handlerChain = new HandlerChain(theta(), pattern(), handler, false)

      const secondaryHandler = 'SECONDARY_HANDLER' as any
      const secondaryHandlerChain = new HandlerChain(theta(), pattern(), secondaryHandler, false)
      handlerChain.push(secondaryHandlerChain)

      const tertiaryHandler = 'TURTIARY_HANDLER' as any
      const tertiaryHandlerChain = new HandlerChain(theta(), pattern(), tertiaryHandler, false)
      handlerChain.push(tertiaryHandlerChain)

      assert.strictEqual(handlerChain.nextLink, secondaryHandlerChain)
      assert.strictEqual(secondaryHandlerChain.nextLink, tertiaryHandlerChain)
    })
  })
})
