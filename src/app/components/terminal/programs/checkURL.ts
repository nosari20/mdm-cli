import { IO } from '../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../types/Program';


export const CheckURL: Program = <Program>{

    command: `check_url`,

    descritpion: `Check url access`,

    main : (io: IO, args: string[]) => {

        if(args.length < 1){
            io.printerr(`Not enough args`);
            io.exec(`${CheckURL.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        const url = args[0];

        if(!url.startsWith(`https://`)){
            io.printerr(`TThe url format must be https://&lt;host&gt;[:port][path][?query]`);
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
            io.println((args[1] ? args[1] : url)+ ` : `)
            if(res.errno){
                if(res.code == `ETIMEDOUT`){
                    io.printerr(`Not reachable (${res.code})`)
                }else{
                    io.printerr(`Error ${res.syscall} : ${res.code}`);
                }
                return io.exit(-1, res);
            }


            let statusCode = res.statusCode;
            if(statusCode == 403){
                io.println(`Restricted`,`color:red`);
            }else{
                io.println(`Avaibale (HTTP ${statusCode})`,`color:green`);
            }
            io.println('');                    

            return io.exit(0, res);  
        }
        ipc.on(`http`, onRespReceive);
    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${CheckURL.command} https://&lt;host&gt;[:port][path][?query] [NAME]${io.EOL}`);
        io.exit(0);
    },
}
