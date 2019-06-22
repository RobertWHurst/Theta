import { Params, Pattern, createChannelId } from '@thetaapp/pattern'

export class Message {
  public rawPath: string
  public channel: string
  public status: string
  public data: any
  public path?: string
  public params?: Params

  constructor(rawPath: string, status: string, data: any) {
    this.rawPath = rawPath
    this.status = status
    this.data = data
    this.channel = createChannelId()
  }

  public $$tryToApplyPattern(pattern: Pattern): boolean {
    const match = pattern.tryMatch(this.rawPath)
    if (!match) {
      return false
    }

    this.params = match.params
    this.path = match.path
    match.channel && (this.channel = match.channel)
    return true
  }
}
