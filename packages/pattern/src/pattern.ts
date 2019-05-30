import { Config } from './config'
import { Segment } from './segment'
import { rxEscChars } from './regex-escape-chars'
import { Match } from './match'

export class Pattern {
  public raw: string
  public capture: boolean
  public pattern: RegExp
  public segments: Segment[]

  constructor (_: Config, src: string) {
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
      } else if (!esc && !pnEsc && sa.length === 0 && s[i] === '@') {
        c = c.split('').map(c => rxEscChars.includes(c) ? `\\${c}` : c).join('')
        n = n ? `${n}|${c}` : c
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
    this.segments = sa.map(s => new Segment(s))

    const segmentPatterns = this.segments.map(s => s.subPatternStr)
    segmentPatterns.push(cap ? '.+)' : '?)$')

    const patternStr = `^${n ? `(${n})@` : `(?:([^@]+)@)?`}/?(${segmentPatterns.join('/')}`

    this.pattern = new RegExp(patternStr)
  }

  public tryMatch (path: string): Match | void {
    const matches = path.match(this.pattern)
    if (!matches) { return }

    return {
      channel: matches[1],
      path: matches[2],
      params: matches.groups || {}
    }
  }
}
