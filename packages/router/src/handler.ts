import { Context } from './context'

export type Handler = (ctx: Context) => Promise<void> | void
