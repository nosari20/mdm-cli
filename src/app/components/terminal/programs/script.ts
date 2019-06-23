import { IO } from '../types/IO';
import { Program } from '../types/Program';


export const Script: Program = <Program>{

    command: `script`,

    descritpion: `Run external script`,

    main : (io: IO, args: string[]) => {


        io.exec(`file open`, (res) => {
            if(res.exitCode >= 0 && res.result.content){
                let path = res.result.fileName.split('/');

                io.println(`Executing ${path[path.length-1]}${io.EOL}${io.EOL}`)
                let f=new Function(`io`,res.result.content);
                f(io);
                return;
            }else{
                io.printerr(`Cannot read file`);
                return io.exit(-1);
            }

        }, true);       
    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${Script.command}${io.EOL}`);
        io.exit(0);
    },
}
