import sinon from 'sinon'
import theta from '@theta/core'
import ThetaClient from '../theta-client'

describe('ThetaClient()', () => {

  it('can be constructed', () => {
    /* tslint:disable-next-line no-unused-expression */
    new ThetaClient()
  })

  describe('#connect(url)', () => {

    it('connects to theta', async () => {
      const app = theta()
      const onConnection = sinon.stub()
      app.server._socketServer.on('connection', onConnection)
      app.listen(29849)

      const client = new ThetaClient()
      await client.connect('ws://localhost:29849')

      sinon.assert.calledOnce(onConnection)
    })
  })
})
