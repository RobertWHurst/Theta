import { Server } from "./server"
import { Config } from "./config"

export * from "./config"
export * from "./server"
export * from "./socket-manager"
export * from "./socket"

export const theta = (config?: Config) => new Server(config)
