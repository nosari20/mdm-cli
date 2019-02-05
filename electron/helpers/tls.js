const tls = require('tls');

function check(host, port, timeout = 5000){

    port = port || 443;

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

    return new Promise(function(resolve, reject) {
        var socket = tls.connect(port, host, {rejectUnauthorized: false}, () => {
            let certificate = socket.getPeerCertificate();
            certificate.authorized = socket.authorized;
            certificate.pemEncoded = pemEncode(certificate.raw.toString('base64'), 64);
            socket.end();
            resolve(certificate);
        });
        socket.on('error', (err) => {
            resolve(err);
        });

        //timeout workaround
        setTimeout(() => {
            resolve({
                  errno: 'ETIMEDOUT',
                  code: 'ETIMEDOUT',
                  syscall: 'connect',
                  port: port 
            })

        }, timeout);
        

    });
}

module.exports = {
    check: check
  };
