import Message from './message'
import Socket from './socket'
import Theta from './theta'

type NextHandler = () => Promise<void>

export default class Context {
  message: Message
  socket: Socket
  theta?: Theta
  error?: Error
  _nextHandler?: NextHandler

  constructor (message: Message, socket: Socket) {
    this.message = message
    this.socket = socket
  }

  async send (data: any): Promise<void> {
    await this.socket.send(data)
  }

  async next () {
    if (!this._nextHandler) { return }
    await this._nextHandler()
  }

  setNextHandler (nextHandler: NextHandler) {
    this._nextHandler = nextHandler
  }
}
