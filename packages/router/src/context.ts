import { Pattern, Params } from '@thetaapp/pattern'

export interface Context {
  next?: (err: Error) => Promise<void>,
  params?: Params,
  path?: string,
  $$error?: Error,
  $$handled?: boolean,
  $$timeout?: number,
  $$tryToApplyPattern (pattern: Pattern): boolean
}
