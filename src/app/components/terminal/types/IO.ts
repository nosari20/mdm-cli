export interface IO {
    in: (a: (b: string|number )=> void) => void,
    out: (a: any, b?:string, c?:boolean) => void,
    print: (a: any, b?:string) => void,
    println: (a: any, b?:string) => void,
    printerr: (a: any) => void,
    exit: (a: number, b?: any) => void,
    exec: (a: string, b: (c?: Result)=> void, d?:boolean) => void
    clear: (a?: number) => void,
    EOL: string,
}

export interface Result {
    exitCode: number,
    result?: any
}