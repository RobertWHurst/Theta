import { Params, Pattern } from '@thetaapp/pattern'

export class Message {
  public rawPath: string
  public channel?: string
  public sourceChannel?: string
  public path?: string
  public status: string
  public params?: Params
  public data: any

  constructor(rawPath: string, status: string, data: any) {
    this.rawPath = rawPath
    this.status = status
    this.data = data
  }

  public $$tryToApplyPattern(pattern: Pattern): boolean {
    const match = pattern.tryMatch(this.rawPath)
    if (!match) {
      return false
    }

    this.channel = match.channel
    this.path = match.path
    this.params = match.params
    return true
  }
}
