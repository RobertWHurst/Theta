import fixture from './fixture'
import { Context } from '../../context'
import { Message } from '../../message'

export default fixture({
  context: Object.create(Context.prototype),
  message: Object.create(Message.prototype),
  config: {},
  async decoder () {},
  async encoder () {},
  async classifier () {},
  async formatter () {}
})
