export interface Encoder {
    encode(bundledData: any): Promise<any>;
    decode(encodedData: any): Promise<any>;
    expand(decodedData: any): Promise<Expanded>;
    bundle(status: string, path: string, data: any): Promise<any>;
}
export interface Expanded {
    status: string;
    path: string;
    data: any;
}
export declare const defaultEncoder: Encoder;
