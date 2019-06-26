export * from './config'
export * from './server'
export * from './socket-manager'
export * from './socket'

import { Server } from './server'

export const theta = <T>(config?: T) => new Server(config)
