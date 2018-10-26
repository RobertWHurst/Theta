const http              = require('http');
const https             = require('https');
const WebSocketServer   = require('ws').Server;
const async             = require('async');
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

  listen(cb) {
    async.parallel([
      (cb) => {
        if (this._httpServer.listening) { return cb(); }
        const { port, hostname } = new URL(this.theta.config.httpUrl);
        this._httpServer.listen(port, hostname, cb);
      },
      cb => this.connectionManager.listen(cb),
    ], cb);
  }

  close(cb) {
    async.parallel([
      cb => this._httpServer.close(cb),
      cb => this.connectionManager.close(cb),
    ], cb);
  }

  _setupHttpServer() {
    if (this.theta.config.httpServer) {
      this._httpServer = this.theta.config.httpServer;
      return;
    }
    if (this.theta.config.httpSsl) {
      this._httpServer = https.createServer(this.theta.config.httpSsl);
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
      message || (message = new Message(this.theta, this));
      this.router.routeErr(err, message, socket, () => {
        socket.send({ error: err.message || err.toString() });
      });
    });
  }
}


module.exports = Server;
