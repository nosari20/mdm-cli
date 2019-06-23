import { IO } from '../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../types/Program';


export const HTTP: Program = <Program>{

    command: `http`,

    descritpion: `HTTP requests`,

    main : (io: IO, args: string[], options: any) => {


        if(args.length < 2){
            io.printerr(`Not enough args`);
            io.exec(`${HTTP.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        const method = args[0];
        const url = args[1];

        const allowedMethod = [`GET`,`POST`,`PUT`,`HEAD`,`DELETE`];
        if(!allowedMethod.includes(method)){
            io.printerr(`Unknown method`);
            io.exit(-1);
            return;
        }

       
        if(!url.startsWith('https://') && !url.startsWith('http://')){
            io.printerr(`Unknown protocol, only http and https are supported`);
            io.exit(-1);
            return;
        }



        const _electronService  = new ElectronService();
        const ipc = _electronService.ipcRenderer;


        ipc.send(`http`, JSON.stringify({
            url: url,
            method: method,
            timeout: 3000,
            options: {
                data: options.data,
                auth: (options.username?{
                    username : options.username,
                    password: options.password
                }:undefined)
            }
        }));
    
        const onRespReceive = function (event, resJSON) {
            ipc.removeListener(`http`,onRespReceive);
            let res = JSON.parse(resJSON);

            if(res.errno){
                if(res.code == `ETIMEDOUT`){
                    io.printerr(`Not reachable (${res.code})`)
                }else{
                    io.printerr(`Error ${res.syscall} : ${res.code}`);
                }
                return io.exit(-1, res);
            }

            io.println(`HTTP ${res.statusCode}${io.EOL}`);

            if(url.startsWith('https://')){
                io.println(`SSL Authorized : ${res.certificate.authorized} <a href="data:application/data;base64,${window.btoa(res.certificate.pemEncoded)}" download="${'cert'}.cer">Download</a>${io.EOL}`);
            }

            if(res.body){
                io.println(`Body : ${io.EOL}<iframe style="background: white;width: calc(100% - 10px);height: 50vh;" srcdoc="${res.body.replace(/"/g,"'").replace('/(<head>)|(<HEAD>)/',`<head><base href='${url.split("/")[0]}//${url.split("/")[2]}'>`).replace(/(<\/body>)|(<\/BODY>)/,'<div style=\'position:absolute;top:0;bottom:0;right:0;left:0\'></div></body>')}"></iframe>${io.EOL}`);
            }
            if(options.headers){
                io.println(`Headers : ${io.EOL}`);
                let keys = Object.keys(res.headers);
                for(let i in keys){
                    io.println(`${keys[i]} : ${res.headers[keys[i]]}${io.EOL}`);
                }                
            }                  
            
            return io.exit(0, res);
        }
        ipc.on(`http`, onRespReceive);

    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${HTTP.command} &lt;METHOD&gt; &lt;URL&gt; [--data=DATA] [--username=USERNAME] [--password=PASSWORD]${io.EOL}`);
        io.exit(0);
    },
}
