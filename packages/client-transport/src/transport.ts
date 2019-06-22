export interface Transport {
  send(data: any): Promise<void>
  connect(): Promise<void>
  disconnect(): Promise<void>
  handleMessage?: (encodedData: any) => void
  handleError?: (err: Error) => void
  handleClose?: () => void
}
