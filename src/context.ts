import Message from './message'
import Socket from './socket'

export default class Context {
  message: Message
  socket: Socket
  halt: boolean
  error?: Error

  constructor(message: Message, socket: Socket) {
    this.message = message
    this.socket = socket
    this.halt = false
  }

  async send(data: any): Promise<void> {
    await this.socket.send(data)
  }

  next() {
    this.halt = false
  }
}
