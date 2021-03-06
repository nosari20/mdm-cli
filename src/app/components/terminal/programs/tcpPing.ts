import { IO } from '../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../types/Program';


export const TCPPing: Program = <Program>{

    command: `tcp_ping`,

    descritpion: `TCP Ping`,

    main : (io: IO, args: string[]) => {

        if(args.length < 2){
            io.printerr(`Not enough args`);
            io.exec(`${TCPPing.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        const host = args[0];
        const port = parseInt(args[1]);
        if(isNaN(port)){
            io.printerr(`Port is not a number`);
            return io.exit(-1);
        }

        const _electronService  = new ElectronService();
        const ipc = _electronService.ipcRenderer;


        ipc.send(`tcp_ping`, JSON.stringify({
            host: host,
            port: Math.trunc(port) || 443,
            timeout: 3000
        }));
    
        const onRespReceive = function (event, resJSON) {
            ipc.removeListener(`tcp_ping`,onRespReceive);
            let res = JSON.parse(resJSON);
            let name = (args[2] ? args[2] : `${host}:${port}`);
            if(res.errno){
                if(res.code == `ETIMEDOUT`){
                    io.printerr(`${name} not reachable (${res.code})`);
                }else{
                    io.printerr(`${name} : Error ${res.syscall} : ${res.code}`);
                }
                return io.exit(-1, res);
            }

            io.println(`${name} reachable (time: ${res.time})${io.EOL}`);   
            
            return io.exit(0, res);
        }
        ipc.on(`tcp_ping`, onRespReceive);
    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${TCPPing.command} &lt;HOST&gt; &lt;PORT&gt; [NAME]${io.EOL}`);
        io.exit(0);
    },
}
