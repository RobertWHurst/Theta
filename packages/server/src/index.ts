import { Server } from './server'

export * from './config'
export * from './server'
export * from './socket-manager'
export * from './socket'

export const theta = <T>(config?: T): Server => new Server(config)
