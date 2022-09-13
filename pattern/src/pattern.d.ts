import { Config } from './config';
import { Segment } from './segment';
import { Match } from './match';
export declare class Pattern {
    raw: string;
    capture: boolean;
    pattern: RegExp;
    segments: Segment[];
    private readonly _hasChannels;
    private readonly _channels;
    constructor(_: Config, src: string);
    tryMatch(path: string): Match | void;
    static raw(str: string): string;
}
