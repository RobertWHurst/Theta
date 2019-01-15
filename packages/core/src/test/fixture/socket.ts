import fixture from './fixture'
import theta from './theta'

export default fixture({
  uuid: 'UUID',
  theta: theta(),
  status () {},
  async sendStatus () {},
  async send () {},
  handle () {},
  _router: {}
})
