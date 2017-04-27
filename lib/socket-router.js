const Router = require('./router');


class SocketRouter extends Router {

  constructor(theta, socket) {
    super(theta);
    this.socket = socket;
  }

  handle(pattern, fn) {
    if (pattern && !fn) {
      fn      = pattern;
      pattern = '';
    }
    this._handlers.push({ pattern, fn });
  }

  clearHandlers() {
    this._handlers.length = 0;
  }

  routeErr(err, message, socket, next) {
    next(err);
  }

  _executeHandlerFn(handler, ...args) {
    const cb = args.pop();
    try {
      handler.fn(...args, cb);
    } catch (err) { cb(err); }

    const handlerIndex = this._handlers.indexOf(handler);
    if (handlerIndex > -1) {
      this._handlers.splice(handlerIndex, 1);
    }
  }
}


module.exports = SocketRouter;
