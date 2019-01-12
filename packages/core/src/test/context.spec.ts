import { strict as assert } from 'assert'
import sinon from 'sinon'
import Context from '../context'
import socket from './fixture/socket'
import message from './fixture/message'

describe('new Context(message: Message, socket: Socket)', () => {

  it('can be constructed from a message and socket', () => {
    assert.doesNotThrow(() => { new Context(message(), socket()) })
  })

  it('exposes the socket uuid', () => {
    const ctx = new Context(message(), socket())
    assert.equal(ctx.uuid, 'UUID')
  })

  it('exposes the message path', () => {
    const ctx = new Context(message(), socket())
    assert.equal(ctx.path, 'PATH')
  })

  it('exposes the message params', () => {
    const ctx = new Context(message({ params: { param: 'PARAM' } }), socket())
    assert.equal(ctx.params.param, 'PARAM')
  })

  it('exposes the message data', () => {
    const ctx = new Context(message({ data: 'DATA' }), socket())
    assert.equal(ctx.data, 'DATA')
  })

  describe('#status(status: string): this', () => {

    it('calls status on the socket and returns this', () => {
      const status = sinon.stub()
      const ctx = new Context(message(), socket({ status }))
      assert.equal(ctx.status('ok'), ctx)
      sinon.assert.calledOnce(status)
      sinon.assert.calledWith(status, 'ok')
    })
  })

  describe('#sendStatus(status: string): this', () => {

    it('calls sendStatus on the socket and returns a promise', () => {
      const sendStatus = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(message(), socket({ sendStatus }))
      assert.ok(ctx.sendStatus('STATUS') instanceof Promise)
      sinon.assert.calledOnce(sendStatus)
      sinon.assert.calledWith(sendStatus, 'STATUS')
    })
  })

  describe('#send(data: any): Promise<void>', () => {

    it('calls send on the socket and returns a promise', () => {
      const send = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(message(), socket({ send }))
      assert.ok(ctx.send('DATA') instanceof Promise)
      sinon.assert.calledOnce(send)
      sinon.assert.calledWith(send, 'DATA')
    })
  })

  describe('#handle(pattern: string, handler: Handler)', () => {

    it('calls handle on the socket', () => {
      const handle = sinon.stub()
      const handler = () => {}
      const ctx = new Context(message(), socket({ handle }))
      ctx.handle('PATTERN', handler)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, 'PATTERN', handler)
    })
  })

  describe('#handle(handler: Handler)', () => {

    it('calls handle on the socket', () => {
      const handle = sinon.stub()
      const handler = () => {}
      const ctx = new Context(message(), socket({ handle }))
      ctx.handle(handler)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, handler)
    })
  })

  describe('#handle(pattern: string): Promise<Context>', () => {

    it('calls handle on the socket and resolves a context', () => {
      const handle = sinon.stub().returns(Promise.resolve())
      const ctx = new Context(message(), socket({ handle }))
      assert.ok(ctx.handle('PATTERN') instanceof Promise)
      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, 'PATTERN')
    })
  })

  describe('#next(): Promise<void>', () => {

    it('calls next handler', () => {
      const ctx = new Context(message(), socket())
      const nextHandler = sinon.stub().returns(Promise.resolve())
      ctx._nextHandler = nextHandler
      assert.ok(ctx.next() instanceof Promise)
      sinon.assert.calledOnce(nextHandler)
    })

    it('does nothing if no next handler is set', () => {
      const ctx = new Context(message(), socket())
      assert.doesNotThrow(() => { ctx.next() })
    })
  })

  describe('#timeout(timeout: number): this', () => {

    it('sets timeout and returns this', () => {
      const ctx = new Context(message(), socket())
      assert.equal(ctx.timeout(100), ctx)
      assert.equal(ctx._timeout, 100)
    })
  })

  describe('#_tryToApplyPattern(pattern: Pattern): this', () => {

    it('calls _tryToApplyPattern on the message', () => {
      const _tryToApplyPattern = sinon.stub()
      const ctx = new Context(message({ _tryToApplyPattern }), socket())
      ctx._tryToApplyPattern('PATTERN' as any)
      sinon.assert.calledOnce(_tryToApplyPattern)
      sinon.assert.calledWith(_tryToApplyPattern, 'PATTERN')
    })

    it('returns false if _tryToApplyPattern on the message returns false', () => {
      const _tryToApplyPattern = sinon.stub().returns(false)
      const ctx = new Context(message({ _tryToApplyPattern }), socket())
      assert.equal(ctx._tryToApplyPattern('PATTERN' as any), false)
      assert.notEqual(ctx._handled, true)
    })

    it('returns true if _tryToApplyPattern on the message returns true and marks itself as handled', () => {
      const _tryToApplyPattern = sinon.stub().returns(true)
      const ctx = new Context(message({ _tryToApplyPattern }), socket())
      assert.equal(ctx._tryToApplyPattern('PATTERN' as any), true)
      assert.equal(ctx._handled, true)
    })
  })
})
