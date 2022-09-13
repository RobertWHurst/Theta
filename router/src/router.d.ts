import { Config } from './config';
import { Handler } from './handler';
import { Context } from './context';
export declare class Router {
    private readonly _config;
    private _handlerChain?;
    constructor(config: Config);
    route(ctx: Context): Promise<void>;
    handle(handler: Handler): void;
    handle(router: Router): void;
    handle(patternStr: string, handler: Handler): void;
    handle(patternStr: string, router: Router): void;
    unhandle(handler: Handler): boolean;
    unhandle(router: Router): boolean;
    unhandle(patternStr: string, handler: Handler): boolean;
    unhandle(patternStr: string, router: Router): boolean;
    handleError(handler: Handler): void;
    handleError(patternStr: string, handler: Handler): void;
    unhandleError(handler: Handler): void;
    unhandleError(patternStr: string, handler: Handler): void;
    $$subHandle(patternStr: string, handler: Handler): void;
    private _handle;
    private _unhandle;
}
