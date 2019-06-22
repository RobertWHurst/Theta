import { Config } from './config'
import { Segment } from './segment'
import { rxEscChars } from './regex-escape-chars'
import { Match } from './match'

type Channels = { [s: string]: boolean }
const regExpCache = new Map<string, RegExp>()

export class Pattern {
  public raw: string
  public capture: boolean
  public pattern: RegExp
  public segments: Segment[]
  private _hasChannels: boolean
  private _channels: Channels

  constructor(_: Config, src: string) {
    const s = src
    let r = '' // raw pattern
    let c = '' // segment
    let n = false // has channel
    let na: Channels = {} // channels
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
        c = c
          .split('')
          .map(c => (rxEscChars[c] ? `\\${c}` : c))
          .join('')
        n = true
        na[c] = true
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
        esc &&
          (s[i] === '(' || s[i] === ')' || s[i] === '@' || s[i] === '/') &&
          (r += '\\')
        r += s[i]
        esc && (esc = false)
        c += s[i]
      }
    }
    c && sa.push(c)

    this.raw = r
    this.capture = cap
    this.segments = sa.map(s => new Segment(s))
    this._hasChannels = n
    this._channels = na

    const segmentPatterns = this.segments.map(s => s.subPatternStr)
    const patternStr = `^(?:([^@]+)@)?/?(${segmentPatterns.join('/')}/${
      this.capture ? '.+)' : '?)$'
    }`
    let pattern = regExpCache.get(patternStr)
    if (!pattern) {
      pattern = new RegExp(patternStr)
      regExpCache.set(patternStr, pattern)
    }
    this.pattern = pattern
  }

  public tryMatch(path: string): Match | void {
    const matches = path.match(this.pattern)
    if (!matches || (this._hasChannels && !this._channels[matches[1]])) {
      return
    }

    return {
      channel: matches[1],
      path: matches[2],
      params: matches.groups || {}
    }
  }

  public static raw(str: string): string {
    return new Pattern({}, str).raw
  }
}
