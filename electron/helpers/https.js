var https = require('https');
var http = require('http');
const tls = require('tls');
const CA_Store = require('../models/CA_Store');

function get(url, timeout = 5000){
    return request(url, 'GET', timeout);
}

function pemEncode(str, n) {
    var ret = [];
  
    for (var i = 1; i <= str.length; i++) {
      ret.push(str[i - 1]);
      var mod = i % n;
  
      if (mod === 0) {
        ret.push('\n');
      }
    }
  
    var returnString = `-----BEGIN CERTIFICATE-----\n${ret.join('')}\n-----END CERTIFICATE-----`;
  
    return returnString;
  }


function params(method, options){
    const secureContext = tls.createSecureContext();
    let CAs = CA_Store.list();
    for (let index = 0; index < CAs.length; index++) {
      const cert = CAs[index];
      secureContext.context.addCACert(cert.pemEncoded);
      
    }
    let params = {
        method: method,
        rejectUnauthorized: false,
        secureContext: secureContext,
        headers: {},
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
                        body: response_data,
                        certificate: (url.startsWith('https://') ? {
                            authorized : res.socket.authorized,
                            pemEncoded : pemEncode(res.socket.getPeerCertificate().raw.toString('base64'), 64)
                        } : false)
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