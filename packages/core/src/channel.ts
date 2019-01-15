import Socket from './socket'

export default class Channel {
  _socket: Socket

  constructor (socket: Socket) {
    this._socket = socket
  }
}
