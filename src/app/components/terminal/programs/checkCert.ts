import { IO } from '../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../types/Program';


export const CheckCert: Program = <Program>{

    command: `check_cert`,

    descritpion: `Check certificate`,

    main : (io: IO, args: string[]) => {

        if(args.length < 2){
            io.printerr(`Not enough args`);
            io.exec(`${CheckCert.command} help`, () =>{
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


        ipc.send(`ssl`, JSON.stringify({
            host: host,
            port: Math.trunc(port) || 443,
            timeout: 3000
        }));
    
        const onCertReceive = function (event, resJSON) {
            ipc.removeListener(`ssl`,onCertReceive);
            let res = JSON.parse(resJSON);
            let name = (args[2] ? args[2] : `${host}:${port}`)
            io.println(`${name} : `); 
            if(res.errno){
                if(res.code == `ETIMEDOUT`){
                    io.printerr(`Not reachable (${res.code})`)
                }else{
                    io.printerr(`Error ${res.syscall} : ${res.code}`,);
                }
                return io.exit(-1, res);
            }
    
            let certificate = res;
            let validity: Date = new Date (certificate.valid_to);
            let time_left = Math.ceil((validity.valueOf() - new Date().valueOf()) / (1000 * 60 * 60 * 24));
            time_left = (time_left > 0 ? time_left : 0);
            if(certificate.authorized){
                io.println(`OK`,`color:green`)                        
            }else{
                io.println(`KO`,`color:red`);
            }
            io.println(` <a href="data:application/data;base64,${window.btoa(certificate.pemEncoded)}" download="${host}_${name}.cer">Download</a>`);
            if(time_left < 60){
                io.println(` (${time_left} days left)`, `color:orangered`);
            }
            io.println(io.EOL);
            return io.exit(0, res);
        }
        ipc.on(`ssl`, onCertReceive);
    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${CheckCert.command} &lt;HOST&gt; &lt;PORT&gt; [NAME]${io.EOL}`);
        io.exit(0);
    },
}
