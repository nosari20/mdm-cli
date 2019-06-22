export interface IO {
    in: (a: (b: string|number )=> void) => void,
    out: (a: any, b?:string) => void,
    exit: (a: number, b?: Result) => void,
    exec: (a: string, b: (c?: Result)=> void, d?:boolean) => void
    clear: (a?: number) => void,
    EOL: string,
}

export interface Result {
    exitCode: number,
    result?: any
}