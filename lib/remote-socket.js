const SocketRouter = require('./socket-router');
const EventEmitter = require('events').EventEmitter;


const noop = () => {};

class Socket extends EventEmitter {

  constructor(theta, server, uuid) {
    super();

    this.__proto__ = theta.socket;

    this.theta              = theta;
    this.uuid               = uuid;
    this._router            = new SocketRouter(this.theta);
    this._server            = server;

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
      const handlerPatterns = this._router.getHandlerPatterns();
      this._server.connectionManager.send(data, handlerPatterns, this.uuid, cb);
    });
  }

  to(uuid) {
    return this._server.connectionManager.findByUuid(uuid);
  }

  clearHandlers() {
    this._router.clearHandlers();
  }

  route(message) {
    this._router.route(message, this, (err) => {
      this._server.connectionManager.overloadRoute(this.uuid, err);
    });
  }
}


module.exports = Socket;
