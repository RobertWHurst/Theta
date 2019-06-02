import assert from 'assert'
import sinon from 'sinon'
import { Context } from '../context'
import socket from './fixture/socket'
import message from './fixture/message'
import server from './fixture/server'

describe('new Context(message: Message, socket: Socket)', () => {

  it('can be constructed from a message and socket', () => {
    new Context(server(), message(), socket())
  })

  it('exposes the socket uuid', () => {
    const ctx = new Context(server(), message(), socket())
    assert.strictEqual(ctx.uuid, 'UUID')
  })

  it('exposes the message path', () => {
    const ctx = new Context(server(), message(), socket())
    assert.strictEqual(ctx.path, 'PATH')
  })

  it('exposes the message params', () => {
    const ctx = new Context(server(), message({ params: { param: 'PARAM' } }), socket())
    assert.strictEqual(ctx.params.param, 'PARAM')
  })

  it('exposes the message data', () => {
    const ctx = new Context(server(), message({ data: 'DATA' }), socket())
    assert.strictEqual(ctx.data, 'DATA')
  })

  describe('#status(status: string): this', () => {

    it('calls status on the socket and returns this', () => {
      const status = sinon.stub()
      const ctx = new Context(server(), message(), socket({ status }))
      assert.strictEqual(ctx.status('ok'), ctx)
      sinon.assert.calledOnce(status)
      sinon.assert.calledWith(status, 'ok')
    })
  })

  describe('#sendStatus(status: string): this', () => {

    it('calls sendStatus on the socket and returns a promise', () => {
      const sendStatus = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(server(), message(), socket({ sendStatus }))
      assert.ok(ctx.sendStatus('STATUS') instanceof Promise)
      sinon.assert.calledOnce(sendStatus)
      sinon.assert.calledWith(sendStatus, 'STATUS')
    })
  })

  describe('#send(data: any): Promise<void>', () => {

    it('calls send on the socket and returns a promise', () => {
      const send = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(server(), message(), socket({ send }))
      assert.ok(ctx.send('DATA') instanceof Promise)
      sinon.assert.calledOnce(send)
      sinon.assert.calledWith(send, 'DATA')
    })
  })

  describe('#handle(pattern: string, handler: Handler)', () => {

    it('calls handle on the socket', () => {
      const handle = sinon.stub()
      const handler = () => {}
      const ctx = new Context(server(), message(), socket({ handle }))
      ctx.handle('PATTERN', handler)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, 'PATTERN', handler)
    })
  })

  describe('#handle(handler: Handler)', () => {

    it('calls handle on the socket', () => {
      const handle = sinon.stub()
      const handler = () => {}
      const ctx = new Context(server(), message(), socket({ handle }))
      ctx.handle(handler)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, handler)
    })
  })

  describe('#handle(pattern: string): Promise<Context>', () => {

    it('calls handle on the socket and resolves a context', () => {
      const handle = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(server(), message(), socket({ handle }))
      assert.ok(ctx.handle('PATTERN') instanceof Promise)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, 'PATTERN')
    })
  })

  describe('#next(): Promise<void>', () => {

    it('calls next handler', () => {
      const ctx = new Context(server(), message(), socket())
      const nextHandler = sinon.stub().returns(Promise.resolve())
      ctx.$$nextHandler = nextHandler
      assert.ok(ctx.next() instanceof Promise)
      sinon.assert.calledOnce(nextHandler)
    })

    it('does nothing if no next handler is set', () => {
      const ctx = new Context(server(), message(), socket())
      void ctx.next()
    })
  })

  describe('#timeout(timeout: number): this', () => {

    it('sets timeout and returns this', () => {
      const ctx = new Context(server(), message(), socket())
      assert.strictEqual(ctx.timeout(100), ctx)
      assert.strictEqual(ctx.$$timeout, 100)
    })
  })

  describe('#$$tryToApplyPattern(pattern: Pattern): this', () => {

    it('calls $$tryToApplyPattern on the message', () => {
      const $$tryToApplyPattern = sinon.stub()
      const ctx = new Context(server(), message({ $$tryToApplyPattern }), socket())
      ctx.$$tryToApplyPattern('PATTERN' as any)
      sinon.assert.calledOnce($$tryToApplyPattern)
      sinon.assert.calledWith($$tryToApplyPattern, 'PATTERN')
    })

    it('returns false if $$tryToApplyPattern on the message returns false', () => {
      const $$tryToApplyPattern = sinon.stub().returns(false)
      const ctx = new Context(server(), message({ $$tryToApplyPattern }), socket())
      assert.strictEqual(ctx.$$tryToApplyPattern('PATTERN' as any), false)
      assert.notStrictEqual(ctx.$$handled, true)
    })

    it('returns true if $$tryToApplyPattern on the message returns true and marks itself as handled', () => {
      const $$tryToApplyPattern = sinon.stub().returns(true)
      const ctx = new Context(server(), message({ $$tryToApplyPattern }), socket())
      assert.strictEqual(ctx.$$tryToApplyPattern('PATTERN' as any), true)
      assert.strictEqual(ctx.$$handled, true)
    })
  })
})
