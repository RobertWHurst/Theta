import { Config } from './config'
import { WebSocketTransport } from './web-socket-transport'
export { Config, WebSocketTransport }
export const webSocketTransport = (config: Config) => new WebSocketTransport(config)
