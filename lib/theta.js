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
