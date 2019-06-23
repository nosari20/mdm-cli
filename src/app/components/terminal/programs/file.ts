import { IO } from '../types/IO';
import {ElectronService} from 'ngx-electron';
import { Program } from '../types/Program';


export const File: Program = <Program>{

    command: `file`,

    descritpion: `File read/write`,

    main : (io: IO, args: string[]) => {

        const _electronService  = new ElectronService();
        const remote = _electronService.remote;
        const ipc = _electronService.ipcRenderer;

    
        // if read

        remote.dialog.showOpenDialog( {},function(fileNames) {
            if (fileNames === undefined) return;
            let fileName = fileNames[0];

            ipc.send(`file-read`, JSON.stringify({
                fileName: fileName,
            }));
        
            const onRespReceive = function (event, resJSON) {
                ipc.removeListener(`file-read`,onRespReceive);
                let res = JSON.parse(resJSON);

                if(typeof res.content == `string`){
                    io.println(res.content);
                    return io.exit(0, res);
                }else{
                    io.printerr(`Cannot read file`);
                    return io.exit(-1);
                }
               
            }
            ipc.on(`file-read`, onRespReceive);
            
          });
       
    },
    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${File.command} &lt;open&gt;${io.EOL}`);
        io.exit(0);
    },
}
