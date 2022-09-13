export interface Encoder {
  encode(bundledData: any): Promise<any>
  decode(encodedData: any): Promise<any>
  expand(decodedData: any): Promise<Expanded>
  bundle(status: string, path: string, data: any): Promise<any>
}

export interface Expanded {
  status: string
  path: string
  data: any
}

export const defaultEncoder: Encoder = {
  encode: async (bundledData: any) => JSON.stringify(bundledData),
  decode: async (encodedData: any) => JSON.parse(encodedData),
  expand: async (decodedData: any) => {
    let path = ''
    let status = ''
    let data = ''
    if (decodedData && typeof decodedData === 'object') {
      path = decodedData.path
      status = decodedData.status
      data = decodedData.data
    }
    return { path, status, data }
  },
  bundle: async (status: string, path: string, data: any) => ({
    status,
    path,
    data
  })
}
