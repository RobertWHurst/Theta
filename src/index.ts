import Theta from './theta'
export { default as ConnectionManager } from './connection-manager'
export { default as Message } from './message'
export { default as Router } from './router'
export { default as Server } from './server'
export { default as SocketRouter } from './socket-router'
export { default as Socket } from './socket'

export { Theta }
export default config => new Theta(config)
