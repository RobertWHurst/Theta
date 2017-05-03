

class Message {

  static fromEncodedData(theta, server, encodedData, flags, cb) {
    const message = new this(theta, server, encodedData);
    message.fromEncodedData(encodedData, flags, cb);
  }

  constructor(theta, server) {
    this.__proto__ = theta.message;

    this.data    = null;
    this.path    = null;
    this._theta  = theta;
    this._server = server;
  }

  fromEncodedData(encodedData, flags, cb) {
    this._theta.decodeFn(encodedData, flags, (err, data) => {
      if (err) { return cb(err); }
      this.data = data;
      this._theta.classifyFn(this, (err, path) => {
        this.path = path;
        cb(null, this);
      });
    });
  }

  toEncodedData(cb) {
    // TODO: Find out if we need to generate a flags object
    this._theta.encodeFn(this.data, (err, encodedData) => {
      if (err) { return cb(err); }
      cb(null, encodedData);
    });
  }
}


module.exports = Message;
