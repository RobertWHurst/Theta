import { Config } from './config'
import { WebSocketTransport } from './web-socket-transport'
export { WebSocketTransport }
export const webSocketTransport = (opts: Config) => new WebSocketTransport(opts)
