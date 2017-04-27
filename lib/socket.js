const uuid         = require('uuid/v4');
const Message      = require('./message');
const SocketRouter = require('./socket-router');
const EventEmitter = require('events').EventEmitter;


const noop = () => {};

class Socket extends EventEmitter {

  constructor(theta, server, rawSocket) {
    super();

    this.__proto__ = theta.socket;

    this.theta      = theta;
    this.id         = uuid();
    this._router    = new SocketRouter(this.theta);
    this._server    = server;
    this._rawSocket = rawSocket;

    this._rawSocket.on('message', (d, f) => this._handleRawMesssage(d, f));
  }

  handle(pattern, handlerFn) {
    this._router.handle(pattern, handlerFn);
  }

  send(data, cb = noop) {
    if (typeof data !== 'object') {
      throw new Error('data must be an object or array');
    }
    this.theta.encodeFn(data, (err, encodedData) => {
      if (err) { return cb(err); }
      this._rawSocket.send(encodedData);
      cb(null);
    });
  }

  to(uuid, cb) {
    this._server.connectionManager.findByUuid(uuid, cb);
  }

  clearRouterHandlers() {
    this._router.clearRouterHandlers();
  }

  _handleRawMesssage(data, flags) {
    Message.fromEncodedData(this.theta, this._server, this, data, flags, (err, message) => {
      if (err) { return this.emit(err); }

      this._router.route(message, this, (err) => {
        if (err) { return this.emit('error', err, message); }

        this.emit('message', message);
      });
    });
  }
}


module.exports = Socket;
