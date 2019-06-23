export interface Command {
    command: string,
    args: string[],
    options: any,
    exit: number,
    raw: string,
}