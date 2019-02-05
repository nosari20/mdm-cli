export interface Command {
    command: string,
    args: string[],
    options: any,
    result: string,
    exit: number,
    raw: string,
}