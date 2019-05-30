export interface Encoder {
  encode (data: any): Promise<any>
  decode (data: any): Promise<any>
  classify (data: object): Promise<Classification>
  bundle (status: string, path: string, data: any): any
}

export interface Classification {
  status: string,
  path: string
}
