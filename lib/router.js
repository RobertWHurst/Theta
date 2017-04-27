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

    let router;
    if (typeof fn.handle === 'function') {
      router = fn;
      fn     = null;
    }

    const handler = {};
    pattern && (handler.pattern = pattern);
    fn      && (handler.fn      = fn);
    router  && (handler.router  = router);

    if (!router && fn.length > 3) {
      this._errorHandlers.push(handler);
      return;
    }
    this._handlers.push(handler);
  }

  route(message, socket, cb) {
    if (this._handlers.length < 1) { return cb(); }
    async.eachSeries(this._handlers, (handler, next) => {
      if (handler.pattern && !this._pathMatchesPattern(message.path, handler.pattern)) {
        return next(null);
      }
      if (handler.router) {
        return handler.router.route(message, socket, next);
      }
      try {
        handler.fn(message, socket, next);
      } catch (err) { next(err); }
    }, (err) => {
      if (err) { return this.routeErr(err, message, socket, cb); }
      cb();
    });
  }

  routeErr(err, message, socket, cb) {
    if (this._errorHandlers.length < 1) { return cb(); }
    async.eachSeries(this._errorHandlers, (errorHandler, next) => {
      try {
        errorHandler.fn(err, message, socket, next);
      } catch (err) { next(err); }
    }, cb);
  }
}


module.exports = Router;
