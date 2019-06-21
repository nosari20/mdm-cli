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
const sshpk = require('sshpk');

const CA_Store = require('./models/CA_Store');

let win;

function createWindow() {


 
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

/*********************************************************************
****************************   IPC   *********************************
***********************************************************************/
function initIPC(){
  ipc_ssl();
  ipc_http();
  ipc_tcp_ping();
  ipc_file_read();
  ipc_storage();
  ipc_import_CA();
  ipc_delete_CA();

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

function ipc_import_CA(){
  ipc.on('import-ca', function (event, paramsJSON) {
    let params = JSON.parse(paramsJSON);
    file.read(params.fileName).then((res)=>{
      var cert = sshpk.Certificate.parse(res.content, 'pem')
      cert.pemEncoded = res.content;
      cert.id = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
      CA_Store.add(cert);
      let windows = BrowserWindow.getAllWindows();
      windows.forEach(function(w){
        w.webContents.send('import-ca', JSON.stringify(
            {
              imported : true
            }
          )
        );
      })  
    });
  }) 
}

function ipc_delete_CA(){
  ipc.on('delete-ca', function (event, paramsJSON) {
    let params = JSON.parse(paramsJSON);
    CA_Store.remove(params.id);
    let windows = BrowserWindow.getAllWindows();
      windows.forEach(function(w){
        w.webContents.send('delete-ca', JSON.stringify(
            {
              deleted : true
            }
          )
        );
      })
  }) 
}