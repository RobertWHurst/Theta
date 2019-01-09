export type Fixture = (data?: any) => any
export default (base: object): Fixture => (data?: any) => {

  const merge = (a: any, b: any): any => {
    if (b === undefined) { return a }
    if (typeof b !== 'object' || b === null) { return b }
    if (typeof a !== 'object' || a === null) { a = typeof b.length === 'number' ? [] : {} }
    b.constructor && (a.constructor = b.constructor)
    Object.setPrototypeOf(a, Object.getPrototypeOf(b))
    for (const prop in b) { a[prop] = merge(a[prop], b[prop]) }
    return a
  }

  let fixture = merge({}, base)
  if (data) { fixture = merge(fixture, data) }
  return fixture
}
