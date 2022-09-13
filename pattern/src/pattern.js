"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pattern = void 0;
const segment_1 = require("./segment");
const regex_escape_chars_1 = require("./regex-escape-chars");
const regExpCache = new Map();
class Pattern {
    constructor(_, src) {
        const s = src;
        let r = ''; // raw pattern
        let c = ''; // segment
        let n = false; // has channel
        const na = {}; // channels
        const sa = []; // all segments
        let cap = false; // is capturing path
        let esc = false; // in escape sequence
        let pnEsc = false; // in sub pattern escape sequence
        for (let i = 0; i < s.length; i += 1) {
            if (!pnEsc && s[i] === '\\') {
                if (esc) {
                    esc = false;
                    c += '\\\\';
                    r += '\\\\';
                }
                else {
                    esc = true;
                }
            }
            else if (!esc && !pnEsc && s[i] === '(') {
                c += '(';
                r += '(';
                pnEsc = true;
            }
            else if (pnEsc && s[i] === ')') {
                c += ')';
                r += ')';
                pnEsc = false;
            }
            else if (!esc && !pnEsc && sa.length === 0 && s[i] === '@') {
                c = c
                    .split('')
                    .map(c => (regex_escape_chars_1.rxEscChars[c] ? `\\${c}` : c))
                    .join('');
                n = true;
                na[c] = true;
                c = '';
                r += '@';
            }
            else if (!esc && !pnEsc && s[i] === '/') {
                if (c) {
                    sa.push(c);
                }
                if (c && i !== s.length - 1) {
                    r += '/';
                }
                c = '';
            }
            else if (!esc && !pnEsc && i === s.length - 1 && s[i] === '+') {
                cap = true;
                r += '+';
            }
            else {
                if (esc &&
                    (s[i] === '(' || s[i] === ')' || s[i] === '@' || s[i] === '/')) {
                    r += '\\';
                }
                r += s[i];
                if (esc) {
                    esc = false;
                }
                c += s[i];
            }
        }
        c && sa.push(c);
        this.raw = r;
        this.capture = cap;
        this.segments = sa.map(s => new segment_1.Segment(s));
        this._hasChannels = n;
        this._channels = na;
        const segmentPatterns = this.segments.map(s => s.subPatternStr);
        const patternStr = `^(?:([^@]+)@)?/?(${segmentPatterns.join('/')}${this.capture ? '.*)' : '/?)$'}`;
        let pattern = regExpCache.get(patternStr);
        if (!pattern) {
            pattern = new RegExp(patternStr);
            regExpCache.set(patternStr, pattern);
        }
        this.pattern = pattern;
    }
    tryMatch(path) {
        var _a;
        const matches = path.match(this.pattern);
        if (!matches || (this._hasChannels && !this._channels[matches[1]])) {
            return;
        }
        return {
            channel: matches[1],
            path: matches[2],
            params: (_a = matches.groups) !== null && _a !== void 0 ? _a : {}
        };
    }
    static raw(str) {
        return new Pattern({}, str).raw;
    }
}
exports.Pattern = Pattern;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhdHRlcm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQW1DO0FBQ25DLDZEQUFpRDtBQUlqRCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQTtBQUU3QyxNQUFhLE9BQU87SUFRbEIsWUFBYSxDQUFTLEVBQUUsR0FBVztRQUNqQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQyxjQUFjO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQSxDQUFDLFVBQVU7UUFDckIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFBLENBQUMsY0FBYztRQUM1QixNQUFNLEVBQUUsR0FBYSxFQUFFLENBQUEsQ0FBQyxXQUFXO1FBQ25DLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQSxDQUFDLGVBQWU7UUFDN0IsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFBLENBQUMsb0JBQW9CO1FBQ3BDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQSxDQUFDLHFCQUFxQjtRQUNyQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUEsQ0FBQyxpQ0FBaUM7UUFFbkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNCLElBQUksR0FBRyxFQUFFO29CQUNQLEdBQUcsR0FBRyxLQUFLLENBQUE7b0JBQ1gsQ0FBQyxJQUFJLE1BQU0sQ0FBQTtvQkFDWCxDQUFDLElBQUksTUFBTSxDQUFBO2lCQUNaO3FCQUFNO29CQUNMLEdBQUcsR0FBRyxJQUFJLENBQUE7aUJBQ1g7YUFDRjtpQkFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ3pDLENBQUMsSUFBSSxHQUFHLENBQUE7Z0JBQ1IsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtnQkFDUixLQUFLLEdBQUcsSUFBSSxDQUFBO2FBQ2I7aUJBQU0sSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDaEMsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtnQkFDUixDQUFDLElBQUksR0FBRyxDQUFBO2dCQUNSLEtBQUssR0FBRyxLQUFLLENBQUE7YUFDZDtpQkFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQzVELENBQUMsR0FBRyxDQUFDO3FCQUNGLEtBQUssQ0FBQyxFQUFFLENBQUM7cUJBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQywrQkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUNYLENBQUMsR0FBRyxJQUFJLENBQUE7Z0JBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtnQkFDWixDQUFDLEdBQUcsRUFBRSxDQUFBO2dCQUNOLENBQUMsSUFBSSxHQUFHLENBQUE7YUFDVDtpQkFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxFQUFFO29CQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQUU7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFBRSxDQUFDLElBQUksR0FBRyxDQUFBO2lCQUFFO2dCQUN6QyxDQUFDLEdBQUcsRUFBRSxDQUFBO2FBQ1A7aUJBQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDL0QsR0FBRyxHQUFHLElBQUksQ0FBQTtnQkFDVixDQUFDLElBQUksR0FBRyxDQUFBO2FBQ1Q7aUJBQU07Z0JBQ0wsSUFDRSxHQUFHO29CQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUM5RDtvQkFBRSxDQUFDLElBQUksSUFBSSxDQUFBO2lCQUFFO2dCQUNmLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ1QsSUFBSSxHQUFHLEVBQUU7b0JBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQTtpQkFBRTtnQkFDeEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUNWO1NBQ0Y7UUFDRCxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVmLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUE7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7UUFFbkIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDL0QsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFDekIsRUFBRSxDQUFBO1FBQ0YsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ2hDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDeEIsQ0FBQztJQUVNLFFBQVEsQ0FBRSxJQUFZOztRQUMzQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN4QyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNsRSxPQUFNO1NBQ1A7UUFFRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxFQUFFLE1BQUEsT0FBTyxDQUFDLE1BQU0sbUNBQUksRUFBRTtTQUM3QixDQUFBO0lBQ0gsQ0FBQztJQUVNLE1BQU0sQ0FBQyxHQUFHLENBQUUsR0FBVztRQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUE7SUFDakMsQ0FBQztDQUNGO0FBbEdELDBCQWtHQyJ9