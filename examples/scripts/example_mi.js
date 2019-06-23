io.out('Enter Core host' + io.EOL);
io.in((host) =>{

    io.out('Enter Username' + io.EOL);
    io.in((username) =>{

        io.out('Enter Password' + io.EOL);
        io.in((password) =>{
            
            io.exec('http GET https://'+host+'/api/v2/ping --username='+username+' --password='+password, (res) => {
                if(res.exitCode < 0){
                    io.out('Error during http'+io.EOL,'color:red');
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
                    
                    switch(res.result.statusCode){
                        case 404 :
                            io.out('HTTP 404 : Not Found'+io.EOL);
                            break;
                        case 401 : 
                            io.out('HTTP 401 : Not Unauthorized'+io.EOL);
                            break;
                        default :
                            io.out('Connected'+io.EOL);
                            let json = JSON.parse(res.result.body);                            
                            io.out('Core version: '+json.results.vspVersion+io.EOL);
                            break;
                    }
                }
                io.exit(0);
            }, true);

        });

    });
    
})