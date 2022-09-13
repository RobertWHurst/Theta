"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
const regex_escape_chars_1 = require("./regex-escape-chars");
class Segment {
    constructor(src) {
        const s = src;
        let c = '';
        let r = '';
        let p = '';
        let t = 0;
        let esc = false;
        let pnEsc = false;
        let pnEr = 0;
        for (let i = 0; i < s.length; i += 1) {
            if (i === 0 && s[i] === ':') {
                t = 1;
                r += ':';
            }
            else if (i === 0 && s[i] === '*') {
                t = 2;
                r += '*';
            }
            else if (!pnEsc && s[i] === '\\') {
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
                pnEsc = true;
                r += '(';
            }
            else if (pnEsc && s[i] === ')') {
                if (i !== s.length - 1) {
                    pnEr = 1;
                    break;
                }
                r += ')';
            }
            else if (pnEsc) {
                if (s[i] === '(') {
                    pnEr = 2;
                    break;
                }
                p += s[i];
                r += s[i];
            }
            else {
                if (t === 1 && /[^a-zA-Z0-9_-]/.test(s[i])) {
                    pnEr = 3;
                    break;
                }
                c += regex_escape_chars_1.rxEscChars[s[i]] ? `\\${s[i]}` : s[i];
                r += s[i];
            }
        }
        switch (pnEr) {
            case 1:
                throw new Error('Invalid pattern segment: Characters found after segment regular expression');
            case 2:
                throw new Error('Invalid pattern segment: Cannot use regular expression groups within segement patterns');
            case 3:
                throw new Error('Invalid pattern segment: Cannot use regular expression control characters in key names');
        }
        this.raw = r;
        this.type = ['fixed', 'key', 'wildcard'][t];
        if (this.type === 'fixed') {
            this.subPatternStr = c;
            return;
        }
        if (this.type === 'key') {
            this.keyName = c;
        }
        if (!p) {
            p = '[^/]+';
        }
        this.subPatternStr = this.keyName ? `(?<${this.keyName}>${p})` : p;
    }
}
exports.Segment = Segment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQWlEO0FBRWpELE1BQWEsT0FBTztJQU1sQixZQUFhLEdBQVc7UUFDdEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFBO1FBQ2YsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2pCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQTtRQUVaLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ0wsQ0FBQyxJQUFJLEdBQUcsQ0FBQTthQUNUO2lCQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUNsQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNMLENBQUMsSUFBSSxHQUFHLENBQUE7YUFDVDtpQkFBTSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLElBQUksR0FBRyxFQUFFO29CQUNQLEdBQUcsR0FBRyxLQUFLLENBQUE7b0JBQ1gsQ0FBQyxJQUFJLE1BQU0sQ0FBQTtvQkFDWCxDQUFDLElBQUksTUFBTSxDQUFBO2lCQUNaO3FCQUFNO29CQUNMLEdB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