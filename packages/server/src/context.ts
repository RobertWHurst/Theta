import { Socket } from './socket'
import { Message } from './message'
import Pattern from '@thetaapp/pattern'

export class Context {
  public message: Message
  public socket: Socket

  constructor (message: Message, socket: Socket) {
    this.message = message
    this.socket = socket
  }

  public $$tryToApplyPattern (_: Pattern): boolean {
    return true
  }
}
