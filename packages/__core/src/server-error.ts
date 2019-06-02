import { Context } from './context'

export class ServerError extends Error {
  ctx: Context
  status: string

  constructor (ctx: Context, message: string) {
    super()
    this.ctx = ctx
    this.status = ctx.socket.$$currentStatus
    this.message = message
  }

  toJSON (): object {
    return {
      path: this.ctx.path,
      status: this.status,
      message: this.message
    }
  }
}

export class ServerTimeoutError extends ServerError {
  constructor (ctx: Context) {
    super(ctx, `Timeout error for request ${ctx.requestId} at path ${ctx.path}`)
    this.ctx.socket.$$currentStatus = 'timeout'
  }
}
