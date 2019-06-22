import sinon from 'sinon'
import { Router } from '../router'
import { Context } from '../context'

describe('new Router()', () => {
  it('can be constructed without throwing', () => {
    /* tslint:disable-next-line:no-unused-expression */
    new Router({})
  })

  describe('#handle(handler: Handler)', () => {
    it('binds a handler to all requests', () => {
      const r = new Router({})
      const handler = sinon.stub()

      r.handle(handler)
    })
  })

  describe('#handle(pattern: string, handler: Handler)', () => {
    it('binds a handler to requests matching a given pattern', () => {
      const r = new Router({})
      const handler = sinon.stub()

      r.handle('/path/to/handler', handler)
    })
  })

  describe('#async route(ctx: Context) -> Promise<void>', () => {
    it("tries to match the given context against a hander's pattern", async () => {
      const r = new Router({})
      const handler = sinon.stub()
      r.handle('/my/path', handler)
      const ctx = new Context({}, null, null as any)
      ctx.$$tryToApplyPattern = sinon.stub().returns(true)

      await r.route(ctx)

      sinon.assert.calledOnce(ctx.$$tryToApplyPattern as any)
      sinon.assert.calledWith(
        ctx.$$tryToApplyPattern as any,
        sinon.match(p => p.raw === 'my/path')
      )
      sinon.assert.calledOnce(handler)
      sinon.assert.calledWith(handler, ctx)
    })

    it('Will move along the handler chain until it finds a match', async () => {
      const r = new Router({})
      const badHandler1 = sinon.stub()
      const badHandler2 = sinon.stub()
      const goodHandler1 = sinon.stub()
      const goodHandler2 = sinon.stub()
      r.handle(badHandler1)
      r.handle(badHandler2)
      r.handle(goodHandler1)
      r.handle(goodHandler2)
      const ctx = new Context({}, null, null as any)
      ctx.$$tryToApplyPattern = sinon
        .stub()
        .returns(false)
        .onThirdCall()
        .returns(true)

      await r.route(ctx)

      sinon.assert.notCalled(badHandler1)
      sinon.assert.notCalled(badHandler2)
      sinon.assert.calledOnce(goodHandler1)
      sinon.assert.calledWith(goodHandler1, ctx)
      sinon.assert.notCalled(goodHandler2)
    })

    it('Will call through to the next matching handler if the current one calls next', async () => {
      const r = new Router({})
      const badHandler1 = sinon.stub()
      const badHandler2 = sinon.stub()
      const goodHandler1 = sinon.stub().callsFake(c => c.next())
      const goodHandler2 = sinon.stub()
      r.handle(badHandler1)
      r.handle(badHandler2)
      r.handle(goodHandler1)
      r.handle(goodHandler2)
      const ctx = new Context({}, null, null as any)
      ctx.$$tryToApplyPattern = sinon
        .stub()
        .returns(false)
        .onCall(2)
        .returns(true)
        .onCall(3)
        .returns(true)

      await r.route(ctx)

      sinon.assert.notCalled(badHandler1)
      sinon.assert.notCalled(badHandler2)
      sinon.assert.calledOnce(goodHandler1)
      sinon.assert.calledWith(goodHandler1, ctx)
      sinon.assert.calledOnce(goodHandler2)
      sinon.assert.calledWith(goodHandler2, ctx)
    })
  })
})
