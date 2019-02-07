export * from './context'
export * from './message'
export * from './theta-client'
import { ThetaClient } from './theta-client'
export default (): ThetaClient => new ThetaClient()
