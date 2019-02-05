var https = require('https');
var http = require('http');

function get(url, timeout = 5000){
    return request(url, 'GET', timeout);
}


function params(method, options){
    let params = {
        method: method,
        rejectUnauthorized: false,
        headers: {}
    };

    if(options){
        if(options.auth){
            params.headers['Authorization'] = 'Basic ' + Buffer.from(options.auth.username + ':' + options.auth.password).toString('base64');
        }

        if(options.data){
            params.headers['Content-Type'] = 'application/json';
            params.headers['Content-Length'] = Buffer.byteLength((typeof options.data != 'string' ?JSON.stringify(options.data) : options.data));        
        }
    }

    return params;
}



function request(url, method, options, timeout = 5000,){

    return new Promise(function(resolve, reject) {

        let client = https;
        if(url.startsWith('http://')) client = http;
        
        try{
            let req = client.request(url, params(method, options), function(res) {
                let response_data = '';
                res.on("data", function(chunk) {
                    response_data+=chunk;
                });               
                res.on('end', () => {
                    resolve({
                        headers : res.headers,
                        statusCode:  res.statusCode,
                        body: response_data
                    }); 
                });
                
            });
        
            if(options && options.data){
                req.write((typeof data != 'string' ?JSON.stringify(options.data) : options.data));
            }       

            req.on('error', (err) => {
                resolve(err);
            });
            req.end();
            //timeout workaround
            setTimeout(() => {
                let port = req.getHeader("host").split(":")[1]
                req.abort();
                resolve({
                    errno: 'ETIMEDOUT',
                    code: 'ETIMEDOUT',
                    syscall: 'connect',
                    port: (port?port:req.agent.defaultPort) 
                })

            }, timeout);

        }catch(e){
            
            if(e.toString().includes("[ERR_INVALID_DOMAIN_NAME]")){
                resolve({
                    errno: 'ENOTFOUND',
                    code: 'ENOTFOUND',
                    syscall: 'getaddrinfo',
                });
            }else{
                resolve({
                    errno: 'EUNKNOWN',
                    code: 'EUNKNOWN',
                    syscall: 'unknown',
                });
            }
           
            return;
        }
    });

}

module.exports = {
  get: get,
  request: request
};