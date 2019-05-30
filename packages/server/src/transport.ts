import { TransportConnection } from './transport-connection'

export interface Transport {
  listen (): Promise<void>
  close (): Promise<void>
  handleConnection: (connection: TransportConnection) => void
  handleError: (err: Error) => void
  handleClose: () => void
}
