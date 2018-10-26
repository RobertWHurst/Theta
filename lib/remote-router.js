const Router = require('./router');


class RemoteRouter extends Router {
  constructor(theta, connectionManager) {
    super(theta);
    this._connectionManager = connectionManager;
  }

  handle() {
    throw new Error(
      'Cannot bind handlers on RemoteRouter. Handlers are set by the remote theta node'
    );
  }

  route(message, socket, cb) {
    this._connectionManager.routeRemote(message, socket.uuid, cb);
  }

  routeErr() {
    throw new Error(
      'Cannot route errors on RemoteRouter. Errors are handled by the remote theta node'
    );
  }
}


module.exports = RemoteRouter;
