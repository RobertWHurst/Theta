import { Context } from './context'

export type Handler<C extends Context> = (ctx: C) => Promise<void> | void
