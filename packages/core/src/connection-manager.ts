import Theta from './theta'
import Server from './server'
import Socket from './socket'

export default class ConnectionManager {
  theta: Theta
  server: Server
  _localSockets: Socket[]

  constructor (theta: Theta, server: Server) {
    this.theta = theta
    this.server = server
    this._localSockets = []
  }

  add (socket: Socket) {
    this._localSockets.push(socket)
    socket.on('close', () => { this.removeByUuid(socket.uuid) })
  }

  findByUuid (uuid: string): Socket | undefined {
    return this._localSockets.find(s => s.uuid === uuid)
  }

  removeByUuid (uuid: string) {
    const connectionIndex = this._localSockets.findIndex(s => s.uuid === uuid)
    if (connectionIndex === -1) { return null }
    return this._localSockets.splice(connectionIndex, 1)
  }
}
