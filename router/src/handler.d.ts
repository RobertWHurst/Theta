import { Context } from './context';
export declare type Handler = (ctx: Context) => Promise<void> | void;
