export { Config } from './config'
export { SocketManager } from './socket-manager'
export { Socket } from './socket'

import { Server } from './server'
export { Server }
export const theta = <T>(config?: T) => new Server(config)
