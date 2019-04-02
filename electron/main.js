console.log('Node : '+process.version);
console.log('Chomium : '+process.versions['chrome']);
const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const ipc = require('electron').ipcMain
const tls = require('./helpers/tls')
const https = require('./helpers/https');
const tcp_ping = require('./helpers/tcp-ping');
const file = require('./helpers/file');
const CA_Store = require('./models/CA_Store');

let win;

function createWindow() {


  

var certString = `
-----BEGIN CERTIFICATE-----
MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/
MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT
DkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow
PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD
Ew5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O
rz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq
OLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b
xiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw
7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD
aeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV
HQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG
SIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69
ikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr
AvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz
R8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5
JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo
Ob8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ
-----END CERTIFICATE-----

`


const CA_Store = require('./models/CA_Store');
CA_Store.empty();





const sshpk = require('sshpk');


var cert = sshpk.Certificate.parse(certString, 'pem')
cert.pemEncoded = certString;


CA_Store.add(cert);

console.log(CA_Store.list());

//return;

 
  win = new BrowserWindow({ 
    width: 800, 
    height: 600 , 
    frame: false,
    title: 'Cli',
    webPreferences: { webSecurity: false }
    
  });
  initIPC();   

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/cli/index.html`),
      protocol: "file:",
      slashes: true
    })
    
  );
  
  // The following is optional and will open the DevTools:
  win.webContents.openDevTools()

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow(); 
  }
});


function initIPC(){
  ipc_ssl();
  ipc_http();
  ipc_tcp_ping();
  ipc_file_read();
  ipc_storage();

}

function ipc_ssl(){
  ipc.on('ssl', function (event, serverJSON) {
    let server = JSON.parse(serverJSON);
    tls.check(server.host, server.port, server.timeout).then((certificate)=>{
      win.webContents.send('ssl', JSON.stringify(certificate));
    });
  }) 
}

function ipc_http(){
  ipc.on('http', function (event, optionsJSON) {
    let options = JSON.parse(optionsJSON);
    https.request(
      (options.url? options.url: 'https://localhost'),
      (options.method?options.method:'GET'),
      options.options,
      options.timeout
    ).then((res)=>{
      win.webContents.send('http', JSON.stringify(res));
    });
  })
}


function ipc_tcp_ping(){
  ipc.on('tcp_ping', function (event, serverJSON) {
    let server = JSON.parse(serverJSON);
    tcp_ping.tcp_ping(server.host, server.port, server.timeout).then((res)=>{
      win.webContents.send('tcp_ping', JSON.stringify(res));
    });
  }) 
}

function ipc_file_read(){
  ipc.on('file-read', function (event, paramsJSON) {
    let params = JSON.parse(paramsJSON);
    file.read(params.fileName).then((res)=>{
      win.webContents.send('file-read', JSON.stringify(res));
    });
  }) 
}

function ipc_storage(){
  ipc.on('storage', function (event, paramsJSON) {
    let params = JSON.parse(paramsJSON)
    params =  params || {};
    params.token =  params.token || '';

    let windows = BrowserWindow.getAllWindows();

    if(params.file){
      let store;
      switch(params.file){
        case 'ca':
          store = CA_Store;
          break;
        default:
          windows.forEach(function(w){
            w.webContents.send('storage#'+params.token, JSON.stringify({result:null}));
          })
          return;
      }

      
      if(store.hasOwnProperty(params.method)){ 
        let data = store[params.method](params.args);
        windows.forEach(function(w){
          w.webContents.send('storage#'+params.token, JSON.stringify(
              {
                result : data
              }
            )
          );
        })  
       
        return;
      }


    }
    windows.forEach(function(w){
      w.webContents.send('storage#'+params.token, JSON.stringify({result:null}));
    })

  }) 
}
