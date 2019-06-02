export interface Socket {
  $$send (status: string, rawPath: string, data?: any): Promise<void>
}
