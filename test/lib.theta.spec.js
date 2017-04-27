const assert = require('assert');
const sinon  = require('sinon');
const Theta  = require('../lib/theta');


describe.skip('new Theta(opts) -> theta', () => {


  describe('theta.classify(classifyFn(socket, cb(err, path))) -> theta', () => {

    it('saves the classifyFn to the theta instance', () => {
      const theta      = new Theta();
      const classifyFn = () => {};
      theta.classify(classifyFn);
      assert.equal(theta.classifyFn, classifyFn);
    });
  });


  describe('theta.encode(encodeFn(data, cb(err, encodedData))) -> theta', () => {

    it('saves the encodeFn to the theta instance', () => {
      const theta    = new Theta();
      const encodeFn = () => {};
      theta.encode(encodeFn);
      assert.equal(theta.encodeFn, encodeFn);
    });
  });


  describe('theta.decode(decodeFn(encodedData, cb(err, data))) -> theta', () => {

    it('saves the decodeFn to the theta instance', () => {
      const theta    = new Theta();
      const decodeFn = () => {};
      theta.decode(decodeFn);
      assert.equal(theta.decodeFn, decodeFn);
    });
  });


  describe('theta.handle([pathPattern], handlerFn(socket, next)) -> theta', () => {

    it('calls router.handle passing the arguments', () => {
      const theta     = new Theta();
      const handlerFn = () => {};
      theta.handle('test.pattern', handlerFn);
      sinon.stub(theta.router, 'handle');
      sinon.assert.calledOnce(theta.router.handle);
      sinon.assert.calledWith(theta.router.handle, 'test.pattern', handlerFn);
    });
  });
});
