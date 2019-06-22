import { Socket } from './socket'

export class SocketManager {
  private _sockets: { [s: string]: Socket }

  constructor() {
    this._sockets = {}
  }

  public addSocket(socket: Socket): void {
    this._sockets[socket.uuid] = socket
  }

  public async getSocket(uuid: string): Promise<Socket | void> {
    if (this._sockets[uuid]) {
      return this._sockets[uuid]
    }
  }
}
