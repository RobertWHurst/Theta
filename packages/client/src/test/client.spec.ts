import sinon from 'sinon'
import assert from 'assert'
import { Client } from '../'
import { encoderFixture } from './fixture/encoder.fixture'
import { transportFixture } from './fixture/transport.fixture'

describe('new ThetaClient(config?: Config)', () => {
  it('can be constructed without config', () => {
    new Client()
  })
  it('can be constructed with config', () => {
    new Client({})
  })

  describe('#encoder(encoder: Encoder): void', () => {
    it('can be used to set an encoder', () => {
      const client = new Client()
      const encoder = encoderFixture()

      client.encoder(encoder)
    })
  })

  describe('#transport(transport: Transport): void', () => {
    it('can be used to set a transport', () => {
      const client = new Client()
      const transport = transportFixture()

      client.transport(transport)
    })

    it('attaches a handleMessage, handleError, and handleClose method to the transport', () => {
      const client = new Client()
      const transport = transportFixture()

      client.transport(transport)

      assert.ok(transport.handleMessage)
      assert.ok(transport.handleError)
      assert.ok(transport.handleClose)
    })

    describe('~handleMessage', () => {
      it('passes the message on to the encoders decode method', async () => {
        const client = new Client()
        const encoder = encoderFixture()
        const transport = transportFixture()
        const data = { key: 'value' }
        const dataStr = JSON.stringify(data)

        client.encoder(encoder)
        client.transport(transport)

        await transport.handleMessage!(dataStr)

        sinon.assert.calledOnce(encoder.decode as any)
        sinon.assert.calledWith(encoder.decode as any, dataStr)
      })

      it('passes the decoded message on to the encoders expand method', async () => {
        const client = new Client()
        const encoder = encoderFixture({ decode: d => JSON.parse(d) })
        const transport = transportFixture()
        const data = { key: 'value' }
        const dataStr = JSON.stringify(data)

        client.encoder(encoder)
        client.transport(transport)

        await transport.handleMessage!(dataStr)

        sinon.assert.calledOnce(encoder.expand as any)
        sinon.assert.calledWith(encoder.expand as any, sinon.match(data))
      })

      it('creates a context from the expanded and decoded message and routes it', async () => {
        const client = new Client()
        const encoder = encoderFixture({
          expand: async () => ({ path: '', status: '', data: { key: 'value' } })
        })
        const transport = transportFixture()
        const handler = sinon.stub()

        client.handle(handler)
        client.encoder(encoder)
        client.transport(transport)

        await (client as any)._handleMessage()

        sinon.assert.calledOnce(handler as any)
        sinon.assert.calledWith(
          handler as any,
          sinon.match(c => c.data.key === 'value')
        )
      })
    })

    describe('~handleError', () => {
      it('logs an error to console', async () => {
        const client = new Client()
        const transport = transportFixture()
        sinon.stub(console, 'error')

        client.transport(transport)

        await transport.handleError!(new Error('test error'))

        sinon.assert.calledOnce(console.error as any)
        sinon.assert.calledWith(
          console.error as any,
          sinon.match(e => e.message === 'test error')
        )
        ;(console.error as any).restore()
      })
    })

    describe('~handleClose', () => {
      it('notes a disconnection in the transport', async () => {
        const client = new Client()
        const transport = transportFixture()

        client.transport(transport)

        await transport.handleClose!()

        await assert.rejects(async () => await client.disconnect())
      })
    })
  })

  describe('#connect(): Promise<void>', () => {
    it('rejects if there is not transport', async () => {
      const client = new Client()

      await assert.rejects(client.connect())
    })

    it('calls connect on the transport', async () => {
      const client = new Client()
      const transport = transportFixture()
      client.transport(transport)

      await client.connect()

      sinon.assert.calledOnce(transport.connect as any)
    })

    it('sends all pending', async () => {
      const client = new Client()
      const transport = transportFixture({ connect: async () => {} })
      client.transport(transport)

      void client.send('/path/to/handler', { key: 'value' })
      await client.connect()

      sinon.assert.calledOnce(transport.send as any)
      sinon.assert.calledWith(
        transport.send as any,
        sinon.match(v => JSON.parse(v).data.key === 'value')
      )
    })
  })

  describe('#disconnect(): Promise<void>', () => {
    it('rejects if there is no transport', async () => {
      const client = new Client()
      await assert.rejects(client.disconnect())
    })

    it('throws if not connected', async () => {
      const client = new Client()
      const transport = transportFixture()
      client.transport(transport)
      await assert.rejects(client.disconnect())
    })

    it('calls disconnect on the transport', async () => {
      const client = new Client()
      const disconnect = sinon.stub()
      const transport = transportFixture({ disconnect })
      client.transport(transport)
      await client.connect()
      await client.disconnect()
      sinon.assert.calledOnce(disconnect)
    })
  })

  describe('#send(path: string, data: any): Promise<void>', () => {
    it('waits if not connected, and sends upon connection', async () => {
      const client = new Client()
      await client.send('path', 'message1')
      await client.send('path', 'message2')
      await client.send('path', 'message3')
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.transport(transport)
      await client.connect()
      sinon.assert.calledThrice(send)
      sinon.assert.calledWith(send, '{"status":"","path":"path","data":"message1"}')
      sinon.assert.calledWith(send, '{"status":"","path":"path","data":"message2"}')
      sinon.assert.calledWith(send, '{"status":"","path":"path","data":"message3"}')
    })

    it('bundles the data', async () => {
      const client = new Client()
      const bundle = sinon.stub()
      const encoder = encoderFixture({ bundle })
      const transport = transportFixture()
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      await client.send('path', 'message')
      sinon.assert.calledOnce(bundle)
      sinon.assert.calledWith(bundle, '', 'path', 'message')
    })

    it('encodes the bundled data', async () => {
      const client = new Client()
      const encode = sinon.stub()
      const encoder = encoderFixture({
        bundle: async () => 'bundled',
        encode
      })
      const transport = transportFixture()
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      await client.send('path', 'message')
      sinon.assert.calledOnce(encode)
      sinon.assert.calledWith(encode, 'bundled')
    })

    it('sends the bundled and encoded data using the transport', async () => {
      const client = new Client()
      const encoder = encoderFixture({
        encode: async () => 'encoded'
      })
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      await client.send('path', 'message')
      sinon.assert.calledOnce(send)
      sinon.assert.calledWith(send, 'encoded')
    })
  })

  describe('#request(path: string, data?: any, handler: Handler): Promise<void>', () => {
    it('waits if not connected, and sends upon connection', async () => {
      const client = new Client()
      const handler1 = sinon.stub()
      const handler2 = sinon.stub()
      const handler3 = sinon.stub()
      await client.request('path', 'message1', handler1)
      await client.request('path', 'message2', handler2)
      await client.request('path', 'message3', handler3)
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.transport(transport)
      await client.connect()
      sinon.assert.calledThrice(send)
      sinon.assert.calledWith(send, sinon.match(/{"status":"","path":"[a-z0-9]+@path","data":"message1"}/))
      sinon.assert.calledWith(send, sinon.match(/{"status":"","path":"[a-z0-9]+@path","data":"message2"}/))
      sinon.assert.calledWith(send, sinon.match(/{"status":"","path":"[a-z0-9]+@path","data":"message3"}/))
    })

    it('bundles the data', async () => {
      const client = new Client()
      const bundle = sinon.stub()
      const encoder = encoderFixture({ bundle })
      const transport = transportFixture()
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      const handler = (): void => {}
      await client.request('path', 'message', handler)
      sinon.assert.calledOnce(bundle)
      sinon.assert.calledWith(bundle, '', sinon.match(/[a-z0-9]+@path/), 'message')
    })

    it('encodes the bundled data', async () => {
      const client = new Client()
      const encode = sinon.stub()
      const encoder = encoderFixture({
        bundle: async () => 'bundled',
        encode
      })
      const transport = transportFixture()
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      const handler = (): void => {}
      await client.request('path', 'message', handler)
      sinon.assert.calledOnce(encode)
      sinon.assert.calledWith(encode, 'bundled')
    })

    it('sends the bundled and encoded data using the transport', async () => {
      const client = new Client()
      const encoder = encoderFixture({
        encode: async () => 'encoded'
      })
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.encoder(encoder)
      client.transport(transport)
      await client.connect()
      const handler = (): void => {}
      await client.request('path', 'message', handler)
      sinon.assert.calledOnce(send)
      sinon.assert.calledWith(send, 'encoded')
    })

    it('calls the handler once the client responds', async () => {
      const client = new Client()
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.transport(transport)
      await client.connect()
      const handler = sinon.stub()
      await client.request('path', 'request', handler)
      const encoded = (send.getCall(0) as any).firstArg
      const channelId: string = JSON.parse(encoded).path.match(/([a-z0-9]+)@path/)[1]
      await (client as any)._handleMessage(`{"status":"","path":"${channelId}@path","data":"response"}`)
      sinon.assert.calledOnce(handler)
      sinon.assert.calledWith(handler, sinon.match(ctx => {
        return ctx.message.data === 'response'
      }))
    })

    it.only('times out if the client does not respond in time', async () => {
      const client = new Client()
      const send = sinon.stub()
      const transport = transportFixture({ send })
      client.transport(transport)
      await client.connect()
      const handler = sinon.stub()
      await client.request('path', 'request', handler)
      const encoded = (send.getCall(0) as any).firstArg
      const channelId: string = JSON.parse(encoded).path.match(/([a-z0-9]+)@path/)[1]
      // const clock = sinon.useFakeTimers()
      const p = (client as any)._handleMessage(`{"status":"","path":"${channelId}@path","data":"response"}`)
      // console.log(clock.timeouts)
      await p
      sinon.assert.calledOnce(handler)
      sinon.assert.calledWith(handler, sinon.match(ctx => {
        return ctx.message.data === 'response'
      }))
    })
  })

  describe('#handle(patternStr?: string, handlerOrRouter: Handler | Router): void', () => {
    it(
      'binds a handler to a given path, and only calls it if a matching ' +
        'message is recieved'
    )
  })

  describe('#handleError(patternStr?: string, handlerOrRouter: Handler | Router): void', () => {
    it(
      'binds a handler to a given path, and only calls it if a matching ' +
        'message is recieved which caused a handler to error'
    )
  })
})
