import { Config } from './config';
import { Handler } from './handler';
import { Router } from './router';
import { Context } from './context';
export declare class HandlerChain {
    nextLink?: HandlerChain;
    private readonly _pattern;
    private readonly _handler;
    private readonly _config;
    private readonly _isErrorHandler;
    constructor(config: Config, patternStr: string, handler: Handler | Router, isErrorHandler: boolean);
    push(patternStr: string, handler: Handler | Router, isErrorHandler: boolean): void;
    is(patternStr: string, handler: Handler | Router, isErrorHandler: boolean): boolean;
    remove(patternStr: string, handler: Handler | Router, isErrorHandler: boolean): boolean;
    route(ctx: Context): Promise<void>;
}
