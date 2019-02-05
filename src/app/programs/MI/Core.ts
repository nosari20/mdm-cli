import { IO } from '../../types/IO';
import { Program } from '../../types/Program';



export const Core: Program = <Program>{

    command: `mi:core`,

    descritpion: `MobileIron Core related tests`,

    main : (io: IO, args: string[]) => {
        if(args.length < 1){
            io.out(`Not enough args${io.EOL}`);
            io.exec(`${Core.command} help`, () =>{
                io.exit(-1);
            });
            return;
        }

        let host = args[0]; 
        
        if(args.length == 1){
            io.out(`Tests for ${host} : ${io.EOL+io.EOL}`);
            io.out(`Certificates :${io.EOL}`);
            io.exec(`${Core.command} ${host} cert`,() => {
                io.out(io.EOL);
                io.out(`Acess Control :${io.EOL}`);
                io.exec(`${Core.command} ${host} ac`,() => {
                    io.exit(0);
                });
            });
            return;
        }
        
        

        if(args[1] == `cert`){            
            io.exec(`common:check_cert ${host} 443 "HTTPS SSL"`,  () => {
                io.exec(`common:check_cert ${host} 9997 "CLIENT TLS"`,  () => {
                    io.exit(0);           
                });           
            });           
            return;
        }

        if(args[1] == "ac"){
            io.exec(`common:check_url https://${host}/mifs/admin/vsp.html "Admin Portal"`, () => {
                io.exec(`common:check_url https://${host}/mifs/user "User Portal"`, () => {
                    io.exec(`common:check_url https://${host}:8443/mics "System Manager"`, () => {
                        io.exit(0);
                    });
                });
            });            
            return;
        }








        io.out(`Wrong argument`+io.EOL);
        io.exec( `${Core.command} help`, () =>{
            io.exit(-1);
        });
        return

    },

    help : (io: IO, args: string[]) => {
        io.out(`Usage : ${Core.command} <HOST> [cert | ac]${io.EOL}`);
        io.exit(0);
    },
    

    
}