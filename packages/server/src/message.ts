export class Message {
  public path: string
  public status: string
  public data: any
  constructor (path: string, status: string, data: any) {
    this.path = path
    this.status = status
    this.data = data
  }
}
