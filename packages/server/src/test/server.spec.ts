import assert from 'assert'
import sinon from 'sinon'
// import { webSocketTransport } from '@thetaapp/server-transport-web-socket'
import { Context } from '@thetaapp/router'
import { Server } from '../server'
import { testTransport } from './fixture/test-transport'
import { testTransportConnection } from './fixture/test-transport-connection'

describe('new Server(encoder: Encoder)', () => {
  it('can be constructed', () => {
    // tslint:disable-next-line no-unused-expression
    new Server()
  })

  describe('#transport(transport: Transport)', () => {
    it('adds a transport to Server', async () => {
      const s = new Server()

      const t = testTransport()
      s.transport(t)

      assert.strictEqual((s as any)._transports[0], t)
    })

    it('attaches a connection handler', () => {
      const s = new Server()
      const t = testTransport()

      s.transport(t)

      assert.ok(t.handleConnection)
    })

    it('attaches message handler to new connections', () => {
      const s = new Server()
      const t = testTransport()
      s.transport(t)

      const tc = testTransportConnection()
      t.handleConnection!(tc)

      assert.ok(tc.handleMessage!)
    })

    it('handles messages by creating a context and passing it to _handleMessage', async () => {
      const s = new Server()
      const t = testTransport()
      s.transport(t)
      sinon.stub(s as any, '_handleMessage')

      const tc = testTransportConnection()
      t.handleConnection!(tc)
      await tc.handleMessage!(
        '{ "path": "/path/to/handler", "status": "ok", "data": { "key": "value" } }'
      )

      sinon.assert.calledOnce((s as any)._handleMessage)
      sinon.assert.calledWith(
        (s as any)._handleMessage,
        sinon.match(ctx => {
          assert.ok(ctx instanceof Context)
          assert.strictEqual(ctx.message.rawPath, '/path/to/handler')
          assert.strictEqual(ctx.message.status, 'ok')
          assert.strictEqual(ctx.message.data.key, 'value')
          return true
        })
      )
    })
  })

  describe('#listen() -> Promise<void>', () => {
    it('calls listen on each transport', async () => {
      const s = new Server()

      const t1 = testTransport()
      const t2 = testTransport()
      s.transport(t1)
      s.transport(t2)

      await s.listen()

      sinon.assert.calledOnce(t1.listen as any)
      sinon.assert.calledOnce(t2.listen as any)
    })
  })

  describe('#close() -> Promise<void>', () => {
    it('calls close on each transport', async () => {
      const s = new Server()

      const t1 = testTransport()
      const t2 = testTransport()
      s.transport(t1)
      s.transport(t2)

      await s.close()

      sinon.assert.calledOnce(t1.close as any)
      sinon.assert.calledOnce(t2.close as any)
    })
  })
})
