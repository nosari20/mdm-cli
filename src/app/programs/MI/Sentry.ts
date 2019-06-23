import { IO } from '../../components/terminal/types/IO';
import { Program } from '../../components/terminal/types/Program';



export const Sentry: Program = <Program>{

    command: `mi:sentry`,

    descritpion: `MobileIron Sentry related tests`,

    main : (io: IO, args: string[]) => {
        if(args.length < 1){
            io.printerr(`Not enough args${io.EOL}`);
            io.exec(Sentry.command + ` help`, () =>{
                io.exit(-1);
            });
            return;
        }

        let host = args[0]; 
    
        
        if(args.length == 1){
            io.println(`Tests for ${host} : ${io.EOL+io.EOL}`);
            io.println(`Certificates :${io.EOL}`);
            io.exec(`${Sentry.command} ${host} cert`,() => {
                io.println(io.EOL);
                io.println(`Acess Control :${io.EOL}`);
                io.exec(`${Sentry.command} ${host} ac`,() => {
                    io.exit(0);
                });
            });
            return;
        }
        
        

        if(args[1] == `cert`){          
            io.exec(`check_cert ${host} 443 "HTTPS SSL"`,  () => {
                io.exit(0);
            });           
            return;
        }

        if(args[1] == `ac`){
            io.exec(`check_url https://${host}:8443/mics "System Manager"`,  () => {
                io.exit(0);
            });            
            return;
        }


        io.printerr(`Wrong argument`+io.EOL);
        io.exec( `${Sentry.command} help`, () =>{
            io.exit(-1);
        });
        return

    },

    help : (io: IO, args: string[]) => {
        io.println(`Usage : ${Sentry.command} <HOST> [cert | ac]${io.EOL}`);
        io.exit(0);
    },  
}