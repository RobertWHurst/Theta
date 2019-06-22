export interface Encoder {
  encode(data: any): Promise<any>
  decode(data: any): Promise<any>
  classify(data: any): Promise<Classification>
  bundle(status: string, path: string, data: any): Promise<any>
}

export interface Classification {
  status: string
  path: string
}

export const defaultEncoder: Encoder = {
  encode: async (data: any) => JSON.stringify(data),
  decode: async (encodedData: any) => JSON.parse(encodedData),
  classify: async (data: any) => {
    let path = ''
    let status = ''
    if (data && typeof data === 'object') {
      path = data.path
      status = data.status
    }
    return { path, status }
  },
  bundle: async (status: string, path: string, data: any) => ({
    status,
    path,
    data
  })
}
