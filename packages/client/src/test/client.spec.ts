import sinon from 'sinon'
import assert from 'assert'
import { Client } from '../'
import { encoderFixture } from './fixture/encoder.fixture'
import { transportFixture } from './fixture/transport.fixture'

describe('new ThetaClient(opts?: Opts)', () => {
  it('can be constructed without opts', () => {
    new Client()
  })
  it('can be constructed with opts', () => {
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

      it('passes the decoded message on to the encoders classify method', async () => {
        const client = new Client()
        const encoder = encoderFixture({ decode: d => JSON.parse(d) })
        const transport = transportFixture()
        const data = { key: 'value' }
        const dataStr = JSON.stringify(data)

        client.encoder(encoder)
        client.transport(transport)

        await transport.handleMessage!(dataStr)

        sinon.assert.calledOnce(encoder.classify as any)
        sinon.assert.calledWith(encoder.classify as any, sinon.match(data))
      })

      it('created a context from the classifyed and decoded message and routes it', async () => {
        const client = new Client()
        const encoder = encoderFixture({
          decode: async d => JSON.parse(d),
          classify: async () => ({ path: '', status: '' })
        })
        const transport = transportFixture()
        const data = { key: 'value' }
        const dataStr = JSON.stringify(data)
        const handler = sinon.stub()

        client.handle(handler)
        client.encoder(encoder)
        client.transport(transport)

        await transport.handleMessage!(dataStr)

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
    it('throws if there is not transport', async () => {
      const client = new Client()

      await assert.rejects(async () => {
        await client.connect()
      })
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
    it('throws if there is no transport')
    it('throws if not connected')
    it('calls disconnect on the transport')
  })

  describe('#send(path: string, data: any): Promise<void>', () => {
    it('waits if not connected, and sends upon connection')
    it('bundles the data')
    it('encodes the bundled data')
    it('sends the bundled and encoded data using the transport')
  })

  describe('#request(path: string, data?: any, handler: Handler): Promise<void>', () => {
    it('waits if not connected, and sends upon connection')
    it('bundles the data')
    it('encodes the bundled data')
    it('sends the bundled and encoded data using the transport')
    it('calls the handler once the client responds')
    it('times out if the client does not respond in time')
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
