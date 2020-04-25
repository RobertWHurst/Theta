import { Transport } from '@thetaapp/client-transport'
import { Config } from './config'

export class WebSocketTransport implements Transport {
  public handleMessage?: (encodedData: any) => Promise<void>
  private _pendingMessages: any[]
  private _isOpen: boolean
  private readonly _config: Config
  private _socket?: WebSocket

  constructor (config: Config) {
    this._pendingMessages = []
    this._isOpen = false
    this._config = config
  }

  public async connect (): Promise<void> {
    this._socket = new WebSocket(this._config.url)
    this._socket.onmessage = e => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      void this.handleMessage!(e.data)
    }
    this._socket.onopen = () => {
      this._handleOpen()
    }
    this._socket.onclose = e => {
      this._handleClose(e)
    }
  }

  public async disconnect (): Promise<void> {
    if (!this._socket) { throw new Error('Missing socket') }
    this._socket.close()
  }

  public async send (encodedData: any): Promise<void> {
    if (!this._isOpen) {
      this._pendingMessages.push(encodedData)
      return
    }
    if (!this._socket) { throw new Error('Missing socket') }
    this._socket.send(encodedData)
  }

  private _handleOpen (): void {
    this._isOpen = true
    for (const pendingMessage of this._pendingMessages) {
      void this.send(pendingMessage)
    }
    this._pendingMessages.length = 0
  }

  private _handleClose (e: CloseEvent): void {
    this._isOpen = false
    if (e.code === 1000) {
      return
    }
    throw new Error(`WebSocket closed: ${e.reason ? e.reason as string : 'Reason unknown'}`)
  }
}
