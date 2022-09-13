import { Handler } from './handler';
export interface Socket {
    $$subHandle(patternStr: string, handler: Handler): void;
    $$send(status: string, rawPath: string, data?: any): Promise<void>;
}
