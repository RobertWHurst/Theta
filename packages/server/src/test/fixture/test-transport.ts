import sinon from 'sinon'
import { Transport } from '@thetaapp/server-transport'
import { fixture } from './fixture'

export const testTransport = fixture(
  () =>
    ({
      listen: sinon.stub().resolves(),
      close: sinon.stub().resolves()
    } as Transport)
)
