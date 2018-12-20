export interface Params {
  [key: string]: string
}

export class Segment {
  raw: string
  type: 'capture' | 'fixed' | 'key' | 'wildcard'
  subPatternStr: string
  keyName?: string

  constructor (raw: string) {
    this.raw = raw
    this.type = (
      raw[0] === ':' ? 'key' :
      raw[0] === '*' ? 'wildcard' :
      'fixed'
    )

    if (this.type === 'fixed') {
      this.subPatternStr = this.raw
      return
    }

    let i = 1
    if (this.type === 'key') {
      this.keyName = ''
      for (;i < raw.length && raw[i] !== '('; i += 1) {
        this.keyName += raw[i]
      }
    }

    if (raw[i] === '(' && raw[raw.length - 1] === ')') {
      this.subPatternStr = raw.slice(i + 1, raw.length - 2)
    } else {
      this.subPatternStr = this.keyName ? `(?<${this.keyName}>[^/]+)` : '[^/]+'
    }
  }
}

export default class Pattern {
  raw: string
  pattern: RegExp
  segments: Segment[]

  constructor (raw: string) {

    if (raw[0] === '/') { raw = raw.slice(1) }

    this.raw = raw

    let capture = false
    if (raw[raw.length - 1] === '+') { raw = raw.slice(0, raw.length - 1); capture = true }
    if (raw[raw.length - 1] === '/') { raw = raw.slice(0, raw.length - 1) }

    this.segments = raw.split('/').map(s => new Segment(s))

    const patternStrTerminal = capture ? '/.+' : '$'
    const patternStr = `^${this.segments.map(s => s.subPatternStr).join('/')}${patternStrTerminal}`

    this.pattern = new RegExp(patternStr)
  }

  tryMatch (path: string): Params | void {
    if (path[0] === '/') { path = path.slice(1) }

    const matches = path.match(this.pattern)
    if (!matches) { return }
    return matches.groups || {}
  }
}
