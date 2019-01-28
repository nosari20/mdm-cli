import { IO } from './IO';

export interface Program {
    command : string,
    descritpion: string,
    main : (a:IO, b: string[]) => void
    help : (a:IO) => void
}