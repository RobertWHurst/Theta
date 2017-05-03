const http              = require('http');
const https             = require('https');
const WebSocketServer   = require('ws').Server;
const ConnectionManager = require('./connection-manager');
const Socket            = require('./socket');
const Message           = require('./message');


class Server {

  constructor(theta) {
    this.theta             = theta;
    this.router            = theta.router;
    this.connectionManager = new ConnectionManager(theta, this);
    this._httpServer       = null;
    this._socketServer     = null;

    this._setupHttpServer();
    this._setupSocketServer();
  }

  listen(...args) {
    this._httpServer.listen(...args);
  }

  close(...args) {
    this._httpServer.close(...args);
  }

  _setupHttpServer() {
    if (this.theta.config.server) {
      this._httpServer = this.theta.config.server;
      return;
    }
    if (this.theta.config.ssl) {
      this._httpServer = https.createServer(this.theta.config.ssl);
      return;
    }
    this._httpServer = http.createServer();
  }

  _setupSocketServer() {
    this._socketServer = new WebSocketServer({
      backlog        : this.theta.config.backlog,
      handleProtocols: this.theta.config.handleProtocols,
      path           : this.theta.config.path,
      clientTracking : this.theta.config.clientTracking,
      maxPayload     : this.theta.config.maxPayload,
      server         : this._httpServer,
    });

    this._socketServer.on('connection', rawSocket => this._handleConnection(rawSocket));
  }

  _handleConnection(rawSocket) {
    const socket = new Socket(this.theta, this, rawSocket);
    this.connectionManager.add(socket);

    socket.on('message', (message) => {
      this.router.route(message, socket, (err) => {
        if (err) { throw err; }
      });
    });
    socket.on('error', (err, message) => {
      socket.clearRouterHandlers();
      message || (message = new Message(this.theta, this));
      this.router.routeErr(err, message, socket, () => {
        socket.send({ error: err.message || err.toString() });
      });
    });
  }
}


module.exports = Server;
