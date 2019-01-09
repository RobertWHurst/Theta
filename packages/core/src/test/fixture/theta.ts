import fixture from './fixture'
import Context from '../../context'

export default fixture({
  context: Object.create(Context.prototype)
})
