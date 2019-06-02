import assert from 'assert'
import sinon from 'sinon'
import {
  Theta,
  defaultClassifier,
  defaultDecoder,
  defaultEncoder,
  defaultFormatter
} from '../theta'
import { Message } from '../message'

describe('new Theta(config: Config)', () => {

  it('create create an instance', () => {
    /* tslint:disable-next-line:no-unused-expression */
    new Theta()
  })

  it('exposes the config', () => {
    const config = {}
    const theta = new Theta(config)
    assert.strictEqual(theta.config, config)
  })

  it('exposes the message prototype', () => {
    const theta = new Theta()
    assert.ok(theta.message instanceof Message)
  })

  describe('#plugin(plugin: Plugin, opts?: any) -> this', () => {

    it('executes the plugin on theta with options passed', async () => {
      const theta = new Theta()
      const plugin = sinon.stub()
      const options = 'OPTIONS' as any

      theta.plugin(plugin, options)

      sinon.assert.calledOnce(plugin)
      sinon.assert.calledWith(plugin, theta, options)
    })
  })

  describe('#classify(classifier: Classifier) -> this', () => {

    it('saves the classifier to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const classifier = 'CLASSIFIER' as any

      theta.classify(classifier)

      assert.strictEqual(theta.classifier, 'CLASSIFIER')
    })
  })

  describe('#respond(responder: Responder) -> this', () => {

    it('saves the responder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const responder = 'RESPONDER' as any

      theta.format(responder)

      assert.strictEqual(theta.formatter, 'RESPONDER')
    })
  })

  describe('#encode(encoder: Encoder) -> this', () => {

    it('saves the encoder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const encoder = 'ENCODER' as any

      theta.encode(encoder)

      assert.strictEqual(theta.encoder, 'ENCODER')
    })
  })

  describe('#decode(decoder: Decoder) -> this', () => {

    it('saves the decoder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const decoder = 'DECODER' as any

      theta.decode(decoder)

      assert.strictEqual(theta.decoder, 'DECODER')
    })
  })

  describe('#handle(handler: Handler) -> this', () => {

    it('calls it\'s router\'s handle method passing it the handler', () => {
      const theta = new Theta()
      const handle = sinon.stub(theta.router, 'handle')
      const handler = 'HANDLER' as any

      theta.handle(handler)

      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, handler)
    })

    it('calls it\'s router\'s handle method passing it the pattern and handler', () => {
      const theta = new Theta()
      const handle = sinon.stub(theta.router, 'handle')
      const pattern = 'PATTERN' as any
      const handler = 'HANDLER' as any

      theta.handle(pattern, handler)

      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, pattern, handler)
    })
  })

  describe('#handleError(handler: Handler) -> this', () => {

    it('calls it\'s router\'s handleError method passing it the handler', () => {
      const theta = new Theta()
      const handle = sinon.stub(theta.router, 'handleError')
      const handler = 'HANDLER' as any

      theta.handleError(handler)

      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, handler)
    })

    it('calls it\'s router\'s handleError method passing it the pattern and handler', () => {
      const theta = new Theta()
      const handle = sinon.stub(theta.router, 'handleError')
      const pattern = 'PATTERN' as any
      const handler = 'HANDLER' as any

      theta.handleError(pattern, handler)

      sinon.assert.calledOnce(handle)
      sinon.assert.calledWith(handle, pattern, handler)
    })
  })

  describe('#listen(...args: any[]): this', () => {

    it('calls listen on theta\'s server instance then returns theta', () => {
      const theta = new Theta()
      const listen = sinon.stub(theta.server, 'listen')

      assert.strictEqual(theta.listen('A1', 'A2', 'A3'), theta)

      sinon.assert.calledOnce(listen)
      sinon.assert.calledWith(listen, 'A1', 'A2', 'A3')
    })
  })

  describe('#close(...args: any[]): this', () => {

    it('calls close on theta\'s server instance then returns theta', () => {
      const theta = new Theta()
      const close = sinon.stub(theta.server, 'close')

      assert.strictEqual(theta.close('A1', 'A2', 'A3'), theta)

      sinon.assert.calledOnce(close)
      sinon.assert.calledWith(close, 'A1', 'A2', 'A3')
    })
  })
})

describe('defaultClassifier(data: any) => Promise<string>', () => {

  it('takes an object with a path property and resolves it\'s value', async () => {
    assert.strictEqual((await defaultClassifier({ path: 'PATH' })), 'PATH')
  })

  it('resolves an empty string if no path property is set', async () => {
    assert.strictEqual((await defaultClassifier({})), '')
  })
})

describe('defaultDecoder(encodedData: any) => Promise<any>', () => {

  it('takes a JSON string, parses it, and resolves the parsed object', async () => {
    assert.deepStrictEqual((await defaultDecoder('{"path":"PATH"}')), { path: 'PATH' })
  })

  it('if a non JSON string is provided it resolves an empty object', async () => {
    assert.deepStrictEqual((await defaultDecoder(Buffer.allocUnsafe(0))), {})
  })
})

describe('defaultEncoder(data: any) => Promise<any>', () => {

  it('takes an object, encodes it as JSON, and resolves it', async () => {
    assert.strictEqual((await defaultEncoder({ key: 'val' })), '{"key":"val"}')
  })
})

describe('defaultResponder(status: string, data?: any, err?: Error) => Promise<any>', () => {

  it('takes a status, path, and object, adds the status to the object and resolves it', async () => {
    const res = await defaultFormatter('ok', 'ns', { key: 'val' })
    assert.deepStrictEqual(res, { status: 'ok', channel: 'ns', key: 'val' })
  })

  it('will add data as a property if it is not an object', async () => {
    const res = await defaultFormatter('ok', 'ns', 'DATA')
    assert.deepStrictEqual(res, { status: 'ok', channel: 'ns', data: 'DATA' })
  })

  it('can resolve an object with only the status and path given', async () => {
    const res = await defaultFormatter('ok', 'ns')
    assert.deepStrictEqual(res, { status: 'ok', channel: 'ns' })
  })
})
