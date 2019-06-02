import { Transport } from '@thetaapp/client-transport'
import { Config } from './config'

export class WebSocketTransport implements Transport {
  public handleMessage?: (encodedData: any) => void
  private _pendingMessages: any[]
  private _isOpen: boolean
  private _config: Config
  private _socket?: WebSocket

  constructor (config: Config) {
    this._pendingMessages = []
    this._isOpen = false
    this._config = config
  }

  public async connect (): Promise<void> {
    this._socket = new WebSocket(this._config.url)
    this._socket.onmessage = (e) => { this.handleMessage!(e.data) }
    this._socket.onopen = () => { this._handleOpen() }
    this._socket.onclose = (e) => { this._handleClose(e) }
  }

  public async disconnect (): Promise<void> {
    this._socket!.close()
  }

  public async send (encodedData: any): Promise<void> {
    if (!this._isOpen) {
      this._pendingMessages.push(encodedData)
      return
    }
    this._socket!.send(encodedData)
  }

  private _handleOpen (): void {
    this._isOpen = true
    for (const pendingMessage of this._pendingMessages) {
      this.send(pendingMessage)
    }
    this._pendingMessages.length = 0
  }

  private _handleClose (e: CloseEvent): void {
    this._isOpen = false
    if (e.code === 1000) { return }
    throw new Error(`WebSocket closed: ${e.reason}`)
  }
}
