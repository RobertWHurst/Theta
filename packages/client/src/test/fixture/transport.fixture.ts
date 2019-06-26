import sinon, { SinonStub } from 'sinon'
import { Transport } from '../../'
import { fixture } from './fixture'

export const transportFixture = fixture<Transport>(() => ({
  send: sinon.stub().resolves() as SinonStub<[any]>,
  connect: sinon.stub().resolves(),
  disconnect: sinon.stub().resolves()
}))
