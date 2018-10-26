const Router  = require('./router');
const Server  = require('./server');
const Socket  = require('./socket');
const Message = require('./message');


const defaultClassifyFn = (message, cb) => cb(null, message.data.path);
const defaultEncodeFn   = (data, cb) => cb(null, JSON.stringify(data));
const defaultDecodeFn   = (encodedData, flags, cb) => {
  if (flags.binary) { return cb(new Error('binary websockets unsupported')); }
  cb(null, JSON.parse(encodedData));
};

class Theta {

  constructor(config = {}) {
    /**
     * Config contains the following options
     * url:             String     - The url for this theta node
     * peerUrls:        []String   - An array of theta peer node urls
     * httpUrl:         String     - The url to bind the internal http server too
     * httpServer:      HttpServer - A node HTTP or HTTPS Server instance you wish to use instead of the internal one
     * httpSsl:         Object     - SSL options for creating a https server. Ignored if server is set
     * backlog:         Number     - The maximum length of the queue of pending websocket connections
     * handleProtocols: Function   - A function which can be used to handle the WebSocket subprotocols
     * path:            String     - Accept connections on a given http path
     * clientTracking:  Boolean    - Enables/disables client tracking
     * maxPayload:      Number     - The maximum allowed message size in bytes
     */
    this.config     = config;
    this.classifyFn = null;
    this.encodeFn   = null;
    this.decodeFn   = null;

    this.message = Object.create(Message.prototype);
    this.socket  = Object.create(Socket.prototype);

    this.router = new Router(this);
    this.server = new Server(this);

    this.classify(defaultClassifyFn);
    this.encode(defaultEncodeFn);
    this.decode(defaultDecodeFn);
  }

  classify(classifyFn) {
    this.classifyFn = (message, cb) => {
      try {
        classifyFn(message, cb);
      } catch (err) {
        return cb(err);
      }
    };
    return this;
  }

  encode(encodeFn) {
    this.encodeFn = (data, cb) => {
      try {
        encodeFn(data, cb);
      } catch (err) {
        return cb(err);
      }
    };
    return this;
  }

  decode(decodeFn) {
    this.decodeFn = (encodedData, flags, cb) => {
      try {
        decodeFn(encodedData, flags, cb);
      } catch (err) {
        return cb(err);
      }
    };
    return this;
  }

  handle(pathPattern, handlerFn) {
    this.router.handle(pathPattern, handlerFn);
    return this;
  }

  listen(port, hostname, cb) {
    this.server.listen(port, hostname, cb);
    return this;
  }

  close(cb) {
    this.server.close(cb);
    return this;
  }
}


module.exports = Theta;
