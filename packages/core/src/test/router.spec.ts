import Router from '../router'
import theta from './fixture/theta'
import assert from 'assert'
import HandlerChain from '../handler-chain'

describe('new Router(theta: Theta)', () => {

  it('can be constructed with an instance of theta', () => {
    new Router(theta())
  })

  it('can be constructed without an instance of theta', () => {
    new Router()
  })

  describe('handle(pattern: string, handler: Handler)', () => {

    it('binds a handler to a given pattern', () => {
      const router = new Router(theta())
      const handler = () => {}
      router.handle('PATTERN', handler)
    })
  })

  describe('handle(pattern: string, router: Router)', () => {

    it('binds a router to a given pattern', () => {
      const router = new Router(theta())
      const subRouter = new Router()
      router.handle('PATTERN', subRouter)

      assert.ok(router._handlerChain)
    })

    it('binds all pending handlers on the sub router', () => {
      const router = new Router(theta())
      const subRouter = new Router()
      const handler = () => {}
      subRouter.handle('PATTERN', handler)

      assert.strictEqual(subRouter._pendingHandlers[0].pattern, 'PATTERN')
      assert.strictEqual(subRouter._pendingHandlers[0].handler, handler)

      router.handle('PATTERN', subRouter)

      assert.strictEqual((subRouter._handlerChain as HandlerChain).handler, handler)
    })
  })

  describe('handle(pattern: string)', () => {

    it('throws informing the user they can only use handle without a handler for socket routes', () => {
      const router = new Router(theta())
      assert.throws(() => {
        router.handle('PATTERN')
      }, /socket routes/)
    })
  })

  describe('handle(handler: Handler)', () => {

    it('binds a handler to all messages', () => {
      const router = new Router(theta())
      const handler = () => {}
      router.handle(handler)

      assert.strictEqual((router._handlerChain as HandlerChain).handler, handler)
      assert.strictEqual((router._handlerChain as HandlerChain).pattern.raw, '+')
    })
  })

  describe('handle(router: Router)', () => {

    it('binds a router to all messages', () => {
      const router = new Router(theta())
      const subRouter = new Router()
      router.handle(subRouter)

      assert.ok((router._handlerChain as HandlerChain).handler)
      assert.strictEqual((router._handlerChain as HandlerChain).pattern.raw, '+')
    })
  })

  describe('handleError(pattern: string, handler: Handler)', () => {

    it('')
  })

  describe('handleError(handler: Handler)', () => {

    it('binds an error handler to all messages', () => {
      const router = new Router(theta())
      const handler = () => {}
      router.handleError(handler)

      assert.strictEqual((router._errorHandlerChain as HandlerChain).handler, handler)
      assert.strictEqual((router._errorHandlerChain as HandlerChain).pattern.raw, '+')
    })
  })
})
