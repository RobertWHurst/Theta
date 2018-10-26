import { v4String } from 'uuid/interfaces'
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
    socket.on('close', () => this.removeByUuid(socket.uuid))
  }

  findByUuid (uuid: v4String) {
    const localSocket = this._localSockets.find(s => s.uuid === uuid)
    if (localSocket) { return localSocket }
  }

  removeByUuid (uuid: v4String) {
    const connectionIndex = this._localSockets.findIndex(s => s.uuid === uuid)
    if (connectionIndex === -1) { return null }
    return this._localSockets.splice(connectionIndex, 1)
  }
}
