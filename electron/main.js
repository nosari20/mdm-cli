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

let win;

function createWindow() {

 
  win = new BrowserWindow({ 
    width: 800, 
    height: 600 , 
    frame: false,
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
  //win.webContents.openDevTools()

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