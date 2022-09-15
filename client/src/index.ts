import { Client } from "./client"
import { Config } from "./config"

export * from "./client"
export * from "./config"

export const theta = (config?: Config): Client => new Client(config)
