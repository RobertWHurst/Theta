const uuid         = require('uuid/v4');
const btree        = require('btreejs');
const Skiff        = require('skiff');
const memdown      = require('memdown');
const RemoteSocket = require('./remote-socket');

// TODO: Extend this with raft
class ConnectionManager {

  constructor(theta, server) {
    this.theta          = theta;
    this.server         = server;
    this.uuid           = uuid();
    this._localSockets  = btree.create(2, btree.strcmp);
    this._remoteSockets = btree.create(2, btree.strcmp);
    this._skiffServer   = null;
    this._skiffDb       = null;

    this._setupSkiffServer();
  }

  listen(cb) {
    if (!this._skiffServer) { return cb(); }
    this._skiffServer.start(cb);
  }

  close(cb) {
    if (!this._skiffServer) { return cb(); }
    this._skiffServer.stop(cb);
  }

  add(socket) {
    this._localSockets.put(socket.uuid, socket, true);
    this._addSocketToSkiff(socket);
    socket.on('close', () => this.removeByUuid(socket.uuid));
  }

  findByUuid(uuid) {
    return this._localSockets.get(uuid) || this._remoteSockets.get(uuid);
  }

  removeByUuid(uuid) {
    this._localSockets.del(uuid);
    this._removeSocketFromSkiff(uuid);
  }

  send(data, handlerPatterns, uuid, cb) {
    this._skiffDb.put(`${this.uuid}/send/${uuid}`, { data, handlerPatterns }, cb);
  }

  route() {
    this._localSockets
  }

  routeRemote(message, uuid, cb) {
    const { data, path } = message;
    this._skiffDb.put(`${this.uuid}/route/${uuid}`, { data, path }, cb);
  }

  overloadRoute(uuid, err, cb) {
    this._skiffDb.put(`${this.uuid}/overload-route/${uuid}`, { err }, cb);
  }

  _urlToSkiffAddress(url) {
    const { hostname = 'localhost', port = 3649 } = new URL(url);
    return `/ip/${hostname}/tcp/${port}`;
  }

  _setupSkiffServer() {
    if (!this.theta.config.peerUrls || this.theta.config.peerUrls.length < 1) { return; }

    const address = this._urlToSkiffAddress(this.theta.config.url);
    this._skiffServer = new Skiff(address, {
      db   : memdown,
      peers: this.theta.config.peerUrls.map(u => this._urlToSkiffAddress(u)),
    });
    this._skiffDb = this._skiffServer.levelup();

    this._skiffServer.on('put', (...args) => this._handleSkiffPut(...args));
    this._skiffServer.on('del', (...args) => this._handleSkiffDel(...args));
  }

  _addSocketToSkiff(socket, cb) {
    if (!this._skiffDb) { return cb(); }
    this._skiffDb.put(`${this.uuid}/announce/${socket.uuid}`, Date.now(), cb);
  }

  _removeSocketFromSkiff(uuid, cb) {
    if (!this._skiffDb) { return cb(); }
    this._skiffDb.del(`${this.uuid}/announce/${uuid}`, cb);
  }

  _handleSkiffPut(key, doc) {
    const [connectionManagerUuid, operation, socketUuid] = key.split('/');
    if (connectionManagerUuid === this.uuid) { return; }

    switch (operation) {
    case 'announce': return this._createRemoteSocket(socketUuid);
    // case 'send': return this._sendSocketMessage(socketUuid, value, key);
    case 'route': return this.route(socketUuid, doc, key);
    // no default
    }
  }

  _handleSkiffDelete(key) {
    const [connectionManagerUuid, operation, socketUuid] = key.split('/');
    if (connectionManagerUuid === this.uuid || operation !== 'announce') { return; }
    this._remoteSockets.del(socketUuid);
  }

  _createRemoteSocket(socketUuid) {
    const remoteSocket = new RemoteSocket(this.theta, this.server, this._skiffDb, socketUuid);
    this._remoteSockets.put(socketUuid, remoteSocket);
  }

  _routeSocketMessage
}


module.exports = ConnectionManager;
