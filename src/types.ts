import http from 'http'
import https from 'https'
import Message from './message'
import Socket from './socket'
import Router from './router'
import Context from './context';

export interface Config {
  server?: http.Server | https.Server
}

export type ClassifyFn = (data: any) => Promise<string>
export type ClassifyFnWCb = (data: any, cb: (err: Error, path: string) => void) => void

export type EncodeFn = (data: any) => Promise<any>
export type EncodeFnWCb = (data: any, cb: (err: Error, encodedData: any) => void) => void

export type DecodeFn = (encodedData: any, flags: Object) => Promise<any>
export type DecodeFnWCb = (encodedData: any, flags: Object, cb: (err: Error, data: any) => void) => Promise<any>

export type HandlerFn = (context: Context) => Promise<void>

export interface Handler {
  pattern?: string
  fn?: HandlerFn
  router?: Router
}
