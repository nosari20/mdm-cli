import { IO } from '../../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../../types/Program';


export const File: Program = <Program>{

    command: `common:script`,

    descritpion: `Run external script`,

    main : (io: IO, args: string[]) => {

        const _electronService  = new ElectronService();
        const ipc = _electronService.ipcRenderer;
    

        ipc.send(`file-dialog`, JSON.stringify({
            filter: 'js',
        }));    
        const onRespReceive = function (event, resJSON) {
            ipc.removeListener(`tcp_ping`,onRespReceive);
            let res = JSON.parse(resJSON);
           
            
            return io.exit(0, res);
        }
        ipc.on(`file-dialog`, onRespReceive);

        /*
        
       let script = `
       io.out('Enter Core host' + io.EOL);
       
       io.in((host) =>{
       
           io.out('Enter Username' + io.EOL);
           io.in((username) =>{
       
               io.out('Enter Password' + io.EOL);
               io.in((password) =>{
                   
                   io.exec('common:http GET https://'+host+'/api/v2/ping --username='+username+' --password='+password, (res) => {

                        if(res.exitCode < 0){
                            io.out('Error during common:http'+io.EOL,'color:red');
                            return io.exit(-1);
                        }

                        if(res.errno){
                           if(res.code == 'ETIMEDOUT'){
                               io.out('Not reachable ('+res.code+')'+io.EOL,'color:red')
                           }else{
                               io.out('Error '+res.syscall+' : '+res.code+io.EOL, 'color:red');
                           }
                           return io.exit(-1);
                       }else{
                           
                           switch(res.statusCode){
                               case 404 :
                                   io.out('HTTP 404 : Not Found'+io.EOL);
                                   break;
                               case 401 : 
                                   io.out('HTTP 401 : Not Unauthorized'+io.EOL);
                                   break;
                               default :
                                   io.out('Connected'+io.EOL);
                                   console.log(res);
                                   let json = JSON.parse(res.result.body);
                                   
                                   io.out('Core version: '+json.results.vspVersion+io.EOL);
                                   break;
       
                               io.exit(0);
                           }
                       }
       
                       io.exit(0);
                   }, true);
       
               });
       
           });
           
       })
       
                 
        `;

        var f=new Function('io',script);
        f(io);

        */
       
    },
    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${File.command} &lt;open&gt;${io.EOL}`);
        io.exit(0);
    },
}
