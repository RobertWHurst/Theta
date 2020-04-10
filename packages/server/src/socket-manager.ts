import { Socket } from './socket'

export class SocketManager {
  private readonly _sockets: Map<string, Socket>

  constructor () {
    this._sockets = new Map()
  }

  public addSocket (socket: Socket): void {
    this._sockets.set(socket.uuid, socket)
  }

  public async getSocket (uuid: string): Promise<Socket | void> {
    return this._sockets.get(uuid)
  }
}
