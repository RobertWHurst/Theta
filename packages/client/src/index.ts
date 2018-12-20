import ThetaClient from './theta-client'
export { ThetaClient }
export default (url: string): ThetaClient => new ThetaClient(url)
