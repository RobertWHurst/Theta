import assert from 'assert'
import sinon from 'sinon'
import Theta from '../theta'
import Message from '../message'

describe('new Theta(config) -> theta', () => {
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

  describe('theta.classify(classifier) -> theta', () => {
    it('saves the classifier to the theta instance and executes it correctly', async () => {
      const theta = new Theta()
      const classifier = sinon.stub().resolves('PATH')

      theta.classify(classifier)
      const path = await (theta.classifier as Function)('DATA')

      assert.strictEqual(path, 'PATH')
      sinon.assert.calledWith(classifier, 'DATA')
    })
  })
})
