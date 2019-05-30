import { Context } from '../context'
import { Pattern } from '@thetaapp/pattern'

export class TestContext implements Context {
  public $$tryToApplyPattern (_: Pattern): boolean {
    return true
  }
}
