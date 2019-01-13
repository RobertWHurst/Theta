export interface Match {
  namespace: string,
  path: string,
  params: Params
}

export interface Params {
  [key: string]: string
}

export class Segment {
  raw: string
  type: 'fixed' | 'key' | 'wildcard'
  subPatternStr: string
  keyName?: string

  constructor (src: string) {
    const s = src
    let c = ''
    let r = ''
    let p = ''
    let t = 0
    let esc = false
    let pnEsc = false
    let pnEr = 0

    const rxEscChars = ['(', ')', '^', '$']
    for (let i = 0; i < s.length; i += 1) {
      if (i === 0 && s[i] === ':') {
        t = 1
        r += ':'
      } else if (i === 0 && s[i] === '*') {
        t = 2
        r += '*'
      } else if (!pnEsc && s[i] === '\\') {
        if (esc) {
          esc = false
          c += '\\\\'
          r += '\\\\'
        } else {
          esc = true
        }
      } else if (!esc && !pnEsc && s[i] === '(') {
        pnEsc = true
        r += '('
      } else if (pnEsc && s[i] === ')') {
        if (i !== s.length - 1) {
          pnEr = 1
          break
        }
        r += ')'
      } else if (pnEsc) {
        if (s[i] === '(') {
          pnEr = 2
          break
        }
        p += s[i]
        r += s[i]
      } else {
        if (t === 1 && /[^a-zA-Z0-9_-]/.test(s[i])) {
          pnEr = 3
          break
        }
        c += rxEscChars.includes(s[i]) ? `\\${s[i]}` : s[i]
        r += s[i]
      }
    }
    switch (pnEr) {
      case 1: throw new Error(
        'Invalid pattern segment: Characters found after segment regular expression'
      )
      case 2: throw new Error(
        'Invalid pattern segment: Cannot use regular expression groups within segement patterns'
      )
      case 3: throw new Error(
        'Invalid pattern segment: Cannot use regular expression control characters in key names'
      )
    }

    this.raw = r
    this.type = ['fixed', 'key', 'wildcard'][t] as any

    if (this.type === 'fixed') {
      this.subPatternStr = c
      return
    }

    if (this.type === 'key') {
      this.keyName = c
    }

    p || (p = '[^/]+')
    this.subPatternStr = this.keyName ? `(?<${this.keyName}>${p})` : p
  }
}

export default class Pattern {
  raw: string
  namespace: string
  path: string
  capture: boolean
  pattern: RegExp
  segments: Segment[]

  constructor (src: string) {
    const s = src
    let r = ''
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
          c += '\\\\'
          r += '\\\\'
        } else {
          esc = true
        }
      } else if (!esc && !pnEsc && s[i] === '(') {
        c += '('
        r += '('
        pnEsc = true
      } else if (pnEsc && s[i] === ')') {
        c += ')'
        r += ')'
        pnEsc = false
      } else if (!esc && !pnEsc && !n && s[i] === '@') {
        n = c
        c = ''
        r += '@'
      } else if (!esc && !pnEsc && s[i] === '/') {
        c && sa.push(c)
        c && i !== s.length - 1 && (r += '/')
        c = ''
      } else if (!esc && !pnEsc && i === s.length - 1 && s[i] === '+') {
        cap = true
        r += '+'
      } else {
        esc && (s[i] === '(' || s[i] === ')' || s[i] === '@' || s[i] === '/') && (r += '\\')
        r += s[i]
        esc && (esc = false)
        c += s[i]
      }
    }
    c && sa.push(c)

    this.raw = r
    this.capture = cap
    this.namespace = n
    this.segments = sa.map(s => new Segment(s))
    this.path = this.segments.map(s => s.subPatternStr).join('/')

    let patternStr = '^'
    n && (patternStr += `${n}@`)
    patternStr += `(${this.path}${cap ? '/.+)' : ')$'}`

    this.pattern = new RegExp(patternStr)
  }

  tryMatch (path: string): Match | void {
    if (path[0] === '/') { path = path.slice(1) }

    const matches = path.match(this.pattern)
    if (!matches) { return }

    return {
      namespace: this.namespace,
      path: matches[1],
      params: matches.groups || {}
    }
  }
}
