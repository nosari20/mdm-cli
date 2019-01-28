export interface IO {
    in: (a: (b: string|number )=> void) => void,
    out: (a: string|number, b?:string) => void,
    exit: (a: number) => void,
    exec: (a: string, b: ()=> void) => void
    EOL: string,
}