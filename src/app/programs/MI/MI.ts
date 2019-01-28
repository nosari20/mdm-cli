import { HttpClient, HttpXhrBackend, HttpResponse, HttpHeaders } from '@angular/common/http';
import { IO } from '../../types/IO';
import { Program } from '../../types/Program';
import {ElectronService} from 'ngx-electron';
import { protocol } from 'electron';



export const MI: Program = <Program>{

    command: 'mi:core',

    descritpion: 'MobileIron Core related tests',

    main : (io: IO, args: string[]) => {
        if(args.length < 1){
            io.out('Not enough args'+io.EOL);
            io.exec(MI.command + ' help', () =>{
                io.exit(-1);
            });
            return;
        }

        let host = args[0]; 
        
        if(args.length == 1){
            io.out('Tests for ' + host+io.EOL+io.EOL+io.EOL);
            io.out('Certificates :'+io.EOL+io.EOL);
            io.exec(MI.command + ' ' + host + ' cert',() => {
                io.out(io.EOL+'ACLs :'+io.EOL+io.EOL);
                io.exec(MI.command + ' ' + host + ' acl',() => {
                    io.exit(0);
                });
            });
            return;
        }
        
        

        if(args[1] == 'cert'){
            let testCerts = (host) => {
                const _electronService  = new ElectronService();
                const ipc = _electronService.ipcRenderer;

                let checkCert = (host: string, port: number, name: string, callback: () => void) => {

                    ipc.send('ssl', JSON.stringify({
                        host: host,
                        port: Math.trunc(port) || 443,
                        timeout: 5000
                    }));
    
                    const onCertReceive = function (event, resJSON) {
                        ipc.removeListener('ssl',onCertReceive);
                        let res = JSON.parse(resJSON);
                        io.out(name+' : '); 
                        if(res.errno){
                            io.out('Error ' + res.syscall + ' : ' + res.code+io.EOL, 'color:red');
                            return callback();;
                        }

                        let certificate = res;
                        if(certificate.authorized){
                            io.out('OK','color:green')                        
                        }else{
                            io.out('KO','color:red');
                        }
                        io.out(' <a href="data:application/data;base64,'+window.btoa(certificate.pemEncoded)+'" download="'+host+' '+name+'.cer">Download</a>');
                        io.out(io.EOL);
                        return callback();
                    }
                    ipc.on('ssl', onCertReceive);
                }

                checkCert(host, 443, 'HTTPS SSL', () => {
                    checkCert(host, 9997, 'CLIENT TLS', () => {
                        return io.exit(0);
                    });
                },);
            }
            return testCerts(host);
        }

        if(args[1] == "acl"){
            let testAcl = (host) => {
                let checkACL = (url: string, name: string, callback: () => void) => {
                    const _electronService  = new ElectronService();
                    const ipc = _electronService.ipcRenderer;
                    ipc.send('https', JSON.stringify({
                        url: url,
                        timeout: 5000
                    }));
    
                    const onRespReceive = function (event, resJSON) {
                        ipc.removeListener('https',onRespReceive);
                        let res = JSON.parse(resJSON);
                        io.out(name+' : '); 
                        if(res.errno){
                            if(res.code == 'ETIMEDOUT'){
                                io.out('Not reachable ('+ res.code+')'+io.EOL,'color:red')
                            }else{
                                io.out('Error ' + res.syscall + ' : ' + res.code+io.EOL, 'color:red');
                            }
                           return callback();
                        }


                        let statusCode = res.statusCode;
                        if(statusCode == 403){
                            io.out('Restricted','color:red')
                        }else{
                            io.out('Avaibale (HTTP '+statusCode+')','color:green');
                        }
                        io.out(io.EOL);                            

                        return callback();
                    }
                    ipc.on('https', onRespReceive);
                }
                checkACL('https://'+host+'/mifs/admin/vsp.html','Admin Portal', () => {
                    checkACL('https://'+host+'/mifs/user','User Portal ', () => {
                        checkACL('https://'+host+':8443/mics','System Manager', () => {
                            return io.exit(0);
                        });
                    });
                },);
            }
            return testAcl(host);
        }








        io.out('Wrong argument'+io.EOL);
        io.exec(MI.command + ' help', () =>{
            io.exit(-1);
        });
        return

        /*



        

        







        if(args.length < 1){
            io.out('Not enough args');
            io.exit(-1);
        }

        const _electronService  = new ElectronService();
        const ipc = _electronService.ipcRenderer;
        
        ipc.send('ssl', JSON.stringify({
            host: args[0],
            port: parseInt(args[1]) || 443
        }));

        const onCertReceive = function (event, certificateJSON) {
            ipc.removeListener('ssl',onCertReceive);
            let certificate = JSON.parse(certificateJSON);
            console.log(certificate);
            io.out(certificate.pemEncoded);
            io.exit(0);
        }
        ipc.on('ssl', onCertReceive);

        /*
        let httpClient: HttpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
        httpClient.get('https://tempmicore.ngnr.co.uk', {responseType: 'text'})
            .subscribe((res) => {
                io.out('google')
                console.log(res);
                io.exit(0);            
            });
        */

    },

    help : (io: IO, args: string[]) => {
        io.out('Usage //todo'+io.EOL);
        io.exit(0);
    },
    

    
}