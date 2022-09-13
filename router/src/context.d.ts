import { Message } from './message';
import { Pattern, Params } from '@thetaapp/pattern';
import { Config } from './config';
import { Socket } from './socket';
export declare class Context {
    next?: (err?: Error) => Promise<void>;
    $$path?: string;
    $$status?: string;
    $$error?: Error;
    $$handled?: boolean;
    $$timeout?: number;
    $$resetTimeout?: () => void;
    socket: Socket;
    message: Message | null;
    constructor(_config: Config, message: Message | null, socket: Socket);
    get rawPath(): string;
    get channel(): string;
    get path(): string;
    get params(): Params;
    get data(): any;
    get currentStatus(): string;
    get error(): Error | void;
    status(status: string): this;
    send(path: string, data?: any): Promise<void>;
    request(data?: any): Promise<Context>;
    reply(data?: any): Promise<void>;
    end(): void;
    timeout(ms?: number): this;
    clearError(): this;
    $$tryToApplyPattern(pattern: Pattern): boolean;
}
