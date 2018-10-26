const uuid               = require('uuid/v4');
const Message            = require('./message');
const SocketRouter       = require('./socket-router');
const RemoteSocketRouter = require('./remote-socket-router');
const EventEmitter       = require('events').EventEmitter;


const noop = () => {};

class Socket extends EventEmitter {

  constructor(theta, server, rawSocket) {
    super();

    this.__proto__ = theta.socket;

    this.theta         = theta;
    this.uuid          = uuid();
    this._remoteRouter = null;
    this._router       = new SocketRouter(this.theta);
    this._server       = server;
    this._rawSocket    = rawSocket;

    this._rawSocket.on('message', (...args) => this._handleRawMessage(...args));
    this.on('error', () => this.clearHandlers());
  }

  handle(pattern, handlerFn) {
    this._router.handle(pattern, handlerFn);
  }

  send(data, cb = noop) {
    // ensures that handlers are always registered before the message is sent
    process.nextTick(() => {
      if (typeof data !== 'object') {
        throw new Error('data must be an object or array');
      }
      this.theta.encodeFn(data, (err, encodedData) => {
        if (err) { return cb(err); }
        this._rawSocket.send(encodedData);
        cb(null);
      });
    });
  }

  to(uuid) {
    return this._server.connectionManager.findByUuid(uuid);
  }

  clearHandlers() {
    this._router.clearHandlers();
  }

  addRemoteRouter(remoteRouter) {
    this._remoteRouter = remoteRouter;
  }

  _handleRawMessage(data, flags) {
    Message.fromEncodedData(this.theta, this._server, data, flags, (err, message) => {
      if (err) { return this.emit('error', err); }

      const next = () => {
        this._router.route(message, this, (err) => {
          if (err) { return this.emit('error', err, message); }

          this.emit('message', message);
        });
      };

      if (this._remoteRouter) {
        return this._remoteRouter.route(message, this, (err) => {
          this._remoteRouter = null;
          if (err) { return this.emit('error', err, message); }
          next();
        });
      }

      next();
    });
  }
}


module.exports = Socket;
