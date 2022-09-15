import { Encoder } from "@thetaapp/encoder"
import { Transport } from "@thetaapp/client-transport"

export interface Config {
  url?: string
  encoder?: Encoder
  transport?: Transport
  timeout?: number
}
