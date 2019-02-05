export interface IO {
    in: (a: (b: string|number )=> void) => void,
    out: (a: string|number, b?:string) => void,
    exit: (a: number, b?: Result) => void,
    exec: (a: string, b: (c?: Result)=> void) => void
    EOL: string,
}

export interface Result {
    exitCode: number,
    result?: any
}