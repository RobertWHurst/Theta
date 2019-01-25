import fixture from './fixture'
import message from './message'
import socket from './socket'

export default fixture({
  message: message(),
  socket: socket(),
  async send () {},
  async sendStatus () {},
  status () {},
  async next () {
    if (!(this as any).$$nextHandler) { return }
    await (this as any).$$nextHandler()
  },
  $$tryToApplyPattern () {}
})
