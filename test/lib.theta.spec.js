import assert from 'assert'
import sinon from 'sinon'
import Theta from '../src/theta'
import Message from '../src/message'

describe('new Theta(config) -> theta', () => {
  it('create create an instance', () => {
    new Theta()
  })

  it('exposes the config', () => {
    const config = 'CONFIG'
    const theta = new Theta(config)
    assert.strictEqual(theta.config, 'CONFIG')
  })

  it('exposes the message prototype', () => {
    const theta = new Theta()
    assert.ok(theta.message instanceof Message)
  })

  describe('theta.classify(classifyFn) -> theta', () => {
    it('saves the classifyFn to the theta instance and executes it correctly', async () => {
      const theta = new Theta()
      const classifyFn = sinon.stub().resolves('PATH')

      theta.classify(classifyFn)
      const path = await theta.classifyFn('DATA')

      assert.strictEqual(path, 'PATH')
      sinon.assert.calledWith(classifyFn, 'DATA')
    })

    it('can capture from an exception and convert it to a rejection', () => {
      const theta = new Theta()
      const classifyFn = () => { throw new Error('ERROR') }

      theta.classify(classifyFn)

      assert.rejects(theta.classifyFn('DATA'))
    })

    it('supports a function with a callback', async () => {
      const theta = new Theta()
      const classifyFn = (data, cb) => cb(null, 'PATH')

      theta.classify(classifyFn)

      const path = await theta.classifyFn('DATA')
      assert.strictEqual(path, 'PATH')
    })
  })
})
