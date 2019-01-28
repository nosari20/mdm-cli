var https = require('https');

function get(url, timeout = 5000){

    return new Promise(function(resolve, reject) {
        let req = https.request(url, {method: 'GET', rejectUnauthorized: false}, function(res) {
            let data = '';
            res.on("data", function(chunk) {
                 data+=chunk;
            });               
            res.on('end', () => {
                resolve({
                    headers : res.headers,
                    statusCode:  res.statusCode,
                    body: data
                }); 
            });
        });
        req.on('error', (err) => {
            resolve(err);
        });
        req.setTimeout(timeout, function() {
            req.abort();
        });
        req.end();
        //timeout workaround
        setTimeout(() => {
            resolve({
                  errno: 'ETIMEDOUT',
                  code: 'ETIMEDOUT',
                  syscall: 'connect',
                  port: 9997 
            })

        }, timeout);
    });
}

module.exports = {
  get: get
};