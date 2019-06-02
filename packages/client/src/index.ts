import { Config } from './config'
import { Client } from './client'
export { Config, Client }
export const theta = (config?: Config) => new Client(config)
