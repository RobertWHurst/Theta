import sinon from 'sinon'
import { Encoder } from '../../'
import { fixture } from './fixture'

export const encoderFixture = fixture<Encoder>(() => ({
  encode: sinon.stub().resolves(''),
  decode: sinon.stub().resolves({}),
  classify: sinon.stub().resolves({ path: '', status: '' }),
  bundle: sinon.stub().resolves({ path: '', status: '' })
}))
