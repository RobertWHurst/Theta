import { Context } from "./context"

export class TimeoutError extends Error {
  constructor(ctx: Context) {
    super(`TimeoutError: ... ${ctx.path}`)
  }
}
