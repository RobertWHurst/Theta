export declare class Segment {
    raw: string;
    type: 'fixed' | 'key' | 'wildcard';
    subPatternStr: string;
    keyName?: string;
    constructor(src: string);
}
