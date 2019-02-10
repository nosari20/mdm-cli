let Sock = require('net');

function tcp_ping(host, port, timeout = 5000){

  return new Promise(function(resolve, reject)  {

    let socket = Sock.Socket();
    socket.connect(port,host, function() {});


    let startTime = process.hrtime()
    startTime = startTime[0] * 1e3 + startTime[1] * 1e-6;

    socket.on('connect', function() {
      socket.end();
    });
  
    socket.on('error', function(err) {
      if(err.errno == 'ECONNRESET'){
        let endTime = process.hrtime()
        endTime = endTime[0] * 1e3 + endTime[1] * 1e-6;
        return resolve({result: 'success', time: Math.ceil(endTime - startTime)});
      }
      return resolve(err);    
    });

    socket.setTimeout(2);
    
    socket.on('end', function(data) {
        let endTime = process.hrtime()
        endTime = endTime[0] * 1e3 + endTime[1] * 1e-6;
        return resolve({result: 'success', time: Math.ceil(endTime - startTime)});
    });

    setTimeout(() => {
      socket.destroy();
      return  resolve({
        errno: 'ETIMEDOUT',
        code: 'ETIMEDOUT',
        syscall: 'connect',
        port: (port?port:req.agent.defaultPort) 
      })
    }, timeout);
  })

}
module.exports = {
    tcp_ping: tcp_ping
};
