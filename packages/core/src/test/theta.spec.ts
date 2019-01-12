import { strict as assert } from 'assert'
import sinon from 'sinon'
import Theta, {
  defaultClassifier,
  defaultDecoder,
  defaultEncoder,
  defaultResponder
} from '../theta'
import Message from '../message'

describe('new Theta(config: Config)', () => {

  it('create create an instance', () => {
    /* tslint:disable-next-line:no-unused-expression */
    new Theta()
  })

  it('exposes the config', () => {
    const config = {}
    const theta = new Theta(config)
    assert.equal(theta.config, config)
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

      assert.equal(theta.classifier, 'CLASSIFIER')
    })
  })

  describe('#respond(responder: Responder) -> this', () => {

    it('saves the responder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const responder = 'RESPONDER' as any

      theta.respond(responder)

      assert.equal(theta.responder, 'RESPONDER')
    })
  })

  describe('#encode(encoder: Encoder) -> this', () => {

    it('saves the encoder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const encoder = 'ENCODER' as any

      theta.encode(encoder)

      assert.equal(theta.encoder, 'ENCODER')
    })
  })

  describe('#decode(decoder: Decoder) -> this', () => {

    it('saves the decoder to the theta instance and executes it correctly', () => {
      const theta = new Theta()
      const decoder = 'DECODER' as any

      theta.decode(decoder)

      assert.equal(theta.decoder, 'DECODER')
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

      assert.equal(theta.listen('A1', 'A2', 'A3'), theta)

      sinon.assert.calledOnce(listen)
      sinon.assert.calledWith(listen, 'A1', 'A2', 'A3')
    })
  })

  describe('#close(...args: any[]): this', () => {

    it('calls close on theta\'s server instance then returns theta', () => {
      const theta = new Theta()
      const close = sinon.stub(theta.server, 'close')

      assert.equal(theta.close('A1', 'A2', 'A3'), theta)

      sinon.assert.calledOnce(close)
      sinon.assert.calledWith(close, 'A1', 'A2', 'A3')
    })
  })
})

describe('defaultClassifier(data: any) => Promise<string>', () => {

  it('takes an object with a path property and resolves it\'s value', async () => {
    assert.equal((await defaultClassifier({ path: 'PATH' })), 'PATH')
  })

  it('resolves an empty string if no path property is set', async () => {
    assert.equal((await defaultClassifier({})), '')
  })
})

describe('defaultDecoder(encodedData: any) => Promise<any>', () => {

  it('takes a JSON string, parses it, and resolves the parsed object', async () => {
    assert.deepEqual((await defaultDecoder('{"path":"PATH"}')), { path: 'PATH' })
  })

  it('if a non JSON string is provided it resolves an empty object', async () => {
    assert.deepEqual((await defaultDecoder(Buffer.allocUnsafe(0))), {})
  })
})

describe('defaultEncoder(data: any) => Promise<any>', () => {

  it('takes an object, encodes it as JSON, and resolves it', async () => {
    assert.equal((await defaultEncoder({ key: 'val' })), '{"key":"val"}')
  })
})

describe('defaultResponder(status: string, data?: any, err?: Error) => Promise<any>', () => {

  it('takes a status and object, adds the status to the object and resolves it', async () => {
    const res = await defaultResponder('ok', { key: 'val' })
    assert.deepEqual(res, { status: 'ok', key: 'val' })
  })

  it('excludes status and the object contents if given an error', async () => {
    const error = new Error('Test error')
    const res = await defaultResponder('ok', { key: 'val' }, error)
    assert.deepEqual(res, { error })
  })

  it('will add data as a property if it is not an object', async () => {
    const res = await defaultResponder('ok', 'DATA')
    assert.deepEqual(res, { status: 'ok', data: 'DATA' })
  })

  it('can resolve an object with only the status given', async () => {
    const res = await defaultResponder('ok')
    assert.deepEqual(res, { status: 'ok' })
  })
})
