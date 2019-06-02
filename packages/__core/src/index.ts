import { Theta, Config } from './theta'

export * from './connection-manager'
export * from './context'
export * from './handler-chain'
export * from './message'
export * from './pattern'
export * from './router'
export * from './server'
export * from './socket-router'
export * from './socket'
export * from './theta'

export default (config?: Config) => new Theta(config)
