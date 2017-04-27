const Theta             = require('./lib/theta');
const ConnectionManager = require('./lib/connection-manager');
const Message           = require('./lib/message');
const Router            = require('./lib/router');
const Server            = require('./lib/server');
const SocketRouter      = require('./lib/socket-router');
const Socket            = require('./lib/socket');


exports = module.exports = (...args) => new Theta(...args);
exports.Theta             = Theta;
exports.ConnectionManager = ConnectionManager;
exports.Message           = Message;
exports.Router            = Router;
exports.Server            = Server;
exports.SocketRouter      = SocketRouter;
exports.Socket            = Socket;
