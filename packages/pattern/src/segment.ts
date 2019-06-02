import { rxEscChars } from './regex-escape-chars'

export class Segment {
  public raw: string
  public type: 'fixed' | 'key' | 'wildcard'
  public subPatternStr: string
  public keyName?: string

  constructor (src: string) {
    const s = src
    let c = ''
    let r = ''
    let p = ''
    let t = 0
    let esc = false
    let pnEsc = false
    let pnEr = 0

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
        c += rxEscChars.has(s[i]) ? `\\${s[i]}` : s[i]
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
