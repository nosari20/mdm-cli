import { IO } from '../../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../../types/Program';


export const HTTP: Program = <Program>{

    command: `common:http`,

    descritpion: `HTTP requests`,

    main : (io: IO, args: string[], options: any) => {


        if(args.length < 2){
            io.out(`Not enough args ${io.EOL}`);
            io.exec(`${HTTP.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        const method = args[0];
        const url = args[1];

        const allowedMethod = [`GET`,`POST`,`PUT`,`HEAD`,`DELETE`];
        if(!allowedMethod.includes(method)){
            io.out(`Unknown method ${io.EOL}`, `color: red`);
            io.exit(-1);
            return;
        }

       
        if(!url.startsWith('https://') && !url.startsWith('http://')){
            io.out(`Unknown protocol, only http and https are supported ${io.EOL}`, `color: red`);
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
                    io.out(`Not reachable (${res.code})${io.EOL}`,`color:red`)
                }else{
                    io.out(`Error ${res.syscall} : ${res.code+io.EOL}`, `color:red`);
                }
                return io.exit(-1, res);
            }

            io.out(`HTTP ${res.statusCode}${io.EOL}`);
            
            if(res.body){
                io.out(`Body : ${io.EOL}<iframe style="background: white;width: calc(100% - 10px);height: 50vh;" srcdoc="${res.body.replace(/"/g,"'").replace('/(<head>)|(<HEAD>)/',`<head><base href='${url.split("/")[0]}//${url.split("/")[2]}'>`).replace(/(<\/body>)|(<\/BODY>)/,'<div style=\'position:absolute;top:0;bottom:0;right:0;left:0\'></div></body>')}"></iframe>${io.EOL}`);
            }
            if(options.headers){
                io.out(`Headers : ${io.EOL}`);
                let keys = Object.keys(res.headers);
                for(let i in keys){
                    io.out(`${keys[i]} : ${res.headers[keys[i]]}${io.EOL}`);
                }                
            }                  
            
            return io.exit(0, res);
        }
        ipc.on(`http`, onRespReceive);

    },
    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${HTTP.command} &lt;METHOD&gt; &lt;URL&gt; [--data=DATA] [--username=USERNAME] [--password=PASSWORD]${io.EOL}`);
        io.exit(0);
    },
}
