export * from './client'
export * from './config'

import { Client } from './client'
import { Config } from './config'

export const theta = (config?: Config) => new Client(config)
