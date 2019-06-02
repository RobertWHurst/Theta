import { Config } from './config'
import { Segment } from './segment'
import { rxEscChars } from './regex-escape-chars'
import { Match } from './match'

const regExpCache = new Map<string, RegExp>()

export class Pattern {
  public raw: string
  public channels: Set<string>
  public capture: boolean
  public pattern: RegExp
  public segments: Segment[]

  constructor (_: Config, src: string) {
    const s = src
    let r = '' // raw pattern
    let c = '' // segment
    let na = new Set<string>() // channels
    let sa = [] // all segments
    let cap = false // is capturing path
    let esc = false // in escape sequence
    let pnEsc = false // in sub pattern escape sequence

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
        c = c.split('').map(c => rxEscChars.has(c) ? `\\${c}` : c).join('')
        na || (na = new Set())
        na.add(c)
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
    this.channels = na
    this.capture = cap
    this.segments = sa.map(s => new Segment(s))

    const segmentPatterns = this.segments.map(s => s.subPatternStr)
    const patternStr = `^(?:([^@]+)@)?/?(${segmentPatterns.join('/')}/${this.capture ? '.+)' : '?)$'}`
    let pattern = regExpCache.get(patternStr)
    if (!pattern) {
      pattern = new RegExp(patternStr)
      regExpCache.set(patternStr, pattern)
    }
    this.pattern = pattern
  }

  public tryMatch (path: string): Match | void {
    const matches = path.match(this.pattern)
    if (
      !matches ||
      (this.channels.size && !this.channels.has(matches[1]))
    ) { return }

    return {
      channel: matches[1],
      path: matches[2],
      params: matches.groups || {}
    }
  }

  public static raw (str: string): string {
    return new Pattern({}, str).raw
  }
}
