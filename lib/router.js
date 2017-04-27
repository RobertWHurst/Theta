const async = require('async');


class Router {

  constructor(theta) {
    this.theta          = theta;
    this._handlers      = [];
    this._errorHandlers = [];
  }

  handle(pattern, fn) {
    if (pattern && !fn) {
      fn      = pattern;
      pattern = '';
    }
    if (fn.length > 3) {
      this._errorHandlers.push({ pattern, fn });
      return;
    }
    this._handlers.push({ pattern, fn });
  }

  route(message, socket, cb) {
    if (this._handlers.length < 1) { return cb(); }
    async.eachSeries(this._handlers, (handler, next) => {
      if (handler.pattern && message.path.slice(0, handler.pattern.length) !== handler.pattern) {
        return next(null);
      }
      this._executeHandlerFn(handler, message, socket, () => {
        next();
      });
    }, (err) => {
      if (err) { return this.routeErr(err, message, socket, cb); }
      cb();
    });
  }

  routeErr(err, message, socket, cb) {
    if (this._errorHandlers.length < 1) { return cb(); }
    async.eachSeries(this._errorHandlers, (errorHandler, next) => {
      this._executeHandlerFn(errorHandler, err, message, socket, next);
    }, cb);
  }

  _executeHandlerFn(handler, ...args) {
    const next = args.pop();
    try {
      handler.fn(...args, next);
    } catch (err) { next(err); }
  }
}


module.exports = Router;
