const mod = require('./lib')
module.exports = mod.default || {}
delete mod.default
Object.assign(module.exports, mod)
