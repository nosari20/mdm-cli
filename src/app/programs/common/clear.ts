import { IO } from '../../types/IO';
import { Program } from '../../types/Program';


export const Clear: Program = <Program>{

    command: `clear`,

    descritpion: `Clear output`,

    main : (io: IO, args: string[]) => {
        io.clear();
        return io.exit(0);
        
    },
    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${Clear.command}${io.EOL}`);
        io.exit(0);
    },
}
