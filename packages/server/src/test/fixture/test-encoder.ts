import sinon from 'sinon'
import { Encoder } from '@thetaapp/encoder'
import { fixture } from './fixture'

export const testEncoder = fixture({
  encode: sinon.spy(async (d: any) => d),
  decode: sinon.spy(async (d: any) => d),
  classify: sinon.spy(async (_: object) => ({ status: 'ok', path: 'path' })),
  bundle: sinon.spy(async (status: string, path: string, data: any) => ({
    status,
    path,
    data
  }))
} as Encoder)
