export interface Transport {
  send(data: any): Promise<void>
  connect(): Promise<void>
  disconnect(): Promise<void>
  handleMessage?: (encodedData: any) => Promise<void>
  handleError?: (err: Error) => Promise<void>
  handleClose?: () => Promise<void>
}
