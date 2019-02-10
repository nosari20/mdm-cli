import { IO } from '../../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../../types/Program';


export const CheckURL: Program = <Program>{

    command: `common:check_url`,

    descritpion: `Check url access`,

    main : (io: IO, args: string[]) => {

        if(args.length < 1){
            io.out(`Not enough args ${io.EOL}`);
            io.exec(`${CheckURL.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        const url = args[0];

        if(!url.startsWith(`https://`)){
            io.out(`TThe url format must be https://&lt;host&gt;[:port][path][?query]${io.EOL}`,`color:red`);
            return io.exit(-1);
        }

        const _electronService  = new ElectronService();
        const ipc = _electronService.ipcRenderer;
        ipc.send(`http`, JSON.stringify({
            url: url,
            timeout: 3000
        }));

        const onRespReceive = function (event, resJSON) {
            ipc.removeListener(`http`,onRespReceive);
            let res = JSON.parse(resJSON); 
            io.out((args[1] ? args[1] : url)+ ` : `)
            if(res.errno){
                if(res.code == `ETIMEDOUT`){
                    io.out(`Not reachable (${res.code})${io.EOL}`,`color:red`)
                }else{
                    io.out(`Error ${res.syscall} : ${res.code+io.EOL}`, `color:red`);
                }
                return io.exit(-1, res);
            }


            let statusCode = res.statusCode;
            if(statusCode == 403){
                io.out(`Restricted`,`color:red`);
            }else{
                io.out(`Avaibale (HTTP ${statusCode})`,`color:green`);
            }
            io.out(io.EOL);                    

            return io.exit(0, res);  
        }
        ipc.on(`http`, onRespReceive);
    },
    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${CheckURL.command} https://&lt;host&gt;[:port][path][?query] [NAME]${io.EOL}`);
        io.exit(0);
    },
}
