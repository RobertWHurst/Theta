export interface Params {
  [key: string]: string
}

export class Segment {
  raw: string
  type: 'fixed' | 'key' | 'wildcard'
  subPatternStr: string
  keyName?: string

  constructor (raw: string) {
    this.raw = raw

    const s = raw
    let c = ''
    let p = ''
    let t = 0
    let esc = false
    let pnEsc = false
    let pnEr = false

    for (let i = 0; i < s.length; i += 1) {
      if (i === 0 && s[i] === ':') {
        t = 1
      } else if (i === 0 && s[i] === '*') {
        t = 2
      } else if (!pnEsc && s[i] === '\\') {
        if (esc) {
          esc = false
          c += '\\'
        } else {
          esc = true
        }
      } else if (!esc && !pnEsc && s[i] === '(') {
        pnEsc = true
      } else if (pnEsc && s[i] === ')') {
        if (i !== s.length - 1) {
          pnEr = true
          break
        }
        p = c
      } else {
        c += s[i]
      }
    }
    if (pnEr) {
      throw new Error('Invalid pattern segment: Characters found after segment regular expression')
    }

    this.type = ['fixed', 'key', 'wildcard'][t] as any

    if (this.type === 'fixed') {
      this.subPatternStr = c
      return
    }

    if (this.type === 'key') {
      this.keyName = c
    }

    this.subPatternStr = p || (this.keyName ? `(?<${this.keyName}>[^/]+)` : '[^/]+')
  }
}

export default class Pattern {
  raw: string
  namespace: string
  capture: boolean
  pattern: RegExp
  segments: Segment[]

  constructor (raw: string) {
    const s = raw
    let c = ''
    let n = ''
    let sa = []
    let cap = false
    let esc = false
    let pnEsc = false

    for (let i = 0; i < s.length; i += 1) {
      if (!pnEsc && s[i] === '\\') {
        if (esc) {
          esc = false
          c += '\\'
        } else {
          esc = true
        }
      } else if (!esc && !pnEsc && s[i] === '(') {
        c += '('
        pnEsc = true
      } else if (pnEsc && s[i] === ')') {
        c += ')'
        pnEsc = false
      } else if (!esc && !pnEsc && !n && s[i] === '@') {
        n = c
        c = ''
      } else if (!esc && !pnEsc && s[i] === '/') {
        c && sa.push(c)
        c = ''
      } else if (!esc && !pnEsc && i === s.length - 1 && s[i] === '+') {
        cap = true
      } else {
        c += s[i]
      }
    }
    c && sa.push(c)

    this.capture = cap
    this.namespace = n
    this.segments = sa.map(s => new Segment(s))

    const patternStrTerminal = cap ? '/.+' : '$'
    const patternStr = `^${this.segments.map(s => s.subPatternStr).join('/')}${patternStrTerminal}`

    this.raw = ''
    n && (this.raw += `${n}@`)
    this.raw += this.segments.map(se => se.raw).join('/')
    cap && (this.raw += '/+')

    this.pattern = new RegExp(patternStr)
  }

  tryMatch (path: string): Params | void {
    if (path[0] === '/') { path = path.slice(1) }

    const matches = path.match(this.pattern)
    if (!matches) { return }
    return matches.groups || {}
  }
}
