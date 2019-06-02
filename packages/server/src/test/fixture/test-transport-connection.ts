import sinon from 'sinon'
import { TransportConnection } from '@thetaapp/server-transport'
import { fixture } from './fixture'

export const testTransportConnection = fixture(() => ({
  send: sinon.stub(),
  close: sinon.stub()
} as TransportConnection))
