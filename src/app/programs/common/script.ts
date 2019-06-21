import { IO } from '../../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../../types/Program';
//var fs = require('fs');


export const Script: Program = <Program>{

    command: `script`,

    descritpion: `Run external script`,

    main : (io: IO, args: string[]) => {


        io.exec(`file open`, (res) => {

            if(res.exitCode > 0 && res.result.content){
                let path = res.result.fileName.split('/');

                io.out(`Executing ${path[path.length-1]}${io.EOL}${io.EOL}`)
                let f=new Function(`io`,res.result.content);
                f(io);
                return;
            }else{
                io.out(`Cannot read file`,`color: red`);
                return io.exit(-1);
            }

        }, true);       
    },
    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${Script.command}${io.EOL}`);
        io.exit(0);
    },
}
