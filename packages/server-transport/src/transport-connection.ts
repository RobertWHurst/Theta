export interface TransportConnection {
  send(data: any): Promise<void>
  close(): Promise<void>
  handleMessage?: (encodedData: any) => Promise<void>
}
