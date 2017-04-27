

// TODO: Extend this with raft and b-tree
class ConnectionManager {

  constructor(theta, server) {
    this.theta         = theta;
    this.server        = server;
    this._localSockets = [];
  }

  add(socket) {
    this._localSockets.push(socket);
    socket.on('close', () => this.removeByUuid(socket.uuid));
  }

  findByUuid(uuid, cb) {
    const localSocket = this._localSockets.find(s => s.uuid === uuid);
    if (localSocket) { return cb(null, localSocket); }
    // TODO: get the socket from skiff
    cb(null, null);
  }

  removeByUuid(uuid) {
    const connectionIndex = this._localSockets.findIndex(s => s.uuid === uuid);
    if (connectionIndex === -1) { return null; }
    return this._localSockets.splice(connectionIndex, 1);
  }
}


module.exports = ConnectionManager;
