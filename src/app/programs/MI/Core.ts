import { IO } from '../../components/terminal/types/IO';
import { Program } from '../../components/terminal/types/Program';



export const Core: Program = <Program>{

    command: `mi:core`,

    descritpion: `MobileIron Core related tests`,

    main : (io: IO, args: string[]) => {
        if(args.length < 1){
            io.printerr(`Not enough args`);
            io.exec(`${Core.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        let host = args[0]; 

        console.log( host);
        
        if(args.length == 1){
            io.println(`Tests for ${host} : ${io.EOL}`);
            io.println(`Certificates :`);
            io.exec(`${Core.command} ${host} cert`,() => {
                io.println(io.EOL);
                io.println(`Acess Control :`);
                io.exec(`${Core.command} ${host} ac`,() => {
                    io.println(io.EOL);
                    io.println(`Status :`);
                    io.exec(`${Core.command} ${host} status`,() => {
                        io.exit(0);
                    });
                });
            });
            return;
        }
        
        

        if(args[1] == `cert`){            
            io.exec(`check_cert ${host} 443 "HTTPS SSL"`,  () => {
                io.exec(`check_cert ${host} 9997 "CLIENT TLS"`,  () => {
                    io.exit(0);           
                });           
            });           
            return;
        }

        if(args[1] == `ac`){
            io.exec(`check_url https://${host}/mifs/admin/vsp.html "Admin Portal"`, () => {
                io.exec(`check_url https://${host}/mifs/user/index.html "User Portal"`, () => {
                    io.exec(`check_url https://${host}:8443/mics "System Manager"`, () => {
                        io.exit(0);
                    });
                });
            });            
            return;
        }

        

        if(args[1] == `status`){
            io.exec(`http GET https://${host}/status/status.html"`, (res) => {
                if(res.exitCode == -1){
                    io.printerr(`Error ${res.result.syscall} ${res.result.errno}`)
                    return io.exit(-1)
                }else{
                    if(res.result.statusCode  != 200){
                        io.printerr(`HTTP ${res.result.statusCode}`);
                        return io.exit(-1)
                    }else{
                        io.println(`${res.result.body}`);
                        return io.exit(0);
                    }                    
                }
            }, true);            
            return;
        }




        io.printerr(`Wrong argument`+io.EOL);
        io.exec( `${Core.command} help`, () =>{
            io.exit(-1);
        });
        return

    },

    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${Core.command} <HOST> [cert | ac | status]${io.EOL}`);
        io.exit(0);
    },
    

    
}