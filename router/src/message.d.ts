import { Params, Pattern } from '@thetaapp/pattern';
export declare class Message {
    rawPath: string;
    channel?: string;
    path?: string;
    status: string;
    params?: Params;
    data: any;
    constructor(rawPath: string, status: string, data: any);
    $$tryToApplyPattern(pattern: Pattern): boolean;
}
