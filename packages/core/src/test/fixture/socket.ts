import fixture, { Fixture } from './fixture'
import theta from './theta'

export default fixture({
  theta: theta(),
  uuid: 'UUID',
  status () {},
  async sendStatus () {},
  async send () {},
  handle () {},
  channel (): Fixture { return this as Fixture }
})
